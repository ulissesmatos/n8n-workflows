import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { WorkflowService } from '@services/workflow.service.js';
import { WorkflowQuerySchema } from '@schemas/index.js';

const workflowRoutes = async (fastify: FastifyInstance) => {
  const workflowService = new WorkflowService(fastify.prisma);

  // Get featured workflows
  fastify.get('/featured', async (request, reply) => {
    try {
      const workflows = await workflowService.getFeaturedWorkflows(6);
      return reply.send({
        statusCode: 200,
        data: workflows,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        statusCode: 500,
        message: 'Failed to fetch featured workflows',
      });
    }
  });

  // List all public workflows with filters
  fastify.get('/', async (request, reply) => {
    try {
      const query = WorkflowQuerySchema.parse(request.query);
      const result = await workflowService.listPublicWorkflows(query);
      return reply.send({
        statusCode: 200,
        ...result,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(400).send({
        statusCode: 400,
        message: 'Invalid query parameters',
      });
    }
  });

  // Get workflow by slug
  fastify.get('/:slug', async (request, reply) => {
    try {
      const { slug } = request.params as { slug: string };
      const workflow = await workflowService.getWorkflowBySlug(slug, true); // increment view

      if (!workflow || !workflow.isPublished) {
        return reply.status(404).send({
          statusCode: 404,
          message: 'Workflow not found',
        });
      }

      return reply.send({
        statusCode: 200,
        data: workflow,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        statusCode: 500,
        message: 'Failed to fetch workflow',
      });
    }
  });

  // Get workflow JSON (for download/import)
  fastify.get('/:slug/json', async (request, reply) => {
    try {
      const { slug } = request.params as { slug: string };
      const workflow = await workflowService.getWorkflowBySlug(slug);

      if (!workflow || !workflow.isPublished) {
        return reply.status(404).send({
          statusCode: 404,
          message: 'Workflow not found',
        });
      }

      // Record download
      await workflowService.recordDownload(workflow.id);

      // Send JSON file
      reply.header('Content-Type', 'application/json');
      reply.header('Content-Disposition', `attachment; filename="${workflow.slug}.json"`);
      return reply.send(workflow.jsonData);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        statusCode: 500,
        message: 'Failed to download workflow',
      });
    }
  });

  // Add review to workflow
  fastify.post('/:slug/reviews', async (request, reply) => {
    try {
      const { slug } = request.params as { slug: string };
      const { rating, comment, userEmail } = request.body as any;

      const workflow = await workflowService.getWorkflowBySlug(slug);
      if (!workflow) {
        return reply.status(404).send({
          statusCode: 404,
          message: 'Workflow not found',
        });
      }

      // Create review
      const review = await fastify.prisma.workflowReview.create({
        data: {
          workflowId: workflow.id,
          rating,
          comment,
          userEmail,
        },
      });

      return reply.status(201).send({
        statusCode: 201,
        data: review,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        statusCode: 500,
        message: 'Failed to create review',
      });
    }
  });
};

export default workflowRoutes;
