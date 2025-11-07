import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'
import { join } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 确保 index.html 存在且是文件
  build: {
    rollupOptions: {
      input: (() => {
        const indexPath = join(__dirname, 'index.html')
        try {
          // 检查文件是否存在且是文件
          const stats = require('fs').statSync(indexPath)
          if (!stats.isFile()) {
            throw new Error('index.html is not a file')
          }
          // 验证文件内容
          const content = readFileSync(indexPath, 'utf-8')
          if (!content.includes('<!doctype html>')) {
            throw new Error('index.html content is invalid')
          }
        } catch (error) {
          console.error('Error validating index.html:', error)
          // 如果文件有问题，从 Git 获取
          const { execSync } = require('child_process')
          try {
            execSync('git show HEAD:frontend/index.html > index.html', { cwd: __dirname })
          } catch (e) {
            throw new Error('Failed to fix index.html')
          }
        }
        return indexPath
      })()
    }
  }
})
