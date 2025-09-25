
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { LanguageProvider } from './context/LanguageContext';
import LoginPage from './pages/LoginPage';
import BillingPage from './pages/BillingPage';
import InventoryPage from './pages/InventoryPage';
import ReportsPage from './pages/ReportsPage';
import Header from './components/common/Header';
import ProtectedRoute from './components/common/ProtectedRoute';
import { useStore } from './hooks/useStore';
import { Role } from './types';

const AppContent: React.FC = () => {
    const { user } = useStore();

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