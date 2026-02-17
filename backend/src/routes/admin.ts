import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcryptjs';
import { WorkflowService } from '@services/workflow.service.js';
import { LoginSchema, AdminUserCreateSchema, CreateWorkflowSchema, UpdateWorkflowSchema, WorkflowQuerySchema } from '@schemas/index.js';
import { authenticateAdmin, verifyToken } from '@middleware/auth.js';
import { getUserIp, getUserAgent } from '@utils/helpers.js';

const adminRoutes = async (fastify: FastifyInstance) => {
  const workflowService = new WorkflowService(fastify.prisma);

  // Admin login
  fastify.post('/login', async (request, reply) => {
    try {
      const { email, password } = LoginSchema.parse(request.body);

      const admin = await fastify.prisma.adminUser.findUnique({ where: { email } });
      if (!admin) {
        return reply.status(401).send({
          statusCode: 401,
          message: 'Invalid credentials',
        });
      }

      const isValidPassword = await bcrypt.compare(password, admin.password);
      if (!isValidPassword) {
        return reply.status(401).send({
          statusCode: 401,
          message: 'Invalid credentials',
        });
      }

      // Audit log
      await fastify.prisma.auditLog.create({
        data: {
          action: 'LOGIN',
          resource: 'AdminUser',
          resourceId: admin.id,
          userId: admin.id,
          ipAddress: getUserIp(request),
          userAgent: getUserAgent(request),
        },
      });

      const token = fastify.jwt.sign({ sub: admin.id, email: admin.email });

      return reply.send({
        statusCode: 200,
        data: {
          token,
          admin: {
            id: admin.id,
            email: admin.email,
          },
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(400).send({
        statusCode: 400,
        message: 'Invalid request body',
      });
    }
  });

  // All routes below require authentication
  fastify.addHook('onRequest', async (request, reply) => {
    if (request.url.startsWith('/api/v1/admin/') && !request.url.startsWith('/api/v1/admin/login')) {
      await authenticateAdmin(request, reply);
    }
  });

  // Create workflow
  fastify.post('/workflows', async (request, reply) => {
    try {
      const data = CreateWorkflowSchema.parse(request.body);
      const adminId = (request.user as any).sub;

      const workflow = await workflowService.createWorkflow(data, adminId);

      // Audit log
      await fastify.prisma.auditLog.create({
        data: {
          action: 'WORKFLOW_CREATED',
          resource: 'Workflow',
          resourceId: workflow.id,
          userId: adminId,
          ipAddress: getUserIp(request),
          userAgent: getUserAgent(request),
          details: { title: workflow.title, slug: workflow.slug },
        },
      });

      return reply.status(201).send({
        statusCode: 201,
        data: workflow,
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(400).send({
        statusCode: 400,
        message: error.message || 'Failed to create workflow',
      });
    }
  });

  // Get admin's workflows
  fastify.get('/workflows', async (request, reply) => {
    try {
      const adminId = (request.user as any).sub;
      const query = WorkflowQuerySchema.parse(request.query);

      const result = await workflowService.getAdminWorkflows(adminId, query);

      return reply.send({
        statusCode: 200,
        ...result,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(400).send({
        statusCode: 400,
        message: 'Failed to fetch workflows',
      });
    }
  });

  // Get single workflow
  fastify.get('/workflows/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const adminId = (request.user as any).sub;

      const workflow = await fastify.prisma.workflow.findUnique({ where: { id } });

      if (!workflow || workflow.adminId !== adminId) {
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

  // Update workflow
  fastify.put('/workflows/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const adminId = (request.user as any).sub;
      const data = UpdateWorkflowSchema.parse(request.body);

      const workflow = await workflowService.updateWorkflow(id, data, adminId);

      // Audit log
      await fastify.prisma.auditLog.create({
        data: {
          action: 'WORKFLOW_UPDATED',
          resource: 'Workflow',
          resourceId: id,
          userId: adminId,
          ipAddress: getUserIp(request),
          userAgent: getUserAgent(request),
        },
      });

      return reply.send({
        statusCode: 200,
        data: workflow,
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(400).send({
        statusCode: 400,
        message: error.message || 'Failed to update workflow',
      });
    }
  });

  // Delete workflow
  fastify.delete('/workflows/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const adminId = (request.user as any).sub;

      await workflowService.deleteWorkflow(id, adminId);

      // Audit log
      await fastify.prisma.auditLog.create({
        data: {
          action: 'WORKFLOW_DELETED',
          resource: 'Workflow',
          resourceId: id,
          userId: adminId,
          ipAddress: getUserIp(request),
          userAgent: getUserAgent(request),
        },
      });

      return reply.send({
        statusCode: 200,
        message: 'Workflow deleted successfully',
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(400).send({
        statusCode: 400,
        message: error.message || 'Failed to delete workflow',
      });
    }
  });

  // Get dashboard statistics
  fastify.get('/stats', async (request, reply) => {
    try {
      const adminId = (request.user as any).sub;

      const [totalWorkflows, publishedWorkflows, totalViews, totalDownloads] = await Promise.all([
        fastify.prisma.workflow.count({ where: { adminId } }),
        fastify.prisma.workflow.count({ where: { adminId, isPublished: true } }),
        fastify.prisma.workflow.aggregate({
          where: { adminId },
          _sum: { viewCount: true },
        }),
        fastify.prisma.workflow.aggregate({
          where: { adminId },
          _sum: { downloadCount: true },
        }),
      ]);

      return reply.send({
        statusCode: 200,
        data: {
          totalWorkflows,
          publishedWorkflows,
          totalViews: totalViews._sum.viewCount || 0,
          totalDownloads: totalDownloads._sum.downloadCount || 0,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        statusCode: 500,
        message: 'Failed to fetch statistics',
      });
    }
  });
};

export default adminRoutes;

