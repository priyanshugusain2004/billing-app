import React from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { LanguageProvider } from './context/LanguageContext';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import BillingPage from './pages/BillingPage';
import InventoryPage from './pages/InventoryPage';
import ReportsPage from './pages/ReportsPage';
import OwnerAdminPage from './pages/OwnerAdminPage';
import Header from './components/common/Header';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import { useStore } from './hooks/useStore';
import { Role } from './types';
import SiteNameSetupPage from './pages/SiteNameSetupPage';

const AppContent: React.FC = () => {
    const { user } = useStore();
    const [siteName, setSiteName] = React.useState(() => localStorage.getItem('siteName') || '');
    const isAdminPath = typeof window !== 'undefined' && window.location.hash.startsWith('#/admin');

    // Admin routes are fully isolated from shop user/site setup flow.
    if (isAdminPath) {
        return (
            <div className="min-h-screen bg-gray-50 text-text-primary">
                <Routes>
                    <Route path="/admin" element={
                        <AdminRoute>
                            <AdminHeader />
                            <main className="p-4 sm:p-6 lg:p-8">
                                <OwnerAdminPage />
                            </main>
                        </AdminRoute>
                    } />
                    <Route path="/admin/login" element={<AdminLoginPage />} />
                    <Route path="*" element={<Navigate to="/admin/login" replace />} />
                </Routes>
            </div>
        );
    }

    // Show site name setup first for shop app only.
    if (!siteName) {
        return <SiteNameSetupPage onSiteNameSet={setSiteName} />;
    }

    // Shop user routes
    if (!user) {
        return <LoginPage />;
    }

    return (
        <div className="min-h-screen bg-gray-50 text-text-primary">
            <Header />
            <main className="p-4 sm:p-6 lg:p-8">
                <Routes>
                    <Route path="/billing" element={<BillingPage />} />
                    <Route 
                        path="/inventory" 
                        element={
                            <ProtectedRoute allowedRoles={[Role.Admin]}>
                                <InventoryPage />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/reports" 
                        element={
                            <ProtectedRoute allowedRoles={[Role.Admin]}>
                                <ReportsPage />
                            </ProtectedRoute>
                        } 
                    />
                    <Route path="*" element={<Navigate to="/billing" replace />} />
                </Routes>
            </main>
        </div>
    );
};

/**
 * Admin header with logout
 */
const AdminHeader: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('isAdmin');
        navigate('/admin/login');
    };

    return (
        <header className="border-b border-gray-200 bg-white shadow-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
};

const App: React.FC = () => {
    return (
        <AppProvider>
            <LanguageProvider>
                <HashRouter>
                    <AppContent />
                </HashRouter>
            </LanguageProvider>
        </AppProvider>
    );
};

export default App;
