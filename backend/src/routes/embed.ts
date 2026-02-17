import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { WorkflowService } from '@services/workflow.service.js';

const embedRoutes = async (fastify: FastifyInstance) => {
  const workflowService = new WorkflowService(fastify.prisma);

  // Get workflow for embed (lightweight, minimal data)
  fastify.get('/:slug', async (request, reply) => {
    try {
      const { slug } = request.params as { slug: string };
      const workflow = await workflowService.getWorkflowBySlug(slug, true); // increment embed view

      if (!workflow || !workflow.isPublished) {
        return reply.status(404).send({
          statusCode: 404,
          message: 'Workflow not found',
        });
      }

      // For embeds, return only essential data
      return reply.send({
        statusCode: 200,
        data: {
          id: workflow.id,
          title: workflow.title,
          slug: workflow.slug,
          description: workflow.description,
          category: workflow.category,
          difficulty: workflow.difficulty,
          tags: workflow.tags,
          author: workflow.author,
          jsonData: workflow.jsonData,
          thumbnailUrl: workflow.thumbnailUrl,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        statusCode: 500,
        message: 'Failed to fetch workflow',
      });
    }
  });

  // Get embed script tag (for WordPress integration)
  fastify.get('/:slug/script', async (request, reply) => {
    try {
      const { slug } = request.params as { slug: string };
      const host = request.headers.host || 'localhost:3000';
      const protocol = request.protocol || 'http';

      // Return a script tag that can be embedded in WordPress
      const embedCode = `
<script>
  (function() {
    const container = document.currentScript.parentElement;
    const src = '${protocol}://${host}/api/v1/embed/${slug}';
    
    fetch(src)
      .then(r => r.json())
      .then(res => {
        const workflow = res.data;
        container.innerHTML = \`
          <div class="n8n-workflow-embed" data-workflow-id="\${workflow.id}">
            <h3>\${workflow.title}</h3>
            <p>\${workflow.description}</p>
            <div class="workflow-meta">
              <span class="difficulty">\${workflow.difficulty}</span>
              <span class="category">\${workflow.category}</span>
            </div>
            <div class="workflow-tags">
              \${workflow.tags.map(t => \`<span class="tag">\${t}</span>\`).join('')}
            </div>
            <a href="${protocol}://${host}/#/workflows/\${workflow.slug}" target="_blank" class="btn-view">View Workflow</a>
          </div>
          <link rel="stylesheet" href="${protocol}://${host}/embed.css">
        \`;
      })
      .catch(err => {
        container.innerHTML = '<p>Failed to load workflow</p>';
        console.error('Workflow embed error:', err);
      });
  })();
</script>
      `.trim();

      reply.header('Content-Type', 'application/javascript');
      reply.header('Cache-Control', 'public, max-age=3600');
      return reply.send(embedCode);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        statusCode: 500,
        message: 'Failed to generate embed script',
      });
    }
  });

  // Get embed CSS
  fastify.get('/styles/embed.css', async (request, reply) => {
    const css = `
.n8n-workflow-embed {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
  background: #f9f9f9;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  max-width: 600px;
}

.n8n-workflow-embed h3 {
  margin: 0 0 12px 0;
  font-size: 20px;
  color: #333;
}

.n8n-workflow-embed p {
  margin: 0 0 16px 0;
  color: #666;
  font-size: 14px;
}

.workflow-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.workflow-meta span {
  display: inline-block;
  padding: 4px 12px;
  background: #fff;
  border: 1px solid #d0d0d0;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.workflow-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.workflow-tags .tag {
  display: inline-block;
  padding: 4px 12px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 4px;
  font-size: 12px;
}

.btn-view {
  display: inline-block;
  padding: 10px 20px;
  background: #1976d2;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 600;
  transition: background 0.2s;
}

.btn-view:hover {
  background: #1565c0;
}
    `;

    reply.header('Content-Type', 'text/css');
    reply.header('Cache-Control', 'public, max-age=86400');
    return reply.send(css);
  });
};

export default embedRoutes;
