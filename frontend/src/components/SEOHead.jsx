import { useEffect } from 'react';

/**
 * SEO Head Component
 * 动态设置页面的SEO元数据
 */
export default function SEOHead({ 
  title, 
  description, 
  keywords, 
  canonical, 
  image,
  type = 'website',
  siteName = 'Fashion Store'
}) {
  useEffect(() => {
    // 设置 title
    if (title) {
      document.title = title;
    }
    
    // 设置或更新 meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    if (description) {
      metaDescription.setAttribute('content', description);
    }
    
    // 设置或更新 meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    if (keywords) {
      metaKeywords.setAttribute('content', keywords);
    }
    
    // 设置或更新 canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    if (canonical) {
      canonicalLink.setAttribute('href', canonical);
    }
    
    // 设置 Open Graph meta tags
    const ogTags = {
      'og:title': title,
      'og:description': description,
      'og:type': type,
      'og:site_name': siteName,
      'og:image': image
    };
    
    Object.entries(ogTags).forEach(([property, content]) => {
      if (content) {
        let ogTag = document.querySelector(`meta[property="${property}"]`);
        if (!ogTag) {
          ogTag = document.createElement('meta');
          ogTag.setAttribute('property', property);
          document.head.appendChild(ogTag);
        }
        ogTag.setAttribute('content', content);
      }
    });
    
    // 设置 Twitter Card meta tags
    const twitterTags = {
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': image
    };
    
    Object.entries(twitterTags).forEach(([name, content]) => {
      if (content) {
        let twitterTag = document.querySelector(`meta[name="${name}"]`);
        if (!twitterTag) {
          twitterTag = document.createElement('meta');
          twitterTag.setAttribute('name', name);
          document.head.appendChild(twitterTag);
        }
        twitterTag.setAttribute('content', content);
      }
    });
  }, [title, description, keywords, canonical, image, type, siteName]);
  
  return null; // 这个组件不渲染任何内容
}

