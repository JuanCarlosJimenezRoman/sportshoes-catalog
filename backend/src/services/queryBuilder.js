// src/services/queryBuilder.js
export class QueryBuilder {
  constructor(query, prisma) {
    this.query = query;
    this.prisma = prisma;
    this.where = {};
    this.orderBy = {};
    this.include = {};
    this.pagination = { skip: 0, take: 12 };
  }

  addStockFilter() {
    if (this.query.inStock === 'true') {
      this.where.variants = {
        some: {
          stock: { gt: 0 },
          isActive: true
        }
      };
    }
    return this;
  }

  addSizeFilter() {
    if (this.query.sizes) {
      const sizes = this.query.sizes.split(',').map(s => s.trim());
      this.where.variants = {
        ...this.where.variants,
        some: {
          ...this.where.variants?.some,
          size: { in: sizes }
        }
      };
    }
    return this;
  }


  addSearch(fields) {
    if (this.query.search) {
      this.where.OR = fields.map(field => ({
        [field]: { contains: this.query.search }
      }));
    }
    return this;
  }

  addFilter(key, value) {
  // 1. Si el valor es undefined, null o vacío, no hagas nada y sal de la función
  if (value === undefined || value === null || value === '') {
    return this; 
  }

  let filters = [];

  // 2. Comprobar de qué tipo es el valor de forma segura
  if (typeof value === 'string') {
    // Si es un texto (ej: "running,diario"), lo separamos por comas
    filters = value.split(',');
  } else if (Array.isArray(value)) {
    // Si ya es un array (ej: ["running", "diario"]), lo usamos directamente
    filters = value;
  } else {
    // Si es un número o un booleano (ej: true o 129.99), lo metemos en un array
    filters = [value];
  }

  // ... aquí continúa el resto de tu lógica para agregar el filtro a Prisma ...
  
  return this;
}

  addRangeFilter(field, min, max) {
    if (min || max) {
      this.where[field] = {};
      if (min) this.where[field].gte = parseFloat(min);
      if (max) this.where[field].lte = parseFloat(max);
    }
    return this;
  }

  addSort(defaultField = 'createdAt', defaultOrder = 'desc') {
    const field = this.query.sortBy || defaultField;
    const order = this.query.sortOrder || defaultOrder;
    this.orderBy = { [field]: order };
    return this;
  }

  addPagination() {
    const page = parseInt(this.query.page) || 1;
    const limit = parseInt(this.query.limit) || 12;
    this.pagination = {
      skip: (page - 1) * limit,
      take: limit
    };
    return this;
  }

  addInclude(relations) {
    this.include = relations;
    return this;
  }

  build() {
    return {
      where: this.where,
      orderBy: this.orderBy,
      include: this.include,
      ...this.pagination
    };
  }
}