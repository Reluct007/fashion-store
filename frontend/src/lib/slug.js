/**
 * 将标题转换为URL友好的slug
 * @param {string} title - 产品标题
 * @returns {string} - URL友好的slug
 */
export function generateSlug(title) {
  if (!title) return '';
  
  return title
    .toLowerCase()
    .trim()
    // 替换特殊字符为空格
    .replace(/[^\w\s-]/g, '')
    // 替换多个空格为单个连字符
    .replace(/\s+/g, '-')
    // 替换多个连字符为单个连字符
    .replace(/-+/g, '-')
    // 移除开头和结尾的连字符
    .replace(/^-+|-+$/g, '')
    // 限制长度（最多100个字符）
    .substring(0, 100)
    .replace(/-+$/, ''); // 确保末尾没有连字符
}

/**
 * 生成唯一的slug（处理重复标题）
 * @param {string} title - 产品标题
 * @param {number} index - 产品索引（用于处理重复）
 * @param {Map} slugMap - 已存在的slug映射（用于检查重复）
 * @returns {string} - 唯一的slug
 */
export function generateUniqueSlug(title, index, slugMap = new Map()) {
  const baseSlug = generateSlug(title);
  
  // 如果slug为空，使用索引作为后备
  if (!baseSlug) {
    return `product-${index}`;
  }
  
  // 检查是否已存在相同的slug
  if (!slugMap.has(baseSlug)) {
    slugMap.set(baseSlug, index);
    return baseSlug;
  }
  
  // 如果存在重复，添加索引后缀
  const uniqueSlug = `${baseSlug}-${index}`;
  slugMap.set(uniqueSlug, index);
  return uniqueSlug;
}

/**
 * 从slug或id查找产品
 * @param {Array} products - 产品列表
 * @param {string} identifier - slug或id
 * @returns {Object|null} - 找到的产品或null
 */
export function findProductByIdentifier(products, identifier) {
  if (!identifier) return null;
  
  // 首先尝试通过slug查找
  const productBySlug = products.find(p => p.slug === identifier);
  if (productBySlug) return productBySlug;
  
  // 然后尝试通过id查找（向后兼容）
  const productById = products.find(p => p.id === identifier || p.id === `static_${identifier}`);
  if (productById) return productById;
  
  // 最后尝试通过标题匹配（模糊匹配）
  const productByTitle = products.find(p => {
    const slug = generateSlug(p.title || p.name || '');
    return slug === identifier || slug.startsWith(identifier);
  });
  
  return productByTitle || null;
}

/**
 * 获取产品的URL标识符（优先使用slug，如果没有则使用id）
 * @param {Object} product - 产品对象
 * @returns {string} - URL标识符
 */
export function getProductUrlIdentifier(product) {
  if (!product) return '';
  
  // 优先使用slug
  if (product.slug) {
    return product.slug;
  }
  
  // 如果没有slug，使用id（向后兼容）
  if (product.id) {
    return product.id;
  }
  
  // 如果都没有，生成一个slug
  const title = product.title || product.name || 'Product';
  return generateSlug(title) || `product-${Date.now()}`;
}

