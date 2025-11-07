import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, dirname } from 'path'
import { readFileSync, writeFileSync, existsSync, statSync, rmSync } from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 确保 index.html 存在且是文件
function ensureIndexHtml() {
  const indexPath = resolve(__dirname, 'index.html')
  
  // 如果 index.html 是目录，删除它
  if (existsSync(indexPath)) {
    const stats = statSync(indexPath)
    if (stats.isDirectory()) {
      console.log('WARNING: index.html is a directory, removing...')
      rmSync(indexPath, { recursive: true, force: true })
    }
  }
  
  // 如果不存在，创建它
  if (!existsSync(indexPath)) {
    console.log('Creating index.html...')
    const defaultHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Discover your style with our latest fashion collection. Shop trendy designs and premium quality clothing, accessories, and more." />
    <meta name="keywords" content="fashion, clothing, style, trends, online shopping, fashion store" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="/" />
    <title>Fashion Store - Discover Your Style</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`
    writeFileSync(indexPath, defaultHtml, 'utf-8')
  }
  
  // 最终验证
  const finalStats = statSync(indexPath)
  if (!finalStats.isFile()) {
    throw new Error('index.html must be a file, not a directory')
  }
}

// 在配置加载时确保 index.html 正确
try {
  ensureIndexHtml()
} catch (error) {
  console.error('Error ensuring index.html:', error)
  throw error
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 明确指定入口 HTML 文件
  root: __dirname,
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
    },
  },
})
