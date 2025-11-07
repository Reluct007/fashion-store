#!/bin/bash
# 修复 index.html 文件

cd "$(dirname "$0")/.."

# 强制删除任何 index.html
rm -rf index.html index.html.tmp 2>/dev/null || true

# 从 Git 获取内容
if git rev-parse --git-dir > /dev/null 2>&1; then
    git show HEAD:frontend/index.html > index.html.tmp 2>/dev/null || {
        # 如果 Git 失败，使用默认内容
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
    # 不在 Git 仓库中，使用默认内容
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

# 复制到目标文件
cat index.html.tmp > index.html
rm -f index.html.tmp
chmod 644 index.html

# 同步文件系统
sync

# 验证
if [ ! -f index.html ] || [ -d index.html ]; then
    echo "ERROR: Failed to create index.html as file"
    exit 1
fi

echo "✓ index.html fixed"

