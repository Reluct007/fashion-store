import { useState, useEffect } from 'react';
import { getClickStats, getClickStatsDetail } from '../lib/api';
import { BarChart3, Calendar, Filter, ExternalLink } from 'lucide-react';

export default function ClickStatsManager() {
  const [stats, setStats] = useState([]);
  const [detailStats, setDetailStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('summary'); // 'summary' or 'detail'
  const [filters, setFilters] = useState({
    target_url: '',
    page_type: '',
    start_date: '',
    end_date: ''
  });
  const [selectedUrl, setSelectedUrl] = useState(null);

  useEffect(() => {
    loadStats();
  }, [filters, viewMode]);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (viewMode === 'summary') {
        const data = await getClickStats(filters);
        setStats(data);
      } else {
        const data = await getClickStatsDetail(filters);
        setDetailStats(data);
      }
    } catch (err) {
      setError('Failed to load stats: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleViewDetail = (targetUrl) => {
    setSelectedUrl(targetUrl);
    setViewMode('detail');
    setFilters({ ...filters, target_url: targetUrl });
  };

  const getPageTypeLabel = (pageType, pageId, pagePath) => {
    if (pageType === 'home') return 'Home Page';
    if (pageType === 'product') return `Product #${pageId}`;
    if (pageType === 'page') return pagePath || 'Custom Page';
    if (pageType === 'list') return 'List Page';
    return pageType || 'Unknown';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-600">Loading statistics...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Link Click Statistics</h2>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setViewMode('summary');
              setSelectedUrl(null);
              setFilters({ ...filters, target_url: '' });
            }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'summary'
                ? 'bg-rose-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <BarChart3 className="w-5 h-5 inline mr-2" />
            Summary
          </button>
          <button
            onClick={() => {
              setViewMode('detail');
              setSelectedUrl(null);
            }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'detail'
                ? 'bg-rose-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Calendar className="w-5 h-5 inline mr-2" />
            Detail
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target URL</label>
            <input
              type="text"
              value={filters.target_url}
              onChange={(e) => handleFilterChange('target_url', e.target.value)}
              placeholder="Filter by URL"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Page Type</label>
            <select
              value={filters.page_type}
              onChange={(e) => handleFilterChange('page_type', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
            >
              <option value="">All Types</option>
              <option value="home">Home Page</option>
              <option value="product">Product Page</option>
              <option value="page">Custom Page</option>
              <option value="list">List Page</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => handleFilterChange('start_date', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => handleFilterChange('end_date', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>
      </div>

      {/* Summary View */}
      {viewMode === 'summary' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {stats.length === 0 ? (
            <div className="p-8 text-center text-gray-600">No statistics found.</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target URL</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Page</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Click Count</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">First Click</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Click</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.map((stat, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4">
                      <a
                        href={stat.target_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-rose-600 hover:underline flex items-center gap-1 max-w-xs truncate"
                      >
                        {stat.target_url}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {getPageTypeLabel(stat.page_type, stat.page_id, stat.page_path)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-bold text-rose-600">{stat.click_count}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(stat.first_click)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(stat.last_click)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleViewDetail(stat.target_url)}
                        className="text-rose-600 hover:text-rose-900 text-sm"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Detail View */}
      {viewMode === 'detail' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {detailStats.length === 0 ? (
            <div className="p-8 text-center text-gray-600">No detailed records found.</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target URL</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Page</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Click Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {detailStats.map((stat) => (
                  <tr key={stat.id}>
                    <td className="px-6 py-4">
                      <a
                        href={stat.target_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-rose-600 hover:underline flex items-center gap-1 max-w-xs truncate"
                      >
                        {stat.target_url}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {getPageTypeLabel(stat.page_type, stat.page_id, stat.page_path)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(stat.click_time)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {stat.referer || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

