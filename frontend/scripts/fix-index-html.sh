#!/bin/bash
# 强制修复 index.html，确保它是文件而不是目录

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$(dirname "$SCRIPT_DIR")"
cd "$FRONTEND_DIR"

echo "=== Fixing index.html ==="

# 无论是什么，先彻底删除
if [ -e index.html ]; then
    echo "Removing existing index.html (file or directory)..."
    rm -rf index.html
fi

# 确保从 Git 获取内容
if [ -d .git ]; then
    echo "Fetching index.html from Git..."
    git show HEAD:frontend/index.html > index.html.tmp 2>&1 || {
        echo "ERROR: Failed to fetch from Git, using fallback content"
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
    echo "Not a Git repo, using fallback content"
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

# 验证临时文件
if [ ! -f index.html.tmp ]; then
    echo "ERROR: Failed to create temporary file"
    exit 1
fi

if [ -d index.html.tmp ]; then
    echo "ERROR: Temporary file is a directory!"
    exit 1
fi

# 使用原子操作：先写入到不同名称，然后重命名
echo "Creating index.html as file..."
cat index.html.tmp > index.html
rm -f index.html.tmp

# 设置权限
chmod 644 index.html

# 最终验证
if [ -d index.html ]; then
    echo "ERROR: index.html is still a directory after all fixes!"
    ls -la index.html
    exit 1
fi

if [ ! -f index.html ]; then
    echo "ERROR: index.html does not exist after fix!"
    exit 1
fi

# 验证内容
if ! head -1 index.html | grep -qi "doctype"; then
    echo "ERROR: index.html content is invalid!"
    head -5 index.html
    exit 1
fi

echo "✓ index.html successfully fixed and verified"
ls -lh index.html
file index.html

