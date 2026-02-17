import { FastifyInstance } from 'fastify';
import { CategoryService } from '@services/category.service.js';

const categoryRoutes = async (fastify: FastifyInstance) => {
  const categoryService = new CategoryService(fastify.prisma);

  // List all categories (public)
  fastify.get('/', async (_request, reply) => {
    try {
      const categories = await categoryService.listAll();
      const counts = await categoryService.countWorkflowsByCategory();

      // Attach workflow count to each category
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

  // Get single category by slug (public)
  fastify.get('/:slug', async (request, reply) => {
    try {
      const { slug } = request.params as { slug: string };
      const category = await categoryService.getBySlug(slug);

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
};

export default categoryRoutes;
