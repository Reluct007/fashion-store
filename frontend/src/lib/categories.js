import { product as products } from '../../data/product.js';

export function generateCategorySlug(category) {
  if (!category) return '';

  const normalized = String(category)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[’'`]/g, '')
    .replace(/&/g, ' and ');

  return normalized
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getStaticCategoryConfigs() {
  const categories = [...new Set((products || []).map(p => p.category).filter(Boolean))].sort((a, b) =>
    String(a).localeCompare(String(b))
  );

  const slugCounts = new Map();

  return categories.map((label, index) => {
    const baseSlug = generateCategorySlug(label) || `category-${index + 1}`;
    const count = (slugCounts.get(baseSlug) || 0) + 1;
    slugCounts.set(baseSlug, count);

    const slug = count === 1 ? baseSlug : `${baseSlug}-${count}`;
    return { label, slug };
  });
}

export function getCategoryLabelBySlug(categorySlug) {
  if (!categorySlug) return null;
  const configs = getStaticCategoryConfigs();
  const match = configs.find(c => c.slug === categorySlug);
  return match ? match.label : null;
}
