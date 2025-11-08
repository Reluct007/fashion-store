import { useState, useEffect } from 'react';
import { getProductConfigs, upsertProductConfig, deleteProductConfig, getProducts } from '../lib/api';
import { Save, Trash2, Plus, ExternalLink } from 'lucide-react';

export default function ProductConfigManager() {
  const [configs, setConfigs] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingConfig, setEditingConfig] = useState(null);
  const [formData, setFormData] = useState({
    page_type: 'product', // 'home', 'product', 'page'
    product_id: '',
    page_path: '',
    button_type: 'add_to_cart',
    action_type: 'link',
    target_url: '',
    api_endpoint: '',
    is_enabled: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [configsData, productsData] = await Promise.all([
        getProductConfigs(),
        getProducts(),
      ]);
      setConfigs(configsData);
      setProducts(productsData);
    } catch (err) {
      setError('Failed to load data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setError(null);
      
      // 根据页面类型设置 product_id
      let productId = 0;
      if (formData.page_type === 'product') {
        productId = parseInt(formData.product_id) || 0;
        if (!productId || productId === 0) {
          setError('Please select a product or "All Products"');
          return;
        }
        // -999 表示所有产品
        // 其他正数表示特定产品
      } else if (formData.page_type === 'home') {
        productId = 0;
      } else if (formData.page_type === 'page') {
        productId = -1; // 使用 -1 表示单页面
        if (!formData.page_path) {
          setError('Please enter a page path');
          return;
        }
      }
      
      const configData = {
        ...formData,
        product_id: productId,
        page_path: formData.page_type === 'page' ? formData.page_path : null,
      };
      
      await upsertProductConfig(configData);
      await loadData();
      setEditingConfig(null);
      setFormData({
        page_type: 'product',
        product_id: '',
        page_path: '',
        button_type: 'add_to_cart',
        action_type: 'link',
        target_url: '',
        api_endpoint: '',
        is_enabled: true,
      });
    } catch (err) {
      setError('Failed to save config: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this configuration?')) {
      try {
        await deleteProductConfig(id);
        await loadData();
      } catch (err) {
        setError('Failed to delete config: ' + err.message);
      }
    }
  };

  const handleEdit = (config) => {
    setEditingConfig(config.id);
    // 根据 product_id 判断页面类型
    let pageType = 'product';
    if (config.product_id === 0) {
      pageType = 'home';
    } else if (config.product_id === -999) {
      pageType = 'product'; // All Products 仍然是 product 类型
    } else if (config.product_id < 0 || config.page_path) {
      pageType = 'page';
    }
    
    setFormData({
      page_type: pageType,
      product_id: config.product_id > 0 || config.product_id === -999 ? config.product_id.toString() : '',
      page_path: config.page_path || '',
      button_type: config.button_type,
      action_type: config.action_type,
      target_url: config.target_url || '',
      api_endpoint: config.api_endpoint || '',
      is_enabled: config.is_enabled === 1 || config.is_enabled === true,
    });
  };

  const getPageName = (productId, pagePath) => {
    if (productId === 0) {
      return 'Home Page';
    } else if (productId === -999) {
      return 'All Products';
    } else if (productId < 0 || pagePath) {
      return pagePath || 'Custom Page';
    } else {
      const product = products.find(p => p.id === productId);
      return product ? product.name : `Product #${productId}`;
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-600">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Link Configuration</h2>
        <button
          onClick={() => {
            setEditingConfig(null);
            setFormData({
              product_id: '',
              button_type: 'add_to_cart',
              action_type: 'link',
              target_url: '',
              api_endpoint: '',
              is_enabled: true,
            });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Configuration
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Configuration Form */}
      {(!configs.length || editingConfig !== null || !configs.find(c => {
        if (formData.page_type === 'home') {
          return c.product_id === 0;
        } else if (formData.page_type === 'page') {
          return c.product_id === -1 && c.page_path === formData.page_path;
        } else {
          return c.product_id === parseInt(formData.product_id);
        }
      })) && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingConfig ? 'Edit Configuration' : 'Add New Configuration'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Page Type</label>
              <select
                value={formData.page_type}
                onChange={(e) => {
                  const newPageType = e.target.value;
                  setFormData({ 
                    ...formData, 
                    page_type: newPageType,
                    product_id: newPageType === 'product' ? formData.product_id : (newPageType === 'home' ? '0' : ''),
                    page_path: newPageType === 'page' ? formData.page_path : ''
                  });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
              >
                <option value="home">Home Page</option>
                <option value="product">Product Detail Page</option>
                <option value="page">Custom Page</option>
              </select>
            </div>
            {formData.page_type === 'product' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
                <select
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                >
                  <option value="">Select Product</option>
                  <option value="-999">All Products</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} (#{product.id})
                    </option>
                  ))}
                </select>
              </div>
            )}
            {formData.page_type === 'page' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Page Path</label>
                <input
                  type="text"
                  value={formData.page_path}
                  onChange={(e) => setFormData({ ...formData, page_path: e.target.value })}
                  placeholder="/about, /contact, etc."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                />
                <p className="text-xs text-gray-500 mt-1">Enter the page path (e.g., /about, /contact)</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trigger Type</label>
              <select
                value={formData.button_type}
                onChange={(e) => setFormData({ ...formData, button_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
              >
                <option value="add_to_cart">Add to Cart Button</option>
                <option value="buy_now">Buy Now Button</option>
                <option value="product_image">Product Image</option>
                <option value="product_title">Product Title</option>
                <option value="page_area">Click Anywhere on Page</option>
                <option value="custom">Custom Element</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Action Type</label>
              <select
                value={formData.action_type}
                onChange={(e) => setFormData({ ...formData, action_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
              >
                <option value="link">External Link</option>
                <option value="api">API Call</option>
                <option value="modal">Modal</option>
              </select>
            </div>
            {formData.action_type === 'link' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target URL</label>
                <input
                  type="url"
                  value={formData.target_url}
                  onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                />
              </div>
            )}
            {formData.action_type === 'api' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API Endpoint</label>
                <input
                  type="url"
                  value={formData.api_endpoint}
                  onChange={(e) => setFormData({ ...formData, api_endpoint: e.target.value })}
                  placeholder="https://api.example.com/add-to-cart"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_enabled}
                onChange={(e) => setFormData({ ...formData, is_enabled: e.target.checked })}
                className="w-4 h-4 text-rose-600 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">Enabled</label>
            </div>
          </div>
          <div className="flex gap-4 mt-6">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
            >
              <Save className="w-5 h-5" />
              Save
            </button>
            <button
              onClick={() => {
                setEditingConfig(null);
                setFormData({
                  product_id: '',
                  button_type: 'add_to_cart',
                  action_type: 'link',
                  target_url: '',
                  api_endpoint: '',
                  is_enabled: true,
                });
              }}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Configurations List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {configs.length === 0 ? (
          <div className="p-8 text-center text-gray-600">No configurations found. Add your first configuration!</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Page</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trigger Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {configs.map((config) => (
                <tr key={config.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {getPageName(config.product_id, config.page_path)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500 capitalize">
                      {config.button_type.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500 capitalize">{config.action_type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {config.action_type === 'link' ? (
                        <a
                          href={config.target_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-rose-600 hover:underline"
                        >
                          {config.target_url}
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      ) : config.action_type === 'api' ? (
                        config.api_endpoint
                      ) : (
                        '-'
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {config.is_enabled === 1 || config.is_enabled === true ? (
                      <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                        Enabled
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full">
                        Disabled
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleEdit(config)}
                      className="text-rose-600 hover:text-rose-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(config.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

