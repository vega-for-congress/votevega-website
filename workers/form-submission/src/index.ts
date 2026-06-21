/**
 * Cloudflare Worker for VoteVega.nyc Form Submissions
 * Handles volunteer signups with Turnstile bot protection and VegaVan sync.
 *
 * EMAIL TEMPLATES: Front-end developers can create new signup form -> custom email
 * flows without modifying this worker. Place an HTML file in static/emails/{source}.html
 * on the Hugo site (where {source} matches the form's source field). The worker will
 * fetch it automatically, replace {{FIRST_NAME}}, and extract the subject line from
 * <meta name="email-subject" content="...">. See fetchStaticEmailTemplate() below.
 */

interface Env {
  TURNSTILE_SECRET_KEY: string;
  TURNSTILE_TEST_SECRET_KEY?: string;
  ALLOWED_ORIGINS: string;
  RESEND_API_KEY: string;
  SIGNUP_NOTIFICATION_EMAILS?: string;
  VEGAVAN_API_URL: string;
  VEGAVAN_API_KEY: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  zip?: string;
  address?: string;
  source: string;
  'cf-turnstile-response': string;
  emailOptIn?: boolean;
  comment?: string;
  registeredVoter?: string;
  availability?: string;
  interests?: string[];
  selectedShift?: string;
  selectedShifts?: string[];
  school?: string;
  grade?: string;
  goals?: string;
}

interface SubmissionRecord {
  name: string;
  email: string;
  phone: string;
  zip: string;
  source: string;
  userAgent: string;
  ipHash: string;
  turnstileVerified: boolean;
  submittedAt: string;
  Address?: string;
  emailOptIn: boolean;
  comment: string;
  registeredVoter: string;
  availability: string;
  interests: string[];
  selectedShift: string;
  selectedShifts: string[];
  school: string;
  grade: string;
  goals: string;
}

function buildSubmissionComment(formData: Partial<FormData>): string {
  const commentParts: string[] = [];

  if (formData.comment) {
    commentParts.push(formData.comment.trim());
  }

  if (formData.school) {
    commentParts.push(`School: ${formData.school.trim()}`);
  }

  if (formData.grade) {
    commentParts.push(`Grade/Year: ${formData.grade.trim()}`);
  }

  if (formData.goals) {
    commentParts.push(`What they want out of it: ${formData.goals.trim()}`);
  }

  if (formData.interests && formData.interests.length > 0) {
    commentParts.push(`Volunteer interests: ${formData.interests.map((value) => value.trim()).filter(Boolean).join(', ')}`);
  }

  if (formData.selectedShift) {
    commentParts.push(`Selected canvass shift: ${formData.selectedShift.trim()}`);
  }

  if (formData.selectedShifts && formData.selectedShifts.length > 0) {
    commentParts.push(`Selected canvass dates: ${formData.selectedShifts.map((value) => value.trim()).filter(Boolean).join(', ')}`);
  }

  return commentParts.join('\n\n').substring(0, 2000);
}

function buildSubmissionRecord(
  formData: Partial<FormData>,
  userAgent: string,
  ipHash: string,
  turnstileVerified: boolean,
  submittedAt: string
): SubmissionRecord {
  return {
    name: formData.name!,
    email: formData.email!,
    phone: formData.phone!,
    zip: formData.zip?.trim() || '',
    source: formData.source || 'homepage',
    userAgent: userAgent.substring(0, 200),
    ipHash,
    turnstileVerified,
    submittedAt,
    Address: formData.address?.trim() || '',
    emailOptIn: formData.emailOptIn === true,
    comment: buildSubmissionComment(formData),
    registeredVoter: formData.registeredVoter?.trim() || '',
    availability: formData.availability?.trim() || '',
    interests: (formData.interests || []).map((value) => value.trim()).filter(Boolean),
    selectedShift: formData.selectedShift?.trim() || '',
    selectedShifts: (formData.selectedShifts || []).map((value) => value.trim()).filter(Boolean),
    school: formData.school?.trim() || '',
    grade: formData.grade?.trim() || '',
    goals: formData.goals?.trim() || '',
  };
}

async function postToVegavan(path: string, payload: unknown, env: Env): Promise<Response> {
  return fetch(`${env.VEGAVAN_API_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.VEGAVAN_API_KEY}`
    },
    body: JSON.stringify(payload)
  });
}

function shouldFallbackToIngest(status: number): boolean {
  if ([401, 403].includes(status)) {
    return false;
  }

  return [400, 404, 405, 409, 422, 501].includes(status);
}

async function submitToVegavan(submission: SubmissionRecord, env: Env): Promise<boolean> {
  const nameParts = submission.name.trim().split(/\s+/);
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ') || '';

  const upsertPayload = {
    contact: {
      email: submission.email,
      phone: submission.phone,
      first_name: firstName,
      last_name: lastName,
      zip: submission.zip || undefined,
      address: submission.Address || undefined,
    },
    volunteer: {
      source: submission.source,
      volunteer_interest: true,
      volunteer_interests: submission.interests,
      canvass_step_completed: submission.source === 'volunteer-canvass',
      selected_canvass_dates: submission.selectedShifts,
      selected_canvass_shift: submission.selectedShift || undefined,
      registered_voter: submission.registeredVoter || undefined,
      availability: submission.availability || undefined,
      school: submission.school || undefined,
      grade: submission.grade || undefined,
      goals: submission.goals || undefined,
      email_opt_in: submission.emailOptIn,
      turnstile_verified: submission.turnstileVerified,
      submitted_at: submission.submittedAt,
      user_agent: submission.userAgent,
      ip_hash: submission.ipHash,
    },
    append_note: submission.comment || undefined,
  };

  const fallbackPayload = {
    contacts: [{
      email: submission.email,
      phone: submission.phone,
      first_name: firstName,
      last_name: lastName,
      zip: submission.zip || undefined,
      address: submission.Address || undefined,
      source: submission.source,
      city: '',
      state: '',
      volunteer_interest: true,
      volunteer_interests: submission.interests,
      canvass_step_completed: submission.source === 'volunteer-canvass',
      selected_canvass_dates: submission.selectedShifts,
      selected_canvass_shift: submission.selectedShift || undefined,
      registered_voter: submission.registeredVoter || undefined,
      availability: submission.availability || undefined,
      school: submission.school || undefined,
      grade: submission.grade || undefined,
      goals: submission.goals || undefined,
      comment: submission.comment || '',
      email_opt_in: submission.emailOptIn,
      turnstile_verified: submission.turnstileVerified,
      form_submitted_at: submission.submittedAt,
      user_agent: submission.userAgent,
      ip_hash: submission.ipHash,
    }]
  };

  try {
    console.log(`Submitting to VegaVan for ${submission.email} (source: ${submission.source})`);

    const upsertResponse = await postToVegavan('/api/contacts/upsert', upsertPayload, env);
    console.log(`VegaVan upsert response for ${submission.email}: ${upsertResponse.status} ${upsertResponse.statusText}`);

    if (upsertResponse.ok) {
      return true;
    }

    const upsertErrorText = await upsertResponse.text();
    console.error(`VegaVan upsert error ${upsertResponse.status}:`, upsertErrorText);

    if (!shouldFallbackToIngest(upsertResponse.status)) {
      return false;
    }

    const ingestResponse = await postToVegavan('/api/contacts/ingest', fallbackPayload, env);
    console.log(`VegaVan ingest fallback response for ${submission.email}: ${ingestResponse.status} ${ingestResponse.statusText}`);

    if (!ingestResponse.ok) {
      const ingestErrorText = await ingestResponse.text();
      console.error(`VegaVan ingest fallback error ${ingestResponse.status}:`, ingestErrorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('VegaVan submission error:', error);
    return false;
  }
}

// Rate limiting cache
const submissionCache = new Map<string, number[]>();

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
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

      const userAgent = request.headers.get('User-Agent') || 'Unknown';
      const submission = buildSubmissionRecord(
        formData,
        userAgent,
        await hashIP(clientIP),
        turnstileVerified,
        new Date().toISOString()
      );

      const vegavanSuccess = await submitToVegavan(submission, env);
      if (!vegavanSuccess) {
        return jsonResponse({ error: 'Failed to save submission. Please try again.' }, 500, origin);
      }

      recordSubmission(clientIP);

      ctx.waitUntil(
        (async () => {
          const [audienceAdded, emailSent, notificationSent] = await Promise.all([
            addToResendContacts(submission.name, submission.email, env),
            sendConfirmationEmail(submission.name, submission.email, submission.source, env),
            sendSignupNotification(
              {
                name: submission.name,
                email: submission.email,
                phone: submission.phone,
                zip: submission.zip,
                address: submission.Address || '',
                source: submission.source,
                comment: submission.comment,
                registeredVoter: submission.registeredVoter,
                availability: submission.availability,
                interests: submission.interests,
                selectedShifts: submission.selectedShifts,
                emailOptIn: submission.emailOptIn,
                turnstileVerified: submission.turnstileVerified,
                submittedAt: submission.submittedAt,
              },
              env
            ),
          ]);

          if (!audienceAdded) {
            console.error('Failed to add contact to Resend, but continuing');
          }
          if (!emailSent) {
            console.error('Failed to send confirmation email, but continuing');
          }
          if (!notificationSent) {
            console.error('Failed to send internal signup notification, but continuing');
          }
        })()
      );

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
 * Add contact to Resend for broadcast emails
 */
async function addToResendContacts(
  name: string,
  email: string,
  env: Env
): Promise<boolean> {
  try {
    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || undefined;

    const response = await fetch(
      'https://api.resend.com/contacts',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          first_name: firstName,
          ...(lastName && { last_name: lastName }),
          unsubscribed: false,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resend contacts API error:', response.status, errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Resend contacts error:', error);
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

  const noZipSources = new Set(['independent-ballot-petitioning', 'phonebanking', 'volunteer-canvass']);
  const requiresZip = !noZipSources.has(data.source || '');
  if (requiresZip && (!data.zip || data.zip.trim().length < 5)) {
    return { valid: false, error: 'Valid ZIP code is required' };
  }

  if (data.source === 'independent-ballot-petitioning') {
    if (!data.address || data.address.trim().length < 10) {
      return { valid: false, error: 'Registered address is required' };
    }

    if (!data.registeredVoter || data.registeredVoter.trim().length < 2) {
      return { valid: false, error: 'Please tell us if you are a registered New York voter' };
    }

    if (!data.availability || data.availability.trim().length < 10) {
      return { valid: false, error: 'Please share your availability from April 14 to May 7 (minimum 10 characters)' };
    }
  }

  if (data.source === 'phonebanking' && (!data.availability || data.availability.trim().length < 5)) {
    return { valid: false, error: 'Please tell us when you are available to phonebank' };
  }

  if (data.source === 'volunteer-signup') {
    if (!Array.isArray(data.interests) || data.interests.length === 0) {
      return { valid: false, error: 'Please choose at least one way you want to help' };
    }
  }

  if (data.source === 'volunteer-canvass') {
    if (!Array.isArray(data.selectedShifts) || data.selectedShifts.length === 0) {
      return { valid: false, error: 'Please choose at least one canvass date' };
    }
  }

  if (data.source === 'summer-internship') {
    if (!data.school || data.school.trim().length < 2) {
      return { valid: false, error: 'School is required' };
    }

    if (!data.grade || data.grade.trim().length < 2) {
      return { valid: false, error: 'Grade or year is required' };
    }

    if (!data.availability || data.availability.trim().length < 20) {
      return { valid: false, error: 'Please confirm your availability for the internship schedule' };
    }

    if (!data.goals || data.goals.trim().length < 10) {
      return { valid: false, error: 'Please tell us what you want out of the internship' };
    }
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
    registeredVoter: params.get('registeredVoter') || undefined,
    availability: params.get('availability') || undefined,
    interests: params.getAll('interests'),
    selectedShift: params.get('selectedShift') || undefined,
    selectedShifts: params.getAll('selectedShifts'),
    school: params.get('school') || undefined,
    grade: params.get('grade') || undefined,
    goals: params.get('goals') || undefined,
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
 * Fetch an email template from the static site.
 * Templates live at https://votevega.nyc/emails/{source}.html and may contain:
 *   - <meta name="email-subject" content="..."> for the subject line
 *   - {{FIRST_NAME}} for variable replacement
 * Returns null if no template exists for this source.
 */
async function fetchStaticEmailTemplate(
  source: string,
  firstName: string
): Promise<{ subject: string; html: string } | null> {
  // Sanitize source to prevent path traversal
  const sanitized = source.replace(/[^a-z0-9-]/g, '');
  if (!sanitized || sanitized !== source) {
    return null;
  }

  const url = `https://votevega.nyc/emails/${sanitized}.html`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }

    let html = await response.text();
    html = html.replace(/\{\{FIRST_NAME\}\}/g, firstName);

    // Extract subject from <meta name="email-subject" content="..."> if present
    const subjectMatch = html.match(/<meta\s+name=["']email-subject["']\s+content=["']([^"']+)["']\s*\/?>/i);
    const subject = subjectMatch ? subjectMatch[1] : 'Vega for Congress';

    return { subject, html };
  } catch (error) {
    console.error(`Failed to fetch email template from ${url}:`, error);
    return null;
  }
}

/**
 * Send confirmation email via Resend
 * Priority: Resend template IDs > hardcoded event HTML > static site template > generic fallback
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

      // Event-specific hardcoded templates (legacy — new events should use static templates)
      if (source === 'nov-2-town-hall') {
        subject = 'Confirming your RSVP for November 2nd Town Hall';
        html = `<h2>Hi ${firstName}, thanks for registering for our upcoming town hall.</h2><p>The town hall will take place at 3pm in the Longwood neighborhood of the Bronx. We will be in touch with the exact location closer to the event.</p><p>If you can't make it in person, you can catch the event livestream here: <a href="https://us02web.zoom.us/j/8041129932?omn=86781836212">https://us02web.zoom.us/j/8041129932?omn=86781836212</a></p>`;
      }
      if (source === 'monday-night-emergency-townhall') {
        subject = 'You are confirmed: Win the Revolution Against the Epstein Class!';
        html = `
          <h2>Hi ${firstName}, thanks for signing up.</h2>
          <p>Your registration is confirmed for <strong>Win the Revolution Against the Epstein Class!</strong></p>
          <p><em>Shut down the Hellfire club</em></p>
          <p><strong>Date:</strong> Monday, March 16, 2026<br>
          <strong>Time:</strong> 8:00 PM - 9:00 PM EDT<br>
          <strong>Format:</strong> Online</p>
          <p><strong>Join the Zoom townhall here:</strong><br>
          <a href="https://secure.sareforpresident.com/r?u=b_ZoCRUWNR8J1NoAhI-5oV3_j26tlEun5UhOW5XvmvCYlUERLybUKRz1_DpNafb7J8cIpST0Dafh9e3t_UVe1nbnK-Hj8wcQWwuVJC-fv1k&e=54057b4c7280bd289bade5fe6d935bf7&utm_source=sareforpresident&utm_medium=email&utm_campaign=20260316_activists_reminder&n=2">Join the townhall on Zoom</a></p>
          <p>Please keep this link handy so you can join right at 8:00 PM EDT.</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">Paid for by Vega for Congress<br>Bronx, NY 10459</p>
        `;
      }

      // If source didn't match any hardcoded event, try fetching a static template
      if (subject === 'Welcome to Vega for Congress') {
        const staticTemplate = await fetchStaticEmailTemplate(source, firstName);
        if (staticTemplate) {
          subject = staticTemplate.subject;
          html = staticTemplate.html;
        }
      }

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

function parseNotificationRecipients(env: Env): string[] {
  return String(env.SIGNUP_NOTIFICATION_EMAILS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

async function sendSignupNotification(
  submission: {
    name: string;
    email: string;
    phone: string;
    zip: string;
    address: string;
    source: string;
    comment: string;
    registeredVoter: string;
    availability: string;
    interests: string[];
    selectedShifts: string[];
    emailOptIn: boolean;
    turnstileVerified: boolean;
    submittedAt: string;
  },
  env: Env
): Promise<boolean> {
  if (submission.source === 'stripe') {
    // Don't send internal notifications for stripe
    return true;
  }

  const recipients = parseNotificationRecipients(env);
  if (recipients.length === 0) {
    return true;
  }

  try {
    const subject = `New VoteVega signup: ${submission.name} (${submission.source})`;
    const rows = [
      ['Name', submission.name],
      ['Email', submission.email],
      ['Phone', submission.phone],
      ['ZIP', submission.zip || 'Not provided'],
      ['Address', submission.address || 'Not provided'],
      ['Source', submission.source],
      ['Email opt-in', submission.emailOptIn ? 'Yes' : 'No'],
      ['Turnstile verified', submission.turnstileVerified ? 'Yes' : 'No'],
      ['Registered NY voter', submission.registeredVoter || 'Not provided'],
      ['Availability', submission.availability || 'Not provided'],
      ['Volunteer interests', submission.interests.length > 0 ? submission.interests.join(', ') : 'Not provided'],
      ['Selected canvass dates', submission.selectedShifts.length > 0 ? submission.selectedShifts.join(', ') : 'Not provided'],
      ['Comment', submission.comment || 'Not provided'],
      ['Submitted at', submission.submittedAt],
    ];

    const html = `
      <h2>New volunteer signup received</h2>
      <p>A new signup was submitted through votevega.nyc.</p>
      <table cellpadding="8" cellspacing="0" border="1" style="border-collapse: collapse; border-color: #d1d5db;">
        <tbody>
          ${rows
            .map(
              ([label, value]) =>
                `<tr><th align="left" style="background:#f8fafc;">${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`
            )
            .join('')}
        </tbody>
      </table>
    `;

    const text = rows.map(([label, value]) => `${label}: ${value}`).join('\n');

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Vega for Congress <info@votevega.nyc>',
        to: recipients,
        reply_to: submission.email,
        subject,
        html,
        text,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Signup notification email error:', response.status, errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Signup notification send error:', error);
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
