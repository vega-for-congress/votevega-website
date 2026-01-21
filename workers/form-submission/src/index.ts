/**
 * Cloudflare Worker for VoteVega.nyc Form Submissions
 * Handles volunteer signups with Turnstile bot protection and Baserow storage
 */

interface Env {
  TURNSTILE_SECRET_KEY: string;
  BASEROW_API_TOKEN: string;
  BASEROW_DB_ID: string;
  BASEROW_API_URL: string;
  ALLOWED_ORIGINS: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  zip: string;
  source: string;
  'cf-turnstile-response': string;
}

interface BaserowRow {
  Name: string;
  Email: string;
  Phone: string;
  Zip: string;
  Source: string;
  'User Agent': string;
  'IP Address': string;
  'Submitted At': string;
  'Turnstile Verified': boolean;
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

      // Verify Turnstile token
      const turnstileToken = formData['cf-turnstile-response'];
      if (!turnstileToken) {
        return jsonResponse({ error: 'Bot verification required' }, 400, origin);
      }

      const turnstileValid = await verifyTurnstile(turnstileToken, clientIP, env);
      if (!turnstileValid) {
        return jsonResponse({ error: 'Bot verification failed' }, 403, origin);
      }

      // Submit to Baserow
      const userAgent = request.headers.get('User-Agent') || 'Unknown';
      const submission: BaserowRow = {
        Name: formData.name!,
        Email: formData.email!,
        Phone: formData.phone!,
        Zip: formData.zip!,
        Source: formData.source || 'homepage',
        'User Agent': userAgent.substring(0, 200), // Limit length
        'IP Address': hashIP(clientIP), // Hash for privacy
        'Submitted At': new Date().toISOString(),
        'Turnstile Verified': true,
      };

      const baserowSuccess = await submitToBaserow(submission, env);
      if (!baserowSuccess) {
        return jsonResponse({ error: 'Failed to save submission. Please try again.' }, 500, origin);
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
async function verifyTurnstile(token: string, ip: string, env: Env): Promise<boolean> {
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: env.TURNSTILE_SECRET_KEY,
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
 * Submit data to Baserow
 */
async function submitToBaserow(data: BaserowRow, env: Env): Promise<boolean> {
  try {
    const url = `${env.BASEROW_API_URL}/${env.BASEROW_DB_ID}/`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Token ${env.BASEROW_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Baserow API error:', response.status, errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Baserow submission error:', error);
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
  return {
    name: params.get('name') || '',
    email: params.get('email') || '',
    phone: params.get('phone') || '',
    zip: params.get('zip') || '',
    source: params.get('whichform') || params.get('source') || '',
    'cf-turnstile-response': params.get('cf-turnstile-response') || '',
  };
}

/**
 * Check if origin is allowed
 */
function isAllowedOrigin(origin: string | null, env: Env): boolean {
  if (!origin) return false;
  const allowed = env.ALLOWED_ORIGINS.split(',').map(o => o.trim());
  return allowed.includes(origin);
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
