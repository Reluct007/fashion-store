// 模板系统 - 根据配置动态加载不同的布局组件

import { getCurrentTemplateConfig } from '../config/template-config';

// 动态导入模板组件
export async function loadTemplateComponents(templateName) {
  try {
    let templateModule;
    switch (templateName) {
      case 'fashion':
        templateModule = await import('../templates/fashion');
        break;
      case 'modern':
        templateModule = await import('../templates/modern');
        break;
      case 'minimal':
        templateModule = await import('../templates/minimal');
        break;
      default:
        templateModule = await import('../templates/fashion');
    }
    
    // 返回默认导出的组件
    return templateModule.default || templateModule;
  } catch (error) {
    console.error(`加载模板 ${templateName} 失败:`, error);
    // 回退到默认模板
    const fallbackModule = await import('../templates/fashion');
    return fallbackModule.default || fallbackModule;
  }
}

// 同步加载模板组件（用于 React）
export function loadTemplateComponentsSync(templateName) {
  // 动态导入模板组件
  let templateModule;
  switch (templateName) {
    case 'fashion':
      templateModule = require('../templates/fashion');
      break;
    case 'modern':
      templateModule = require('../templates/modern');
      break;
    case 'minimal':
      templateModule = require('../templates/minimal');
      break;
    default:
      templateModule = require('../templates/fashion');
  }
  
  return templateModule.default || templateModule;
}

// 获取模板样式类名
export function getTemplateStyles(templateName) {
  const config = getCurrentTemplateConfig();
  
  const styleMap = {
    fashion: {
      container: 'container mx-auto',
      section: 'py-8 md:py-16',
      card: 'rounded-lg shadow-md overflow-hidden',
      button: 'bg-rose-600 text-white hover:bg-rose-700'
    },
    modern: {
      container: 'container mx-auto max-w-7xl',
      section: 'py-16',
      card: 'rounded-2xl border bg-white shadow-lg',
      button: 'bg-gray-900 text-white hover:bg-gray-800'
    },
    minimal: {
      container: 'container mx-auto max-w-4xl',
      section: 'py-12',
      card: 'border-b border-gray-200',
      button: 'bg-black text-white hover:bg-gray-800'
    }
  };

  return styleMap[templateName] || styleMap.fashion;
}

// 获取模板特定的CSS类
export function getTemplateClasses(templateName, element) {
  const styles = getTemplateStyles(templateName);
  return styles[element] || '';
}

// 检查模板是否支持某个功能
export function hasTemplateFeature(templateName, feature) {
  const config = getCurrentTemplateConfig();
  return config.features?.includes(feature) || false;
}

