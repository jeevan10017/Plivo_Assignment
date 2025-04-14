
import crypto from 'crypto';


export const isValidClerkOrgId = (id) => {
  return typeof id === 'string' && id.startsWith('org_') && id.length === 32;
};

export const generateSlug = (str) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};


export const isValidSlug = (slug) => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
};

// Generate webhook signature
export const generateWebhookSignature = (payload, secret) => {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  return hmac.digest('hex');
};

// Validate webhook signature
export const validateWebhookSignature = (payload, signature, secret) => {
  const expectedSignature = generateWebhookSignature(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
};
