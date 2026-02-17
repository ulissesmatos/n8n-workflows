import { FastifyRequest, FastifyReply } from 'fastify';

// Authenticate admin user via JWT
export async function authenticateAdmin(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({
      statusCode: 401,
      message: 'Unauthorized - Invalid or missing token',
    });
  }
}

// Verify JWT and extract user ID
export async function verifyToken(request: FastifyRequest): Promise<string> {
  try {
    const decoded = request.user as any;
    return decoded.sub;
  } catch (err) {
    throw new Error('Invalid token');
  }
}

// Rate limiting decorator for specific high-risk routes
export const RATE_LIMIT_CONFIG = {
  STRICT: { max: 5, timeWindow: '1 minute' },
  MODERATE: { max: 30, timeWindow: '10 minutes' },
  LIGHT: { max: 100, timeWindow: '15 minutes' },
};
