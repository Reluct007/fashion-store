import { useEffect } from 'react';

/**
 * Structured Data Component (JSON-LD)
 * 添加结构化数据以支持Google Search Console
 */
export default function StructuredData({ type, data }) {
  useEffect(() => {
    if (!data) return;
    
    // 创建 script 标签
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    script.id = `structured-data-${type}-${Date.now()}`;
    
    // 移除旧的同类型结构化数据
    const oldScript = document.querySelector(`script[id^="structured-data-${type}"]`);
    if (oldScript) {
      oldScript.remove();
    }
    
    // 添加到 head
    document.head.appendChild(script);
    
    // 清理函数
    return () => {
      const scriptToRemove = document.getElementById(script.id);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [type, data]);
  
  return null;
}

