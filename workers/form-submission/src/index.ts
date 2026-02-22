/**
 * Cloudflare Worker for VoteVega.nyc Form Submissions
 * Handles volunteer signups with Turnstile bot protection and NocoDB storage
 */

interface Env {
  TURNSTILE_SECRET_KEY: string;
  TURNSTILE_TEST_SECRET_KEY?: string;
  NOCODB_API_TOKEN: string;
  NOCODB_TABLE_ID: string;
  NOCODB_BASE_ID: string;
  NOCODB_API_URL: string;
  ALLOWED_ORIGINS: string;
  RESEND_API_KEY: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  zip: string;
  address?: string;
  source: string;
  'cf-turnstile-response': string;
  emailOptIn?: boolean;
  comment?: string;
}

interface NocoDBRow {
  Name: string;
  Email: string;
  Phone: string;
  Zip: string;
  Source: string;
  User_Agent: string;
  IP_Address: string;
  Turnstile_Verified: boolean;
  Submitted_At: string;
  Address?: string;
  Email_Opt_In?: boolean;
  Comment?: string;
}

// Rate limiting cache
const submissionCache = new Map<string, number[]>();

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCORS(request, env);
    }

    // Only allow POST requests
    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    try {
      // Verify origin
      const origin = request.headers.get('Origin');
      if (!isAllowedOrigin(origin, env)) {
        return jsonResponse({ error: 'Origin not allowed' }, 403, origin);
      }

      // Parse form data
      const contentType = request.headers.get('content-type') || '';
      let formData: Partial<FormData>;

      if (contentType.includes('application/json')) {
        formData = await request.json();
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        const body = await request.text();
        formData = parseFormData(body);
      } else {
        return jsonResponse({ error: 'Unsupported content type' }, 400, origin);
      }

      // Validate required fields
      const validation = validateFormData(formData);
      if (!validation.valid) {
        return jsonResponse({ error: validation.error }, 400, origin);
      }

      // Rate limiting check
      const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
      const rateLimitCheck = checkRateLimit(clientIP);
      if (!rateLimitCheck.allowed) {
        return jsonResponse({ error: 'Too many submissions. Please try again later.' }, 429, origin);
      }

      // Verify Turnstile token (optional - allow submissions without it)
      const turnstileToken = formData['cf-turnstile-response'];
      let turnstileVerified = false;
      
      if (turnstileToken) {
        const originHost = origin ? new URL(origin).hostname : null;
        turnstileVerified = await verifyTurnstile(turnstileToken, clientIP, env, originHost);
        
        if (!turnstileVerified) {
          console.warn('Turnstile verification failed but allowing submission');
        }
      } else {
        console.warn('No Turnstile token provided - likely blocked by browser extension');
      }

      // Submit to NocoDB
      const userAgent = request.headers.get('User-Agent') || 'Unknown';
      const submission: NocoDBRow = {
        Name: formData.name!,
        Email: formData.email!,
        Phone: formData.phone!,
        Zip: formData.zip!,
        Source: formData.source || 'homepage',
        User_Agent: userAgent.substring(0, 200),
        IP_Address: await hashIP(clientIP),
        Turnstile_Verified: turnstileVerified,
        Submitted_At: new Date().toISOString(),
      };
      
      // Add address if provided (for petition pledges)
      if (formData.address) {
        submission.Address = formData.address;
      }
      
      // Add email opt-in status (only true if explicitly opted in)
      submission.Email_Opt_In = formData.emailOptIn === true;
      
      // Add comment if provided
      if (formData.comment) {
        submission.Comment = formData.comment.substring(0, 500); // Limit to 500 chars
      }

      const nocodbSuccess = await submitToNocoDB(submission, env);
      if (!nocodbSuccess) {
        return jsonResponse({ error: 'Failed to save submission. Please try again.' }, 500, origin);
      }

      // Send confirmation email
      const emailSent = await sendConfirmationEmail(
        formData.name!,
        formData.email!,
        formData.source || 'homepage',
        env
      );
      
      if (!emailSent) {
        console.error('Failed to send confirmation email, but continuing');
        // Don't fail the request if email fails - data is already saved
      }

      // Record successful submission for rate limiting
      recordSubmission(clientIP);

      return jsonResponse(
        {
          success: true,
          message: 'Thank you for signing up! We will be in touch soon.',
        },
        200,
        origin
      );
    } catch (error) {
      console.error('Form submission error:', error);
      const origin = request.headers.get('Origin');
      return jsonResponse({ error: 'Internal server error' }, 500, origin);
    }
  },
};

/**
 * Verify Turnstile token with Cloudflare
 */
async function verifyTurnstile(
  token: string,
  ip: string,
  env: Env,
  originHost: string | null
): Promise<boolean> {
  try {
    // Use test secret for Netlify previews, real secret for production
    const isPreview = originHost && originHost.endsWith('.netlify.app');
    const secret = isPreview && env.TURNSTILE_TEST_SECRET_KEY
      ? env.TURNSTILE_TEST_SECRET_KEY
      : env.TURNSTILE_SECRET_KEY;

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret,
        response: token,
        remoteip: ip,
      }),
    });

    const data: any = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return false;
  }
}

/**
 * Submit data to NocoDB
 */
async function submitToNocoDB(data: NocoDBRow, env: Env): Promise<boolean> {
  try {
    const url = `${env.NOCODB_API_URL}/api/v2/tables/${env.NOCODB_TABLE_ID}/records`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'xc-token': env.NOCODB_API_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('NocoDB API error:', response.status, errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('NocoDB submission error:', error);
    return false;
  }
}

/**
 * Validate form data
 */
function validateFormData(data: Partial<FormData>): { valid: boolean; error?: string } {
  if (!data.name || data.name.trim().length < 2) {
    return { valid: false, error: 'Name is required' };
  }

  if (!data.email || !isValidEmail(data.email)) {
    return { valid: false, error: 'Valid email is required' };
  }

  if (!data.phone || data.phone.trim().length < 10) {
    return { valid: false, error: 'Valid phone number is required' };
  }

  if (!data.zip || data.zip.trim().length < 5) {
    return { valid: false, error: 'Valid ZIP code is required' };
  }

  return { valid: true };
}

/**
 * Email validation
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Rate limiting: 3 submissions per IP per hour
 */
function checkRateLimit(ip: string): { allowed: boolean; remaining?: number } {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  const maxSubmissions = 3;

  const submissions = submissionCache.get(ip) || [];
  const recentSubmissions = submissions.filter(time => now - time < oneHour);

  if (recentSubmissions.length >= maxSubmissions) {
    return { allowed: false };
  }

  return { allowed: true, remaining: maxSubmissions - recentSubmissions.length };
}

/**
 * Record submission for rate limiting
 */
function recordSubmission(ip: string): void {
  const now = Date.now();
  const submissions = submissionCache.get(ip) || [];
  submissions.push(now);
  submissionCache.set(ip, submissions);

  // Cleanup old entries
  if (submissionCache.size > 10000) {
    const entries = Array.from(submissionCache.entries());
    const oneHour = 60 * 60 * 1000;
    entries.forEach(([key, times]) => {
      const recent = times.filter(t => now - t < oneHour);
      if (recent.length === 0) {
        submissionCache.delete(key);
      } else {
        submissionCache.set(key, recent);
      }
    });
  }
}

/**
 * Hash IP address for privacy
 */
async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + 'votevega-salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
}

/**
 * Parse URL-encoded form data
 */
function parseFormData(body: string): Partial<FormData> {
  const params = new URLSearchParams(body);
  const emailOptInParam = params.get('emailOptIn');
  return {
    name: params.get('name') || '',
    email: params.get('email') || '',
    phone: params.get('phone') || '',
    zip: params.get('zip') || '',
    address: params.get('address') || undefined,
    source: params.get('whichform') || params.get('source') || '',
    'cf-turnstile-response': params.get('cf-turnstile-response') || '',
    emailOptIn: emailOptInParam === null ? undefined : emailOptInParam === 'true',
    comment: params.get('comment') || undefined,
  };
}

/**
 * Check if origin is allowed (supports wildcards)
 */
function isAllowedOrigin(origin: string | null, env: Env): boolean {
  if (!origin) return false;
  const allowed = env.ALLOWED_ORIGINS.split(',').map(o => o.trim());
  
  // Check exact matches first
  if (allowed.includes(origin)) return true;
  
  // Check wildcard matches
  return allowed.some(pattern => {
    if (!pattern.includes('*')) return false;
    // Convert wildcard pattern to regex: escape special chars except *
    const regexPattern = pattern
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*');
    const regex = new RegExp('^' + regexPattern + '$');
    return regex.test(origin);
  });
}

/**
 * Handle CORS preflight
 */
function handleCORS(request: Request, env: Env): Response {
  const origin = request.headers.get('Origin');
  if (!origin || !isAllowedOrigin(origin, env)) {
    return new Response(null, { status: 403 });
  }

  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

/**
 * Send confirmation email via Resend
 * Uses Resend templates for main signup sources, falls back to inline HTML for events
 */
async function sendConfirmationEmail(
  name: string,
  email: string,
  source: string,
  env: Env
): Promise<boolean> {
  try {
    const firstName = name.split(' ')[0];
    
    // Map sources to Resend template IDs
    const templateIds: Record<string, string> = {
      'homepage': '529625f0-8372-409f-b100-889555d4d8b4',
      'petition-pledge': '26b241dc-8000-403f-a1f8-9afb840d265f',
      'stripe': '5346d0a4-9407-462f-9b61-c69c5f2e2087',
    };
    
    const templateId = templateIds[source];
    
    let payload: Record<string, any>;
    
    if (templateId) {
      // Use Resend template
      payload = {
        from: 'Vega for Congress <info@votevega.nyc>',
        to: [email],
        template: {
          id: templateId,
          variables: {
            FIRST_NAME_VAR: firstName,
          },
        },
      };
    } else {
      // Fallback to inline HTML for event-specific or unknown sources
      let subject = 'Welcome to Vega for Congress';
      let html = `
        <h2>Hi ${firstName}, welcome to our movement</h2>
        <p>Thank you for signing up to support Jose Vega's campaign for Congress in New York's 15th District.</p>
        <p>Stay tuned for further updates from the Vega for Congress team about:</p>
        <ul>
          <li>Upcoming events and town halls</li>
          <li>Volunteer opportunities</li>
          <li>Campaign news and policy updates</li>
        </ul>
        <p>Visit our website: <a href="https://votevega.nyc">votevega.nyc</a></p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">Paid for by Vega for Congress<br>Bronx, NY 10459</p>
      `;
      
      // Event-specific templates
      if (source === 'nov-2-town-hall') {
        subject = 'Confirming your RSVP for November 2nd Town Hall';
        html = `<h2>Hi ${firstName}, thanks for registering for our upcoming town hall.</h2><p>The town hall will take place at 3pm in the Longwood neighborhood of the Bronx. We will be in touch with the exact location closer to the event.</p><p>If you can't make it in person, you can catch the event livestream here: <a href="https://us02web.zoom.us/j/8041129932?omn=86781836212">https://us02web.zoom.us/j/8041129932?omn=86781836212</a></p>`;
      }
      // Add more event-specific templates here as needed
      
      payload = {
        from: 'Vega for Congress <info@votevega.nyc>',
        to: [email],
        subject: subject,
        html: html,
      };
    }
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resend API error:', response.status, errorText);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}

/**
 * JSON response helper
 */
function jsonResponse(data: any, status: number = 200, origin?: string | null): Response {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (origin) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return new Response(JSON.stringify(data), { status, headers });
}
