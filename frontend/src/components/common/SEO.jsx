import { useEffect } from 'react';

/**
 * SEO 组件 - 管理页面的 SEO 元数据，包括 canonical 标签
 * 符合 Google 的 SEO 标准
 */
export default function SEO({ 
  title, 
  description, 
  canonical, 
  ogImage,
  ogType = 'website',
  noindex = false,
  nofollow = false
}) {
  useEffect(() => {
    // 设置页面标题
    if (title) {
      document.title = title;
    }

    // 获取或创建 base URL
    const getBaseUrl = () => {
      if (typeof window !== 'undefined') {
        return `${window.location.protocol}//${window.location.host}`;
      }
      return '';
    };

    const baseUrl = getBaseUrl();
    
    // 处理 canonical URL - 符合 Google SEO 标准
    let canonicalUrl = canonical;
    if (!canonicalUrl && typeof window !== 'undefined') {
      // 如果没有提供 canonical，使用当前页面的 URL（去除查询参数和 hash）
      const url = new URL(window.location.href);
      url.search = ''; // 移除查询参数
      url.hash = ''; // 移除 hash
      canonicalUrl = url.toString();
    } else if (canonicalUrl) {
      // 确保 canonical URL 是绝对 URL
      if (!canonicalUrl.startsWith('http')) {
      // 如果是相对路径，转换为绝对路径
      canonicalUrl = `${baseUrl}${canonicalUrl.startsWith('/') ? '' : '/'}${canonicalUrl}`;
      }
      // 移除查询参数和 hash（如果存在）
      try {
        const url = new URL(canonicalUrl);
        url.search = '';
        url.hash = '';
        canonicalUrl = url.toString();
      } catch (e) {
        // 如果 URL 解析失败，使用原始值
        canonicalUrl = canonicalUrl.split('?')[0].split('#')[0];
      }
    }

    // 移除旧的 canonical 标签
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }

    // 添加 canonical 标签
    if (canonicalUrl) {
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = canonicalUrl;
      document.head.appendChild(link);
    }

    // 设置或更新 meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (description) {
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.name = 'description';
        document.head.appendChild(metaDescription);
      }
      metaDescription.content = description;
    }

    // 设置 robots meta 标签
    const robotsContent = [];
    if (noindex) robotsContent.push('noindex');
    if (nofollow) robotsContent.push('nofollow');
    if (robotsContent.length > 0) {
      let metaRobots = document.querySelector('meta[name="robots"]');
      if (!metaRobots) {
        metaRobots = document.createElement('meta');
        metaRobots.name = 'robots';
        document.head.appendChild(metaRobots);
      }
      metaRobots.content = robotsContent.join(', ');
    } else {
      // 如果没有设置 noindex/nofollow，确保有默认的 robots 标签
      let metaRobots = document.querySelector('meta[name="robots"]');
      if (!metaRobots) {
        metaRobots = document.createElement('meta');
        metaRobots.name = 'robots';
        metaRobots.content = 'index, follow';
        document.head.appendChild(metaRobots);
      }
    }

    // 设置 Open Graph 标签
    if (title) {
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitle);
      }
      ogTitle.content = title;
    }

    if (description) {
      let ogDescription = document.querySelector('meta[property="og:description"]');
      if (!ogDescription) {
        ogDescription = document.createElement('meta');
        ogDescription.setAttribute('property', 'og:description');
        document.head.appendChild(ogDescription);
      }
      ogDescription.content = description;
    }

    if (canonicalUrl) {
      let ogUrl = document.querySelector('meta[property="og:url"]');
      if (!ogUrl) {
        ogUrl = document.createElement('meta');
        ogUrl.setAttribute('property', 'og:url');
        document.head.appendChild(ogUrl);
      }
      ogUrl.content = canonicalUrl;
    }

    if (ogImage) {
      const ogImageUrl = ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage.startsWith('/') ? '' : '/'}${ogImage}`;
      let ogImageMeta = document.querySelector('meta[property="og:image"]');
      if (!ogImageMeta) {
        ogImageMeta = document.createElement('meta');
        ogImageMeta.setAttribute('property', 'og:image');
        document.head.appendChild(ogImageMeta);
      }
      ogImageMeta.content = ogImageUrl;
    }

    let ogTypeMeta = document.querySelector('meta[property="og:type"]');
    if (!ogTypeMeta) {
      ogTypeMeta = document.createElement('meta');
      ogTypeMeta.setAttribute('property', 'og:type');
      document.head.appendChild(ogTypeMeta);
    }
    ogTypeMeta.content = ogType;

    // 清理函数：组件卸载时移除动态添加的标签（可选）
    return () => {
      // 注意：我们不在这里移除 canonical 标签，因为其他页面可能需要它
      // 如果需要，可以在新页面加载时覆盖
    };
  }, [title, description, canonical, ogImage, ogType, noindex, nofollow]);

  return null; // 这个组件不渲染任何内容
}

