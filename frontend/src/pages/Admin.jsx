import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, Users, ShoppingCart, TrendingUp, 
  Plus, Edit, Trash2, Save, X 
} from 'lucide-react';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    category: '',
    description: '',
    image: '',
    onSale: false
  });

  // Sample data
  useEffect(() => {
    setProducts([
      {
        id: 1,
        name: 'Elegant Summer Dress',
        price: 89.99,
        originalPrice: 129.99,
        category: 'Dresses',
        description: 'Beautiful summer dress',
        image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
        onSale: true
      },
      {
        id: 2,
        name: 'Classic White Shirt',
        price: 49.99,
        category: 'Tops',
        description: 'Classic white shirt',
        image: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=400',
        onSale: false
      }
    ]);
  }, []);

  const handleEdit = (product) => {
    setEditingProduct(product.id);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      category: product.category,
      description: product.description,
      image: product.image,
      onSale: product.onSale || false
    });
  };

  const handleSave = () => {
    if (editingProduct) {
      setProducts(products.map(p => 
        p.id === editingProduct 
          ? { ...p, ...formData, price: parseFloat(formData.price), originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null }
          : p
      ));
    } else {
      const newProduct = {
        id: Date.now(),
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null
      };
      setProducts([...products, newProduct]);
    }
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      originalPrice: '',
      category: '',
      description: '',
      image: '',
      onSale: false
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const stats = {
    totalProducts: products.length,
    totalSales: 1250,
    totalRevenue: 125000,
    activeUsers: 3420
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <Link 
            to="/"
            className="px-4 py-2 text-gray-700 hover:text-rose-600 transition-colors"
          >
            Back to Store
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'dashboard'
                ? 'text-rose-600 border-b-2 border-rose-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'products'
                ? 'text-rose-600 border-b-2 border-rose-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'orders'
                ? 'text-rose-600 border-b-2 border-rose-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Orders
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Total Products</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
                  </div>
                  <Package className="w-12 h-12 text-rose-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Total Sales</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalSales}</p>
                  </div>
                  <ShoppingCart className="w-12 h-12 text-rose-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-rose-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Active Users</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.activeUsers}</p>
                  </div>
                  <Users className="w-12 h-12 text-rose-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
              <p className="text-gray-600">No recent activity to display.</p>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Products Management</h2>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setFormData({
                    name: '',
                    price: '',
                    originalPrice: '',
                    category: '',
                    description: '',
                    image: '',
                    onSale: false
                  });
                }}
                className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Product
              </button>
            </div>

            {/* Product Form */}
            {(editingProduct || !products.length) && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Original Price (optional)</label>
                    <input
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    >
                      <option value="">Select Category</option>
                      <option value="Dresses">Dresses</option>
                      <option value="Tops">Tops</option>
                      <option value="Bottoms">Bottoms</option>
                      <option value="Outerwear">Outerwear</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.onSale}
                      onChange={(e) => setFormData({ ...formData, onSale: e.target.checked })}
                      className="w-4 h-4 text-rose-600 border-gray-300 rounded focus:ring-rose-500"
                    />
                    <label className="text-sm font-medium text-gray-700">On Sale</label>
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
                      setEditingProduct(null);
                      setFormData({
                        name: '',
                        price: '',
                        originalPrice: '',
                        category: '',
                        description: '',
                        image: '',
                        onSale: false
                      });
                    }}
                    className="flex items-center gap-2 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <X className="w-5 h-5" />
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Products List */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover mr-4" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">${product.price}</div>
                        {product.originalPrice && (
                          <div className="text-sm text-gray-500 line-through">${product.originalPrice}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.onSale ? (
                          <span className="px-2 py-1 text-xs font-semibold bg-rose-100 text-rose-800 rounded-full">On Sale</span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full">Active</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-rose-600 hover:text-rose-900 mr-4"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Orders Management</h2>
            <p className="text-gray-600">Orders management functionality will be implemented here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

