import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Products from './pages/Products';
import CategoryPage from './pages/CategoryPage';
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import StaticPage from './pages/StaticPage';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import ExitIntentPopup from './components/ExitIntentPopup';
import FloatingGiftButton from './components/FloatingGiftButton';
import './App.css';

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } 
        />
        <Route path="/product/:id" element={<ProductDetail />} />
        {/* Category and Collection Routes */}
        <Route path="/women" element={<CategoryPage />} />
        <Route path="/men" element={<CategoryPage />} />
        <Route path="/kids" element={<CategoryPage />} />
        <Route path="/category/:category" element={<CategoryPage />} />
        <Route path="/collection/:category" element={<CategoryPage />} />
        <Route path="/sale" element={<CategoryPage />} />
        {/* Static Pages */}
        <Route path="/careers" element={<StaticPage />} />
        <Route path="/blog" element={<StaticPage />} />
        <Route path="/shipping" element={<StaticPage />} />
        <Route path="/returns" element={<StaticPage />} />
        <Route path="/size-guide" element={<StaticPage />} />
        <Route path="/faq" element={<StaticPage />} />
        <Route path="/privacy" element={<StaticPage />} />
        <Route path="/terms" element={<StaticPage />} />
        <Route path="/cookies" element={<StaticPage />} />
      </Routes>

      {/* 只在非管理页面显示挽留功能 */}
      {!isAdminPage && (
        <>
          <ExitIntentPopup />
          <FloatingGiftButton />
        </>
      )}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
