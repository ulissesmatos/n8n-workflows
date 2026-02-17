import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

const healthRoutes = async (fastify: FastifyInstance) => {
  const healthHandler = async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Check database connection
      await fastify.prisma.$queryRaw`SELECT 1`;

      return reply.send({
        statusCode: 200,
        status: 'healthy',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      fastify.log.error({ err: error }, 'Health check failed');
      return reply.status(503).send({
        statusCode: 503,
        status: 'unhealthy',
        message: 'Database connection failed',
        timestamp: new Date().toISOString(),
      });
    }
  };

  fastify.get('/health', healthHandler);
  fastify.get('/api/v1/health', healthHandler);
};

export default healthRoutes;
