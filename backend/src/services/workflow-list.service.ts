import { PrismaClient, WorkflowList, WorkflowListItem } from '@prisma/client';

export class WorkflowListService {
  constructor(private prisma: PrismaClient) {}

  async createList(data: {
    title: string;
    slug: string;
    description?: string;
    icon?: string;
    order?: number;
    isFeatured?: boolean;
  }): Promise<WorkflowList> {
    return this.prisma.workflowList.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        icon: data.icon,
        order: data.order ?? 0,
        isFeatured: data.isFeatured ?? false,
      },
    });
  }

  async updateList(
    listId: string,
    data: {
      title?: string;
      slug?: string;
      description?: string;
      icon?: string;
      order?: number;
      isActive?: boolean;
      isFeatured?: boolean;
    }
  ): Promise<WorkflowList> {
    return this.prisma.workflowList.update({
      where: { id: listId },
      data,
    });
  }

  async deleteList(listId: string): Promise<WorkflowList> {
    return this.prisma.workflowList.delete({
      where: { id: listId },
    });
  }

  async getList(listId: string) {
    return this.prisma.workflowList.findUnique({
      where: { id: listId },
      include: {
        items: {
          include: {
            workflow: {
              select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                category: true,
                difficulty: true,
                thumbnailUrl: true,
                jsonData: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
  }

  async getListBySlug(slug: string) {
    return this.prisma.workflowList.findUnique({
      where: { slug },
      include: {
        items: {
          include: {
            workflow: {
              select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                category: true,
                difficulty: true,
                thumbnailUrl: true,
                jsonData: true,
                viewCount: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
  }

  async getAllLists(options?: { activeOnly?: boolean; featuredOnly?: boolean }) {
    const where: any = {};
    
    if (options?.activeOnly) {
      where.isActive = true;
    }
    
    if (options?.featuredOnly) {
      where.isFeatured = true;
    }

    return this.prisma.workflowList.findMany({
      where,
      orderBy: {
        order: 'asc',
      },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });
  }

  async addWorkflowToList(listId: string, workflowId: string, order?: number): Promise<WorkflowListItem> {
    // Get the max order if not specified
    if (order === undefined) {
      const maxOrderItem = await this.prisma.workflowListItem.findFirst({
        where: { listId },
        orderBy: { order: 'desc' },
      });
      order = (maxOrderItem?.order ?? -1) + 1;
    }

    return this.prisma.workflowListItem.create({
      data: {
        listId,
        workflowId,
        order,
      },
    });
  }

  async removeWorkflowFromList(listId: string, workflowId: string): Promise<WorkflowListItem> {
    const item = await this.prisma.workflowListItem.findUnique({
      where: {
        listId_workflowId: {
          listId,
          workflowId,
        },
      },
    });

    if (!item) {
      throw new Error('Workflow not found in list');
    }

    return this.prisma.workflowListItem.delete({
      where: {
        id: item.id,
      },
    });
  }

  async reorderWorkflowInList(listId: string, workflowId: string, newOrder: number): Promise<WorkflowListItem> {
    const item = await this.prisma.workflowListItem.findUnique({
      where: {
        listId_workflowId: {
          listId,
          workflowId,
        },
      },
    });

    if (!item) {
      throw new Error('Workflow not found in list');
    }

    return this.prisma.workflowListItem.update({
      where: { id: item.id },
      data: { order: newOrder },
    });
  }
}
