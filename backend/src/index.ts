import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';

// Load environment variables
dotenv.config();

// Route imports
import workflowRoutes from './routes/workflows.js';
import adminRoutes from './routes/admin.js';
import embedRoutes from './routes/embed.js';
import healthRoutes from './routes/health.js';
import categoryRoutes from './routes/categories.js';

// Types
declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

const prisma = new PrismaClient();

async function ensureDefaultAdmin(prismaClient: PrismaClient) {
  const email = process.env.DEFAULT_ADMIN_EMAIL;
  const password = process.env.DEFAULT_ADMIN_PASSWORD;

  if (!email || !password) {
    return;
  }

  const existing = await prismaClient.adminUser.findUnique({ where: { email } });
  if (existing) {
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const apiKey = randomBytes(32).toString('hex');

  await prismaClient.adminUser.create({
    data: {
      email,
      password: hashedPassword,
      apiKey,
    },
  });

  console.log(`Default admin created: ${email}`);
}

async function main() {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
    },
  });

  // Attach Prisma to Fastify instance
  fastify.decorate('prisma', prisma);

  // Security middleware
  await fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  });

  // CORS configuration
  await fastify.register(cors, {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // JWT setup
  await fastify.register(jwt, {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    sign: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  });

  // Rate limiting
  await fastify.register(rateLimit, {
    max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    timeWindow: process.env.RATE_LIMIT_WINDOW_MS || '15 minutes',
    skipOnError: true,
    errorResponseBuilder: () => ({
      statusCode: 429,
      message: 'Too many requests, please retry later.',
    }),
  });

  await ensureDefaultAdmin(prisma);

  // Health check route
  await fastify.register(healthRoutes);

  // Public API routes
  await fastify.register(workflowRoutes, { prefix: '/api/v1/workflows' });
  await fastify.register(categoryRoutes, { prefix: '/api/v1/categories' });

  // Embed route (special lightweight mode)
  await fastify.register(embedRoutes, { prefix: '/api/v1/embed' });

  // Admin routes (protected)
  await fastify.register(adminRoutes, { prefix: '/api/v1/admin' });

  // Global error handler
  fastify.setErrorHandler((error, request, reply) => {
    fastify.log.error(error);

    if (error.statusCode === 429) {
      return reply.status(429).send({
        statusCode: 429,
        message: 'Too many requests',
      });
    }

    if (error.statusCode === 401) {
      return reply.status(401).send({
        statusCode: 401,
        message: 'Unauthorized',
      });
    }

    return reply.status(error.statusCode || 500).send({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal Server Error',
    });
  });

  // Graceful shutdown
  const signals = ['SIGINT', 'SIGTERM'];
  signals.forEach((signal) => {
    process.on(signal, async () => {
      await fastify.close();
      await prisma.$disconnect();
      process.exit(0);
    });
  });

  try {
    await fastify.listen({ port: parseInt(process.env.PORT || '3000'), host: process.env.HOST || '0.0.0.0' });
    console.log(`Server running at http://${process.env.HOST || 'localhost'}:${process.env.PORT || 3000}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

