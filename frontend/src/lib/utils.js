export const parseJSON = (str) => {
  try {
    if (typeof str === 'string') {
      return JSON.parse(str);
    }
    return str || [];
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return [];
  }
};

export const formatPrice = (price) => {
  if (price === null || price === undefined) return 'Precio no disponible';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(price);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const getStockStatus = (stock) => {
  if (stock === 0) return { label: 'Agotado', color: 'bg-red-500', textColor: 'text-red-600' };
  if (stock <= 5) return { label: 'Pocas unidades', color: 'bg-yellow-500', textColor: 'text-yellow-600' };
  return { label: 'Disponible', color: 'bg-green-500', textColor: 'text-green-600' };
};

export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};