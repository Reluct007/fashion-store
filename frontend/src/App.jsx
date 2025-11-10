import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import './App.css';

function App() {
  return (
    <Router>
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
    </Router>
  );
}

export default App;
