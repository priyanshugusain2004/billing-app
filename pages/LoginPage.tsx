import React, { useState, useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import { Role } from '../types';
import AppleIcon from '../components/icons/AppleIcon';
import { useTranslation } from '../hooks/useTranslation';

const LoginPage: React.FC = () => {
    const { users, login } = useStore();
    const { t } = useTranslation();
    const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || '');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Get site name from localStorage
    const siteName = typeof window !== 'undefined' ? localStorage.getItem('siteName') || 'gusain billing app' : 'gusain billing app';

    const selectedUser = users.find(u => u.id === selectedUserId);
    const isAdminSelected = selectedUser?.role === Role.Admin;
    
    useEffect(() => {
        // Reset password and error when user selection changes
        setPassword('');
        setError('');
    }, [selectedUserId]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUserId) {
            setError(t('loginPage.error'));
            return;
        }
        
        const success = login(selectedUserId, password);

        if (!success) {
            setError(t('loginPage.passwordError'));
        } else {
            setError('');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-sm p-8 space-y-8 bg-white rounded-xl shadow-lg">
                <div className="text-center">
                    <div className="flex items-center justify-center mb-4">
                        <AppleIcon className="h-12 w-12 text-primary" />
                        <h1 className="text-3xl font-bold text-primary-dark ml-2">{siteName}</h1>
                    </div>
                    <h2 className="text-xl text-gray-600">{t('loginPage.subtitle')}</h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="user-select" className="block text-sm font-medium text-gray-700">
                                {t('loginPage.selectUser')} ({siteName})
                            </label>
                            <select
                                id="user-select"
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white text-text-secondary border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                            >
                                <option value="" disabled>{t('loginPage.chooseUser')}</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.name} ({user.role})
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        {isAdminSelected && (
                             <div>
                                <label htmlFor="password-input" className="block text-sm font-medium text-gray-700">
                                    {t('loginPage.password')}
                                </label>
                                <input
                                    id="password-input"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white text-text-secondary"
                                    placeholder={t('loginPage.passwordPlaceholder')}
                                    required
                                />
                            </div>
                        )}
                    </div>
                    
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            {t('loginPage.loginButton')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;