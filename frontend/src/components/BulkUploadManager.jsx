import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, XCircle, Download, AlertCircle } from 'lucide-react';
import { bulkUploadProducts } from '../lib/api';

export default function BulkUploadManager({ onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [products, setProducts] = useState([]);
  const [preview, setPreview] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // CSV解析
  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const products = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      if (values.length !== headers.length) continue;
      
      const product = {};
      headers.forEach((header, index) => {
        let value = values[index];
        // 处理数字类型
        if (['price', 'originalPrice', 'rating', 'reviews', 'stock'].includes(header)) {
          value = value ? parseFloat(value) : (header === 'stock' ? 0 : null);
        }
        // 处理布尔类型
        if (['onSale'].includes(header)) {
          value = value === 'true' || value === '1' || value === 'yes';
        }
        // 处理数组（images）
        if (header === 'images' && value) {
          try {
            value = JSON.parse(value);
          } catch {
            value = value.split(';').filter(v => v.trim());
          }
        }
        product[header] = value;
      });
      
      // 确保必需字段
      if (product.name && product.price !== undefined) {
        products.push(product);
      }
    }
    
    return products;
  };

  // 处理文件上传
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setError(null);
    setResult(null);
    setPreview([]);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        let parsedProducts = [];
        
        if (selectedFile.type === 'application/json' || selectedFile.name.endsWith('.json')) {
          // JSON格式
          const data = JSON.parse(text);
          parsedProducts = Array.isArray(data) ? data : (data.products || []);
        } else if (selectedFile.name.endsWith('.csv')) {
          // CSV格式
          parsedProducts = parseCSV(text);
        } else {
          throw new Error('Unsupported file format. Please upload CSV or JSON file.');
        }
        
        if (parsedProducts.length === 0) {
          throw new Error('No valid products found in file.');
        }
        
        setProducts(parsedProducts);
        setPreview(parsedProducts.slice(0, 5)); // 预览前5个
      } catch (err) {
        setError(err.message);
        setFile(null);
      }
    };
    
    reader.readAsText(selectedFile);
  };

  // 下载模板
  const downloadTemplate = (format) => {
    const template = format === 'csv' 
      ? `name,title,description,metaDescription,metaKeywords,canonicalUrl,price,originalPrice,category,image,images,rating,reviews,onSale,stock,sku,brand,status
"Product Name","SEO Title","Product Description","Meta Description","keyword1, keyword2","https://example.com/product","99.99","129.99","Category","https://image-url.com","[\"img1\",\"img2\"]",4.5,100,true,50,"SKU001","Brand","active"`
      : JSON.stringify([
          {
            name: "Product Name",
            title: "SEO Title",
            description: "Product Description",
            metaDescription: "Meta Description",
            metaKeywords: "keyword1, keyword2",
            canonicalUrl: "https://example.com/product",
            price: 99.99,
            originalPrice: 129.99,
            category: "Category",
            image: "https://image-url.com",
            images: ["img1", "img2"],
            rating: 4.5,
            reviews: 100,
            onSale: true,
            stock: 50,
            sku: "SKU001",
            brand: "Brand",
            status: "active"
          }
        ], null, 2);
    
    const blob = new Blob([template], { type: format === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `product-template.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 执行批量上传
  const handleUpload = async () => {
    if (products.length === 0) {
      setError('No products to upload');
      return;
    }
    
    setUploading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await bulkUploadProducts(products);
      setResult(response);
      
      if (response.success > 0 && onUploadComplete) {
        onUploadComplete();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  // 重置
  const handleReset = () => {
    setFile(null);
    setProducts([]);
    setPreview([]);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Bulk Upload Products</h2>
      
      {/* 错误提示 */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}
      
      {/* 上传结果 */}
      {result && (
        <div className={`mb-4 p-4 rounded-lg ${
          result.failed === 0 ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-yellow-100 border border-yellow-400 text-yellow-700'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {result.failed === 0 ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-semibold">Upload Complete</span>
          </div>
          <div className="text-sm">
            <p>Total: {result.total} | Success: {result.success} | Failed: {result.failed}</p>
            {result.errors && result.errors.length > 0 && (
              <div className="mt-2">
                <p className="font-semibold">Errors:</p>
                <ul className="list-disc list-inside">
                  {result.errors.slice(0, 5).map((err, idx) => (
                    <li key={idx}>Row {err.index + 1}: {err.error}</li>
                  ))}
                  {result.errors.length > 5 && <li>... and {result.errors.length - 5} more</li>}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* 文件上传区域 */}
      {!file && (
        <div className="mb-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Upload CSV or JSON file</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-block px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 cursor-pointer"
            >
              Choose File
            </label>
          </div>
          
          {/* 下载模板 */}
          <div className="mt-4 flex gap-4 justify-center">
            <button
              onClick={() => downloadTemplate('csv')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4" />
              Download CSV Template
            </button>
            <button
              onClick={() => downloadTemplate('json')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4" />
              Download JSON Template
            </button>
          </div>
        </div>
      )}
      
      {/* 文件信息和预览 */}
      {file && products.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-600" />
              <span className="text-gray-900 font-medium">{file.name}</span>
              <span className="text-gray-500">({products.length} products)</span>
            </div>
            <button
              onClick={handleReset}
              className="text-gray-600 hover:text-gray-900"
            >
              Remove
            </button>
          </div>
          
          {/* 预览表格 */}
          {preview.length > 0 && (
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Price</th>
                    <th className="px-4 py-2 text-left">Category</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((product, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="px-4 py-2">{product.name || '-'}</td>
                      <td className="px-4 py-2">${product.price || '-'}</td>
                      <td className="px-4 py-2">{product.category || '-'}</td>
                      <td className="px-4 py-2">{product.status || 'active'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length > 5 && (
                <p className="text-sm text-gray-500 mt-2">
                  Showing 5 of {products.length} products
                </p>
              )}
            </div>
          )}
          
          {/* 上传按钮 */}
          <div className="flex gap-4">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex items-center gap-2 px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload {products.length} Products
                </>
              )}
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

