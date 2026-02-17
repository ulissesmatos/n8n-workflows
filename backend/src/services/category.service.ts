import { PrismaClient, Category } from '@prisma/client';

export class CategoryService {
  constructor(private prisma: PrismaClient) {}

  /**
   * List all categories (public — ordered by name).
   */
  async listAll(): Promise<Category[]> {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get a single category by id.
   */
  async getById(id: string): Promise<Category | null> {
    return this.prisma.category.findUnique({ where: { id } });
  }

  /**
   * Get a single category by slug.
   */
  async getBySlug(slug: string): Promise<Category | null> {
    return this.prisma.category.findUnique({ where: { slug } });
  }

  /**
   * Create a new category.
   */
  async create(data: {
    name: string;
    slug: string;
    description?: string;
    icon?: string;
  }): Promise<Category> {
    return this.prisma.category.create({ data });
  }

  /**
   * Update an existing category.
   */
  async update(
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string;
      icon?: string;
    },
  ): Promise<Category> {
    return this.prisma.category.update({ where: { id }, data });
  }

  /**
   * Delete a category.
   */
  async delete(id: string): Promise<Category> {
    return this.prisma.category.delete({ where: { id } });
  }

  /**
   * Count how many published workflows use each category name.
   * Returns a map: categoryName → count.
   */
  async countWorkflowsByCategory(): Promise<Record<string, number>> {
    const groups = await this.prisma.workflow.groupBy({
      by: ['category'],
      where: { isPublished: true },
      _count: { _all: true },
    });
    const map: Record<string, number> = {};
    for (const g of groups) {
      map[g.category] = g._count._all;
    }
    return map;
  }
}
