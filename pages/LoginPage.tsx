import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { Role } from '../types';
import AppleIcon from '../components/icons/AppleIcon';
import { useTranslation } from '../hooks/useTranslation';
import { authService } from '../src/services/api';

const LoginPage: React.FC = () => {
    const { setAuthenticatedUser } = useStore();
    const { t } = useTranslation();
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [availableShops, setAvailableShops] = useState<Array<{ id: string; name: string; businessType: string }>>([]);
    const [selectedShopId, setSelectedShopId] = useState('');
    const [signupForm, setSignupForm] = useState({
        shopName: '',
        businessType: 'fruit-shop',
        phone: '',
        username: '',
        address: '',
        paymentReference: '',
    });

    // Get site name from localStorage
    const siteName = typeof window !== 'undefined' ? localStorage.getItem('siteName') || 'gusain billing app' : 'gusain billing app';

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await authService.login(email, password, selectedShopId || undefined);

            const appUser = {
                id: response.user.id,
                name: response.user.username || response.user.email,
                role: response.user.role as Role,
            };

            setAuthenticatedUser(appUser);

            if (response.shop?.name) {
                localStorage.setItem('siteName', response.shop.name);
            }

            setAvailableShops([]);
            setSelectedShopId('');
        } catch (err: any) {
            if (err?.code === 'MULTIPLE_SHOPS_FOUND' && Array.isArray(err?.data?.shops)) {
                setAvailableShops(err.data.shops);
                setError('Multiple shops found. Please select your shop and login again.');
            } else {
                setError(err instanceof Error ? err.message : t('loginPage.passwordError'));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await authService.signup(
                signupForm.shopName,
                signupForm.businessType,
                email,
                signupForm.phone,
                signupForm.username,
                password,
                signupForm.address,
                500,
                signupForm.paymentReference
            );

            const appUser = {
                id: response.user.id,
                name: response.user.username || response.user.email,
                role: response.user.role as Role,
            };

            setAuthenticatedUser(appUser);

            if (response.shop?.name) {
                localStorage.setItem('siteName', response.shop.name);
            }
        } catch (err: any) {
            setError(err instanceof Error ? err.message : 'Signup failed');
        } finally {
            setLoading(false);
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
                <form className="mt-8 space-y-6" onSubmit={mode === 'login' ? handleLogin : handleSignup}>
                    <div className="space-y-4">
                        {mode === 'signup' && (
                            <>
                                <div>
                                    <label htmlFor="shop-name-input" className="block text-sm font-medium text-gray-700">
                                        Shop Name
                                    </label>
                                    <input
                                        id="shop-name-input"
                                        type="text"
                                        value={signupForm.shopName}
                                        onChange={(e) => setSignupForm({ ...signupForm, shopName: e.target.value })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white text-text-secondary"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="business-type-input" className="block text-sm font-medium text-gray-700">
                                        Business Type
                                    </label>
                                    <select
                                        id="business-type-input"
                                        value={signupForm.businessType}
                                        onChange={(e) => setSignupForm({ ...signupForm, businessType: e.target.value })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white text-text-secondary"
                                    >
                                        <option value="fruit-shop">Fruit Shop</option>
                                        <option value="vegetable-shop">Vegetable Shop</option>
                                        <option value="grocery">Grocery</option>
                                        <option value="supermarket">Supermarket</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </>
                        )}

                        <div>
                            <label htmlFor="email-input" className="block text-sm font-medium text-gray-700">
                                Email or Username ({siteName})
                            </label>
                            <input
                                id="email-input"
                                type="text"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setAvailableShops([]);
                                    setSelectedShopId('');
                                }}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white text-text-secondary"
                                placeholder="owner@example.com or admin"
                                required
                            />
                        </div>

                        {mode === 'signup' && (
                            <>
                                <div>
                                    <label htmlFor="phone-input" className="block text-sm font-medium text-gray-700">
                                        Phone
                                    </label>
                                    <input
                                        id="phone-input"
                                        type="tel"
                                        value={signupForm.phone}
                                        onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white text-text-secondary"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="username-input" className="block text-sm font-medium text-gray-700">
                                        Admin Username
                                    </label>
                                    <input
                                        id="username-input"
                                        type="text"
                                        value={signupForm.username}
                                        onChange={(e) => setSignupForm({ ...signupForm, username: e.target.value })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white text-text-secondary"
                                        required
                                    />
                                </div>
                            </>
                        )}

                        <div>
                            <label htmlFor="password-input" className="block text-sm font-medium text-gray-700">
                                {t('loginPage.password')}
                            </label>
                            <input
                                id="password-input"
                                type="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setAvailableShops([]);
                                    setSelectedShopId('');
                                }}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white text-text-secondary"
                                placeholder={t('loginPage.passwordPlaceholder')}
                                required
                            />
                        </div>

                        {mode === 'signup' && (
                            <>
                                <div>
                                    <label htmlFor="address-input" className="block text-sm font-medium text-gray-700">
                                        Address
                                    </label>
                                    <input
                                        id="address-input"
                                        type="text"
                                        value={signupForm.address}
                                        onChange={(e) => setSignupForm({ ...signupForm, address: e.target.value })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white text-text-secondary"
                                    />
                                </div>

                                <div className="rounded-md bg-blue-50 p-2 text-xs text-blue-700">
                                    Subscription onboarding fee: INR 500
                                </div>

                                <div>
                                    <label htmlFor="payment-ref-input" className="block text-sm font-medium text-gray-700">
                                        Payment Reference (Txn ID)
                                    </label>
                                    <input
                                        id="payment-ref-input"
                                        type="text"
                                        value={signupForm.paymentReference}
                                        onChange={(e) => setSignupForm({ ...signupForm, paymentReference: e.target.value })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white text-text-secondary"
                                        placeholder="e.g. UPI123456789"
                                        required
                                    />
                                </div>
                            </>
                        )}

                        {availableShops.length > 0 && (
                            <div>
                                <label htmlFor="shop-select" className="block text-sm font-medium text-gray-700">
                                    Select Shop
                                </label>
                                <select
                                    id="shop-select"
                                    value={selectedShopId}
                                    onChange={(e) => setSelectedShopId(e.target.value)}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white text-text-secondary border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                                    required
                                >
                                    <option value="" disabled>-- Choose a shop --</option>
                                    {availableShops.map((shop) => (
                                        <option key={shop.id} value={shop.id}>
                                            {shop.name} ({shop.businessType})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                    
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            {loading ? (mode === 'login' ? 'Signing in...' : 'Creating shop...') : (mode === 'login' ? t('loginPage.loginButton') : 'Create Shop')}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-4 text-sm">
                    {mode === 'login' ? (
                        <button
                            type="button"
                            onClick={() => {
                                setMode('signup');
                                setError('');
                                setAvailableShops([]);
                            }}
                            className="text-blue-600 font-medium hover:underline"
                        >
                            New user? Create Shop
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => {
                                setMode('login');
                                setError('');
                            }}
                            className="text-blue-600 font-medium hover:underline"
                        >
                            Already have account? Login
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginPage;