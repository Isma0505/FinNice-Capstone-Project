import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from './contexts/ThemeContext';
import { useLocale } from './contexts/LocaleContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ErrorBoundary from './components/ErrorBoundary';
import TransactionsPage from './pages/TransactionsPage';
import BudgetPage from './pages/BudgetPage';
import Sidebar from './components/Sidebar';
import AccountsPage from './pages/AccountsPage';
import SettingsPage from './pages/SettingsPage';
import LandingPage from './pages/LandingPage';
import AIAdvisor from './components/common/AIAdvisor';
import { getBudgets, getTransactions, setActiveUserData } from './utils/api';
import { FaMoon, FaSun, FaBars } from 'react-icons/fa';
import { FiGlobe } from 'react-icons/fi';
import { HiOutlineLanguage } from 'react-icons/hi2';

// Avatar map (ditaruh di luar komponen biar gak dibuat ulang)
const avatarMap = {
  avatar1: { icon: 'fa-user-circle', color: '#00e6b8', bg: 'var(--accent-dim)' },
  avatar2: { icon: 'fa-cat', color: '#ffb347', bg: 'rgba(255, 179, 71, 0.15)' },
  avatar3: { icon: 'fa-dog', color: '#ff7b8a', bg: 'rgba(255, 123, 138, 0.15)' },
  avatar4: { icon: 'fa-otter', color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.15)' },
  avatar5: { icon: 'fa-dragon', color: '#34d399', bg: 'rgba(52, 211, 153, 0.15)' },
  avatar6: { icon: 'fa-frog', color: '#f87171', bg: 'rgba(248, 113, 113, 0.15)' },
  avatar7: { icon: 'fa-kiwi-bird', color: '#fb923c', bg: 'rgba(251, 146, 60, 0.15)' },
  avatar8: { icon: 'fa-hippo', color: '#818cf8', bg: 'rgba(129, 140, 248, 0.15)' },
};

// Komponen utama yang pake router
function AppContent() {
  const { theme, toggleTheme } = useTheme();
  const { locale, toggleLocale } = useLocale();
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem('finnice_user');
  });
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('finnice_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAIAdvisor, setShowAIAdvisor] = useState(false);
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  const location = useLocation();
  const [avatar, setAvatar] = useState(() => {
    return localStorage.getItem('finnice_avatar') || 'avatar1';
  });
  const [customAvatar, setCustomAvatar] = useState(() => {
    return localStorage.getItem('finnice_custom_avatar') || null;
  });

  // Fungsi sapaan berdasarkan jam
  const getGreeting = () => {
    const hour = new Date().getHours();
    const firstName = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'User';
    
    if (hour < 12) {
      return locale === 'id' ? `Selamat pagi, ${firstName}! ☀️` : `Good morning, ${firstName}! ☀️`;
    } else if (hour < 18) {
      return locale === 'id' ? `Selamat siang, ${firstName}! 🌤️` : `Good afternoon, ${firstName}! 🌤️`;
    } else {
      return locale === 'id' ? `Selamat malam, ${firstName}! 🌙` : `Good evening, ${firstName}! 🌙`;
    }
  };

  // Cursor glow effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Fetch budgets & transactions untuk AI Advisor
  useEffect(() => {
    const fetchData = async () => {
      const budgetResult = await getBudgets();
      const txResult = await getTransactions();
      if (!budgetResult.error) setBudgets(budgetResult.data);
      if (!txResult.error) setTransactions(txResult.data);
    };
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn]);

  // Listen perubahan avatar dari SettingsPage
  useEffect(() => {
    const handleAvatarChange = () => {
      const newAvatar = localStorage.getItem('finnice_avatar');
      const newCustomAvatar = localStorage.getItem('finnice_custom_avatar');
      if (newAvatar) setAvatar(newAvatar);
      if (newCustomAvatar) setCustomAvatar(newCustomAvatar);
      if (!newAvatar && !newCustomAvatar) {
        setAvatar('avatar1');
        setCustomAvatar(null);
      }
    };
    window.addEventListener('avatarChanged', handleAvatarChange);
    return () => window.removeEventListener('avatarChanged', handleAvatarChange);
  }, []);

  useEffect(() => {
    const handleUserChange = () => {
      const savedUser = localStorage.getItem('finnice_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
        setIsLoggedIn(true);
      }
    };

    window.addEventListener('userChanged', handleUserChange);
    return () => window.removeEventListener('userChanged', handleUserChange);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleLogin = (userData) => {
    console.log('🔍 App.jsx handleLogin received:', userData);
    setIsLoggedIn(true);
    setUser(userData);
    localStorage.setItem('finnice_user', JSON.stringify(userData));
    setActiveUserData(userData);
    navigate('/');
    window.location.reload(); // ← TAMBAHKAN INI
  };

  const handleRegister = (userData) => {
    const userProfile = { name: userData.name, email: userData.email };
    localStorage.setItem('finnice_user', JSON.stringify(userProfile));
    setActiveUserData(userProfile);

    setIsLoggedIn(true);
    setUser(userProfile);
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('finnice_user');
    setIsLoggedIn(false);
    setUser(null);
    window.location.href = '/login';
  };

  // Fungsi buat dapetin avatar aktif
  const getCurrentAvatar = () => {
    if (customAvatar) {
      return { type: 'custom', src: customAvatar };
    }
    const defaultAvatar = avatarMap[avatar] || avatarMap.avatar1;
    return { type: 'icon', ...defaultAvatar };
  };

  const currentAvatar = getCurrentAvatar();


  // Hitung total untuk AI Advisor
  const totalIncome = transactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalExpense = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Halaman Auth (belum login)
  if (!isLoggedIn) {
    return (
      <div className="app-container">
        <main>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage onLogin={handleLogin} onSwitchToRegister={() => navigate('/register')} />} />
            <Route path="/register" element={<RegisterPage onRegister={handleRegister} onSwitchToLogin={() => navigate('/login')} />} />
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </main>
      </div>
    );
  }

  // Halaman utama (sudah login)
  return (
    <>
      {/* Cursor Glow Effect - PASTI JALAN */}
      {/* Cursor Glow - Elegant Version */}
      <div 
        style={{
          position: 'fixed',
          left: mousePos.x - 100,
          top: mousePos.y - 100,
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: `radial-gradient(circle, 
            ${theme === 'dark' ? '#b4ece1' : '#00b894'} 0%, 
            ${theme === 'dark' ? '#bfa8f4' : '#a78bfa'} 60%, 
            transparent 100%)`,
          pointerEvents: 'none',
          zIndex: 9999,
          opacity: 0.12,
          filter: 'blur(40px)',
          transition: 'all 0.081 linear'
        }}
      />
      
      <ErrorBoundary>
      <div className="app-layout">
        <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
          <FaBars />
        </button>
        
        <Sidebar 
          activePage={location.pathname.slice(1) || 'dashboard'}
          onNavigate={(page) => {
            navigate(`/${page}`);
            setSidebarOpen(false);
          }}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onLogout={handleLogout}
        />
        
        <div className="main-content">
          <header className="app-header">
            {/* Avatar + Sapaan Dinamis */}
            <div className="app-header-profile">
              {currentAvatar.type === 'custom' ? (
                <img 
                  src={currentAvatar.src} 
                  alt="avatar" 
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '12px',
                    objectFit: 'cover',
                    border: 'none'
                  }} 
                />
              ) : (
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '12px',
                  background: currentAvatar.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  color: currentAvatar.color
                }}>
                  <i className={`fa-solid ${currentAvatar.icon}`}></i>
                </div>
              )}
              
              <div className="app-header-greeting">
                <div className="app-header-title">
                  {getGreeting()}
                </div>
                <div className="app-header-subtitle">
                  {locale === 'id' ? 'Yuk kelola keuanganmu 💰' : 'Let\'s manage your finances 💰'}
                </div>
              </div>
            </div>
            
            <div className="app-header-actions">
              {/* Tombol AI Advisor */}
              <button 
                onClick={() => setShowAIAdvisor(true)}
                className="app-header-ai-btn"
              >
                <i className="fa-solid fa-robot"></i>
                AI Advisor
              </button>
              
              <button onClick={toggleLocale} className="icon-btn app-header-icon-btn">
                {locale === 'id' ? <FiGlobe /> : <HiOutlineLanguage />}
              </button>
              <button onClick={toggleTheme} className="icon-btn app-header-icon-btn">
                {theme === 'light' ? <FaMoon /> : <FaSun />}
              </button>
            </div>
          </header>
          
          <main style={{ padding: '24px' }}>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/budget" element={<BudgetPage />} />
              <Route path="/accounts" element={<AccountsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
        </div>
        
        {/* Modal AI Advisor */}
        <AIAdvisor 
          isOpen={showAIAdvisor}
          onClose={() => setShowAIAdvisor(false)}
          budgets={budgets}
          transactions={transactions}
          totalExpense={totalExpense}
          totalIncome={totalIncome}
        />
        </div>
      </ErrorBoundary>
    </>
  );
}

// App utama dengan BrowserRouter
function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;