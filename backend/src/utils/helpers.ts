import sanitizeHtml from 'sanitize-html';
import { FastifyRequest } from 'fastify';

// Sanitize HTML content to prevent XSS
export function sanitizeContent(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'li', 'ol',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
      'img', 'figure', 'figcaption',
    ],
    allowedAttributes: {
      a: ['href', 'title', 'target'],
      code: ['class'],
      pre: ['class'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
      figure: ['class'],
      figcaption: ['class'],
    },
    allowedSchemes: ['http', 'https', 'data'],
    allowedSchemesByTag: {
      img: ['http', 'https', 'data'],
    },
    disallowedTagsMode: 'discard',
  });
}

// Validate JSON is valid n8n workflow
export function isValidN8nWorkflow(json: Record<string, any>): boolean {
  // Basic validation - check for required n8n properties
  return (
    json &&
    typeof json === 'object' &&
    'nodes' in json &&
    'connections' in json &&
    Array.isArray(json.nodes)
  );
}

// Generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Get user IP address from request
export function getUserIp(request: FastifyRequest): string {
  const forwardedFor = request.headers['x-forwarded-for'];
  if (forwardedFor) {
    return Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor.split(',')[0];
  }
  return request.ip;
}

// Get user agent from request
export function getUserAgent(request: FastifyRequest): string {
  return request.headers['user-agent'] || 'unknown';
}

// Create pagination metadata
export function createPaginationMeta(page: number, limit: number, total: number) {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

// Extract tags from comma-separated string
export function parseTags(tagsString?: string): string[] {
  if (!tagsString) return [];
  return tagsString
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}
