#!/bin/bash
set -e

cd "$(dirname "$0")/.."

echo "=== Build wrapper: Fixing index.html ==="

# 强制删除并重新创建 index.html
rm -rf index.html index.html.tmp 2>&1 || true

# 从 Git 获取内容，如果失败则使用默认内容
if git rev-parse --git-dir > /dev/null 2>&1; then
    git show HEAD:frontend/index.html > index.html.tmp 2>&1 || {
        cat > index.html.tmp << 'EOF'
<!doctype html>
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
</html>
EOF
    }
else
    cat > index.html.tmp << 'EOF'
<!doctype html>
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
</html>
EOF
fi

# 使用 dd 命令直接写入，避免文件系统问题
cat index.html.tmp | dd of=index.html bs=4096 2>/dev/null || cat index.html.tmp > index.html
rm -f index.html.tmp

# 设置权限
chmod 644 index.html

# 同步文件系统
sync

# 验证
if [ ! -f index.html ]; then
    echo "ERROR: index.html does not exist!"
    exit 1
fi

if [ -d index.html ]; then
    echo "ERROR: index.html is a directory!"
    exit 1
fi

# 使用 stat 验证
STAT_TYPE=$(stat -c "%F" index.html 2>/dev/null || stat -f "%HT" index.html 2>/dev/null || echo "unknown")
if echo "$STAT_TYPE" | grep -qi "directory"; then
    echo "ERROR: stat shows index.html is a directory!"
    exit 1
fi

echo "✓ index.html verified (type: $STAT_TYPE)"

# 立即执行构建，不等待
exec npx vite build

