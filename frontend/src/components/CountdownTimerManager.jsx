import { useState, useEffect } from 'react';
import { Clock, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { getProducts } from '../lib/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://fashion-store-api.reluct007.workers.dev';

export default function CountdownTimerManager() {
  const [timers, setTimers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTimer, setEditingTimer] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    product_id: '',
    category: '',
    title: '',
    end_date: '',
    is_enabled: true
  });

  useEffect(() => {
    loadTimers();
    loadProducts();
  }, []);

  const loadTimers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/countdown-timers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to load countdown timers');
      
      const data = await response.json();
      setTimers(data);
    } catch (err) {
      setError('Failed to load countdown timers: ' + err.message);
      console.error('Error loading countdown timers:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(data.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Error loading products:', err);
    }
  };

  const handleEdit = (timer) => {
    setEditingTimer(timer.id);
    setShowForm(true);
    setFormData({
      product_id: timer.product_id || '',
      category: timer.category || '',
      title: timer.title || '',
      end_date: timer.end_date ? timer.end_date.replace(' ', 'T').substring(0, 16) : '',
      is_enabled: timer.is_enabled === 1
    });
  };

  const handleSave = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('auth_token');
      
      // Validate: must have either product_id or category
      if (!formData.product_id && !formData.category) {
        setError('Please select either a product or a category');
        return;
      }
      
      if (!formData.end_date) {
        setError('Please select an end date');
        return;
      }
      
      const timerData = {
        ...formData,
        product_id: formData.product_id ? parseInt(formData.product_id) : null,
        category: formData.category || null,
        end_date: new Date(formData.end_date).toISOString(),
        is_enabled: formData.is_enabled ? 1 : 0
      };
      
      if (editingTimer) {
        timerData.id = editingTimer;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/countdown-timers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(timerData)
      });
      
      if (!response.ok) throw new Error('Failed to save countdown timer');
      
      await loadTimers();
      
      setEditingTimer(null);
      setShowForm(false);
      setFormData({
        product_id: '',
        category: '',
        title: '',
        end_date: '',
        is_enabled: true
      });
    } catch (err) {
      setError('Failed to save countdown timer: ' + err.message);
      console.error('Error saving countdown timer:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this countdown timer?')) {
      return;
    }
    
    try {
      setError(null);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/countdown-timers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to delete countdown timer');
      
      await loadTimers();
    } catch (err) {
      setError('Failed to delete countdown timer: ' + err.message);
      console.error('Error deleting countdown timer:', err);
    }
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : `Product #${productId}`;
  };

  if (loading) {
    return <div className="text-center py-8">Loading countdown timers...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Clock className="w-6 h-6" />
          Countdown Timer Settings
        </h2>
        <button
          onClick={() => {
            setEditingTimer(null);
            setShowForm(true);
            setFormData({
              product_id: '',
              category: '',
              title: '',
              end_date: '',
              is_enabled: true
            });
          }}
          className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Timer
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">
            {editingTimer ? 'Edit Countdown Timer' : 'New Countdown Timer'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Product (Optional)
              </label>
              <select
                value={formData.product_id}
                onChange={(e) => setFormData({ ...formData, product_id: e.target.value, category: '' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              >
                <option value="">-- Select Product --</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or Select Category (Optional)
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value, product_id: '' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                disabled={!!formData.product_id}
              >
                <option value="">-- Select Category --</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title (Optional)
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Lowest Price! Black Friday ends in:"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date & Time *
              </label>
              <input
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_enabled"
                checked={formData.is_enabled}
                onChange={(e) => setFormData({ ...formData, is_enabled: e.target.checked })}
                className="w-4 h-4 text-rose-600 border-gray-300 rounded focus:ring-rose-500"
              />
              <label htmlFor="is_enabled" className="ml-2 text-sm text-gray-700">
                Enabled
              </label>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={() => {
                setEditingTimer(null);
                setShowForm(false);
                setFormData({
                  product_id: '',
                  category: '',
                  title: '',
                  end_date: '',
                  is_enabled: true
                });
              }}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Timers List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Target
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                End Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {timers.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No countdown timers configured
                </td>
              </tr>
            ) : (
              timers.map((timer) => (
                <tr key={timer.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {timer.product_id ? (
                      <div className="text-sm font-medium text-gray-900">
                        Product: {getProductName(timer.product_id)}
                      </div>
                    ) : timer.category ? (
                      <div className="text-sm font-medium text-gray-900">
                        Category: {timer.category}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">All Products</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{timer.title || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(timer.end_date).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      timer.is_enabled === 1 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {timer.is_enabled === 1 ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(timer)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(timer.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
