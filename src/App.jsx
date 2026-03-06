import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Toast from './components/Toast/Toast';
import Home from './pages/Home/Home';
import Products from './pages/Products/Products';
import Cart from './pages/Cart/Cart';
import About from './pages/About/About';
import Contact from './pages/Contact/Contact';
import AdminLogin from './pages/AdminLogin/AdminLogin';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import './App.css';

function MainLayout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}

function AdminLayout({ children }) {
  return <>{children}</>;
}

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="app">
      {isAdminRoute ? (
        <AdminLayout>
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </AdminLayout>
      ) : (
        <MainLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/productos" element={<Products />} />
            <Route path="/carrito" element={<Cart />} />
            <Route path="/nosotros" element={<About />} />
            <Route path="/contacto" element={<Contact />} />
          </Routes>
        </MainLayout>
      )}
      <Toast />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}

export default App;
