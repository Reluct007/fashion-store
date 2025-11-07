#!/bin/bash
# 创建 index.html 文件

cat > index.html << 'HTML_EOF'
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
HTML_EOF

chmod 644 index.html

if [ ! -f index.html ] || [ -d index.html ]; then
  echo "ERROR: Failed to create index.html"
  exit 1
fi

echo "✓ index.html created successfully"

