export class QueryBuilderUtil {
  /**
   * Translates a standardized sort array into Prisma's orderBy format.
   * Example Input: ['name:asc', 'createdAt:desc']
   * Example Output: [{ name: 'asc' }, { createdAt: 'desc' }]
   */
  static buildOrderBy(sort?: string[]): any[] {
    if (!sort || sort.length === 0) return [];
    
    return sort.map((s) => {
      const [field, order] = s.split(':');
      return { [field]: order.toLowerCase() === 'desc' ? 'desc' : 'asc' };
    });
  }

  /**
   * Processes a standardized generic filter object into a Prisma where object.
   * E.g. { 'age.gt': 18, 'name.contains': 'John' } -> { age: { gt: 18 }, name: { contains: 'John', mode: 'insensitive' } }
   */
  static buildWhere(filters?: Record<string, any>): Record<string, any> {
    if (!filters) return {};
    
    const where: Record<string, any> = {};

    for (const [key, value] of Object.entries(filters)) {
      if (value === undefined || value === null || value === '') continue;

      const parts = key.split('.');
      const field = parts[0];
      const operator = parts.length > 1 ? parts[1] : 'equals';

      // Initialize field if not exists
      if (!where[field]) {
        where[field] = {};
      }

      switch (operator) {
        case 'eq':
        case 'equals':
          where[field] = value;
          break;
        case 'neq':
          where[field].not = value;
          break;
        case 'in':
          where[field].in = Array.isArray(value) ? value : value.split(',');
          break;
        case 'nin':
          where[field].notIn = Array.isArray(value) ? value : value.split(',');
          break;
        case 'gt':
          where[field].gt = value;
          break;
        case 'gte':
          where[field].gte = value;
          break;
        case 'lt':
          where[field].lt = value;
          break;
        case 'lte':
          where[field].lte = value;
          break;
        case 'contains':
        case 'ilike':
          where[field].contains = value;
          where[field].mode = 'insensitive'; // Prisma specific for ILIKE behavior on Postgres
          break;
        case 'isnull':
          where[field] = value === 'true' || value === true ? null : { not: null };
          break;
        default:
          where[field] = value;
          break;
      }
    }

    return where;
  }
}
