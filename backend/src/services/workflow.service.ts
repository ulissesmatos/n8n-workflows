import { Prisma, PrismaClient, Workflow } from '@prisma/client';
import { CreateWorkflow, UpdateWorkflow, WorkflowQuery } from '@schemas/index.js';
import { sanitizeContent, isValidN8nWorkflow, createPaginationMeta } from '@utils/helpers.js';

export class WorkflowService {
  constructor(private prisma: PrismaClient) {}

  async createWorkflow(data: CreateWorkflow, adminId: string): Promise<Workflow> {
    // Validate JSON data
    if (!isValidN8nWorkflow(data.jsonData)) {
      throw new Error('Invalid n8n workflow JSON structure');
    }

    const { content, author, ...rest } = data;

    return this.prisma.workflow.create({
      data: {
        ...rest,
        content: content ? sanitizeContent(content) : '',
        author: author?.trim() || 'Anonymous',
        adminId,
      },
    });
  }

  async updateWorkflow(id: string, data: UpdateWorkflow, adminId: string): Promise<Workflow> {
    // Verify ownership
    const workflow = await this.prisma.workflow.findUnique({ where: { id } });
    if (!workflow || workflow.adminId !== adminId) {
      throw new Error('Workflow not found or unauthorized');
    }

    // Validate JSON if provided
    if (data.jsonData && !isValidN8nWorkflow(data.jsonData)) {
      throw new Error('Invalid n8n workflow JSON structure');
    }

    const updateData: UpdateWorkflow = { ...data };

    // Sanitize content if provided
    if (data.content !== undefined) {
      updateData.content = sanitizeContent(data.content);
    }

    return this.prisma.workflow.update({
      where: { id },
      data: updateData,
    });
  }

  async getWorkflowById(id: string, incrementView: boolean = false): Promise<Workflow | null> {
    if (incrementView) {
      return this.prisma.workflow.update({
        where: { id },
        data: {
          viewCount: { increment: 1 },
          analytics: {
            update: {
              publicViews: { increment: 1 },
            },
          },
        },
      });
    }
    return this.prisma.workflow.findUnique({ where: { id } });
  }

  async getWorkflowBySlug(slug: string, incrementView: boolean = false): Promise<Workflow | null> {
    if (incrementView) {
      return this.prisma.workflow.update({
        where: { slug },
        data: {
          viewCount: { increment: 1 },
          analytics: {
            upsert: {
              create: { publicViews: 1 },
              update: { publicViews: { increment: 1 } },
            },
          },
        },
      });
    }
    return this.prisma.workflow.findUnique({ where: { slug } });
  }

  async listPublicWorkflows(query: WorkflowQuery) {
    const { page, limit, search, category, difficulty, tags, sort } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.WorkflowWhereInput = {
      isPublished: true,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (tags) {
      const tagArray = tags.split(',').map((t) => t.trim());
      where.tags = {
        hasSome: tagArray,
      };
    }

    // Build order clause
    let orderBy: Prisma.WorkflowOrderByWithRelationInput = { createdAt: 'desc' };
    switch (sort) {
      case 'popular':
        orderBy = { viewCount: 'desc' };
        break;
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    const [data, total] = await Promise.all([
      this.prisma.workflow.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          category: true,
          difficulty: true,
          tags: true,
          author: true,
          viewCount: true,
          rating: true,
          thumbnailUrl: true,
          jsonData: true,
          createdAt: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.workflow.count({ where }),
    ]);

    return {
      data,
      pagination: createPaginationMeta(page, limit, total),
    };
  }

  async deleteWorkflow(id: string, adminId: string): Promise<void> {
    const workflow = await this.prisma.workflow.findUnique({ where: { id } });
    if (!workflow || workflow.adminId !== adminId) {
      throw new Error('Workflow not found or unauthorized');
    }

    await this.prisma.workflow.delete({ where: { id } });
  }

  async recordDownload(id: string): Promise<void> {
    await this.prisma.workflow.update({
      where: { id },
      data: {
        downloadCount: { increment: 1 },
        analytics: {
          upsert: {
            create: { downloads: 1 },
            update: { downloads: { increment: 1 } },
          },
        },
      },
    });
  }

  async getFeaturedWorkflows(limit: number = 6): Promise<Workflow[]> {
    return this.prisma.workflow.findMany({
      where: {
        isPublished: true,
        isFeatured: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getAdminWorkflows(adminId: string, query: WorkflowQuery) {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.workflow.findMany({
        where: { adminId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.workflow.count({ where: { adminId } }),
    ]);

    return {
      data,
      pagination: createPaginationMeta(page, limit, total),
    };
  }
}
