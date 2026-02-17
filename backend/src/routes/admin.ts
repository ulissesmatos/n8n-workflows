import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcryptjs';
import { WorkflowService } from '@services/workflow.service.js';
import { WorkflowListService } from '@services/workflow-list.service.js';
import { CategoryService } from '@services/category.service.js';
import { 
  LoginSchema, 
  AdminUserCreateSchema, 
  CreateWorkflowSchema, 
  UpdateWorkflowSchema, 
  WorkflowQuerySchema,
  CreateWorkflowListSchema,
  UpdateWorkflowListSchema,
  AddWorkflowToListSchema,
  ReorderWorkflowInListSchema,
  CreateCategorySchema,
  UpdateCategorySchema,
} from '@schemas/index.js';
import { authenticateAdmin, verifyToken } from '@middleware/auth.js';
import { getUserIp, getUserAgent } from '@utils/helpers.js';

const adminRoutes = async (fastify: FastifyInstance) => {
  const workflowService = new WorkflowService(fastify.prisma);
  const listService = new WorkflowListService(fastify.prisma);
  const categoryService = new CategoryService(fastify.prisma);

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

  // ========== Curated Lists Routes ==========

  // Get all lists (admin view - includes inactive)
  fastify.get('/lists', async (request, reply) => {
    try {
      const lists = await listService.getAllLists();
      return reply.send({
        statusCode: 200,
        data: lists,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        statusCode: 500,
        message: 'Failed to fetch lists',
      });
    }
  });

  // Get single list by ID
  fastify.get('/lists/:listId', async (request, reply) => {
    try {
      const { listId } = request.params as { listId: string };
      const list = await listService.getList(listId);
      
      if (!list) {
        return reply.status(404).send({
          statusCode: 404,
          message: 'List not found',
        });
      }

      return reply.send({
        statusCode: 200,
        data: list,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        statusCode: 500,
        message: 'Failed to fetch list',
      });
    }
  });

  // Create new list
  fastify.post('/lists', async (request, reply) => {
    try {
      const data = CreateWorkflowListSchema.parse(request.body);
      const adminId = (request.user as any).sub;

      const list = await listService.createList(data);

      // Audit log
      await fastify.prisma.auditLog.create({
        data: {
          action: 'LIST_CREATED',
          resource: 'WorkflowList',
          resourceId: list.id,
          userId: adminId,
          ipAddress: getUserIp(request),
          userAgent: getUserAgent(request),
          details: { title: list.title, slug: list.slug },
        },
      });

      return reply.status(201).send({
        statusCode: 201,
        data: list,
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(400).send({
        statusCode: 400,
        message: error.message || 'Failed to create list',
      });
    }
  });

  // Update list
  fastify.put('/lists/:listId', async (request, reply) => {
    try {
      const { listId } = request.params as { listId: string };
      const data = UpdateWorkflowListSchema.parse(request.body);
      const adminId = (request.user as any).sub;

      const list = await listService.updateList(listId, data);

      // Audit log
      await fastify.prisma.auditLog.create({
        data: {
          action: 'LIST_UPDATED',
          resource: 'WorkflowList',
          resourceId: list.id,
          userId: adminId,
          ipAddress: getUserIp(request),
          userAgent: getUserAgent(request),
          details: data,
        },
      });

      return reply.send({
        statusCode: 200,
        data: list,
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(400).send({
        statusCode: 400,
        message: error.message || 'Failed to update list',
      });
    }
  });

  // Delete list
  fastify.delete('/lists/:listId', async (request, reply) => {
    try {
      const { listId } = request.params as { listId: string };
      const adminId = (request.user as any).sub;

      await listService.deleteList(listId);

      // Audit log
      await fastify.prisma.auditLog.create({
        data: {
          action: 'LIST_DELETED',
          resource: 'WorkflowList',
          resourceId: listId,
          userId: adminId,
          ipAddress: getUserIp(request),
          userAgent: getUserAgent(request),
        },
      });

      return reply.send({
        statusCode: 200,
        message: 'List deleted successfully',
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(400).send({
        statusCode: 400,
        message: error.message || 'Failed to delete list',
      });
    }
  });

  // Add workflow to list
  fastify.post('/lists/:listId/workflows', async (request, reply) => {
    try {
      const { listId } = request.params as { listId: string };
      const data = AddWorkflowToListSchema.parse(request.body);
      const adminId = (request.user as any).sub;

      const item = await listService.addWorkflowToList(listId, data.workflowId, data.order);

      // Audit log
      await fastify.prisma.auditLog.create({
        data: {
          action: 'WORKFLOW_ADDED_TO_LIST',
          resource: 'WorkflowListItem',
          resourceId: item.id,
          userId: adminId,
          ipAddress: getUserIp(request),
          userAgent: getUserAgent(request),
          details: { listId, workflowId: data.workflowId },
        },
      });

      return reply.status(201).send({
        statusCode: 201,
        data: item,
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(400).send({
        statusCode: 400,
        message: error.message || 'Failed to add workflow to list',
      });
    }
  });

  // Remove workflow from list
  fastify.delete('/lists/:listId/workflows/:workflowId', async (request, reply) => {
    try {
      const { listId, workflowId } = request.params as { listId: string; workflowId: string };
      const adminId = (request.user as any).sub;

      await listService.removeWorkflowFromList(listId, workflowId);

      // Audit log
      await fastify.prisma.auditLog.create({
        data: {
          action: 'WORKFLOW_REMOVED_FROM_LIST',
          resource: 'WorkflowListItem',
          resourceId: `${listId}-${workflowId}`,
          userId: adminId,
          ipAddress: getUserIp(request),
          userAgent: getUserAgent(request),
          details: { listId, workflowId },
        },
      });

      return reply.send({
        statusCode: 200,
        message: 'Workflow removed from list successfully',
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(400).send({
        statusCode: 400,
        message: error.message || 'Failed to remove workflow from list',
      });
    }
  });

  // Reorder workflow in list
  fastify.patch('/lists/:listId/workflows/:workflowId/order', async (request, reply) => {
    try {
      const { listId, workflowId } = request.params as { listId: string; workflowId: string };
      const data = ReorderWorkflowInListSchema.parse(request.body);
      const adminId = (request.user as any).sub;

      const item = await listService.reorderWorkflowInList(listId, workflowId, data.newOrder);

      // Audit log
      await fastify.prisma.auditLog.create({
        data: {
          action: 'WORKFLOW_REORDERED_IN_LIST',
          resource: 'WorkflowListItem',
          resourceId: item.id,
          userId: adminId,
          ipAddress: getUserIp(request),
          userAgent: getUserAgent(request),
          details: { listId, workflowId, newOrder: data.newOrder },
        },
      });

      return reply.send({
        statusCode: 200,
        data: item,
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(400).send({
        statusCode: 400,
        message: error.message || 'Failed to reorder workflow',
      });
    }
  });

  // ========== Category Routes ==========

  // Get all categories (admin view)
  fastify.get('/categories', async (_request, reply) => {
    try {
      const categories = await categoryService.listAll();
      const counts = await categoryService.countWorkflowsByCategory();

      const data = categories.map((cat) => ({
        ...cat,
        workflowCount: counts[cat.name] ?? 0,
      }));

      return reply.send({
        statusCode: 200,
        data,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        statusCode: 500,
        message: 'Failed to fetch categories',
      });
    }
  });

  // Get single category by ID
  fastify.get('/categories/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const category = await categoryService.getById(id);

      if (!category) {
        return reply.status(404).send({
          statusCode: 404,
          message: 'Category not found',
        });
      }

      return reply.send({
        statusCode: 200,
        data: category,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        statusCode: 500,
        message: 'Failed to fetch category',
      });
    }
  });

  // Create new category
  fastify.post('/categories', async (request, reply) => {
    try {
      const data = CreateCategorySchema.parse(request.body);
      const adminId = (request.user as any).sub;

      const category = await categoryService.create(data);

      // Audit log
      await fastify.prisma.auditLog.create({
        data: {
          action: 'CATEGORY_CREATED',
          resource: 'Category',
          resourceId: category.id,
          userId: adminId,
          ipAddress: getUserIp(request),
          userAgent: getUserAgent(request),
          details: { name: category.name, slug: category.slug },
        },
      });

      return reply.status(201).send({
        statusCode: 201,
        data: category,
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(400).send({
        statusCode: 400,
        message: error.message || 'Failed to create category',
      });
    }
  });

  // Update category
  fastify.put('/categories/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const data = UpdateCategorySchema.parse(request.body);
      const adminId = (request.user as any).sub;

      const category = await categoryService.update(id, data);

      // Audit log
      await fastify.prisma.auditLog.create({
        data: {
          action: 'CATEGORY_UPDATED',
          resource: 'Category',
          resourceId: category.id,
          userId: adminId,
          ipAddress: getUserIp(request),
          userAgent: getUserAgent(request),
          details: data,
        },
      });

      return reply.send({
        statusCode: 200,
        data: category,
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(400).send({
        statusCode: 400,
        message: error.message || 'Failed to update category',
      });
    }
  });

  // Delete category
  fastify.delete('/categories/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const adminId = (request.user as any).sub;

      await categoryService.delete(id);

      // Audit log
      await fastify.prisma.auditLog.create({
        data: {
          action: 'CATEGORY_DELETED',
          resource: 'Category',
          resourceId: id,
          userId: adminId,
          ipAddress: getUserIp(request),
          userAgent: getUserAgent(request),
        },
      });

      return reply.send({
        statusCode: 200,
        message: 'Category deleted successfully',
      });
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(400).send({
        statusCode: 400,
        message: error.message || 'Failed to delete category',
      });
    }
  });
};

export default adminRoutes;

