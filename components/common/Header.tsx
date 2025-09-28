import React from 'react';
import { NavLink } from 'react-router-dom';
import { useStore } from '../../hooks/useStore';
import { Role } from '../../types';
import UserIcon from '../icons/UserIcon';
import LogoutIcon from '../icons/LogoutIcon';
import ReceiptIcon from '../icons/ReceiptIcon';
import InventoryIcon from '../icons/InventoryIcon';
import ChartIcon from '../icons/ChartIcon';
import AppleIcon from '../icons/AppleIcon';
import { useTranslation } from '../../hooks/useTranslation';
import GlobeIcon from '../icons/GlobeIcon';

const Header: React.FC = () => {
    const { user, logout, products } = useStore();
    const { t, language, setLanguage } = useTranslation();
    const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 5000).length;

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'hi' : 'en');
    };

    const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
        `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
            isActive
                ? 'bg-primary-dark text-white'
                : 'text-gray-100 hover:bg-primary hover:text-white'
        }`;

    // Get site name from localStorage
    const siteName = typeof window !== 'undefined' ? localStorage.getItem('siteName') || 'Gusain बुज्जी Bhandar' : 'Gusain बुज्जी Bhandार';

    return (
        <header className="bg-primary-dark shadow-md">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <AppleIcon className="h-8 w-8 text-white" />
                        <span className="text-white text-xl font-bold ml-2">{siteName}</span>
                    </div>
                    <nav className="hidden md:flex items-center space-x-4">
                        <NavLink to="/billing" className={navLinkClasses}>
                            <ReceiptIcon className="h-5 w-5 mr-2" />
                            {t('header.billing')}
                        </NavLink>
                        {user?.role === Role.Admin && (
                            <>
                                <NavLink to="/inventory" className={navLinkClasses}>
                                    <InventoryIcon className="h-5 w-5 mr-2" />
                                    {t('header.inventory')}
                                    {lowStockCount > 0 && (
                                        <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                            {lowStockCount}
                                        </span>
                                    )}
                                </NavLink>
                                <NavLink to="/reports" className={navLinkClasses}>
                                    <ChartIcon className="h-5 w-5 mr-2" />
                                    {t('header.reports')}
                                </NavLink>
                            </>
                        )}
                    </nav>
                    <div className="flex items-center">
                        <div className="text-right mr-4 text-white">
                            <p className="font-medium text-sm">{user?.name}</p>
                            <p className="text-xs text-primary-light">{user?.role}</p>
                        </div>
                        <UserIcon className="h-8 w-8 text-white" />
                         <button
                            onClick={toggleLanguage}
                            className="ml-4 p-2 rounded-full text-gray-200 hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-dark focus:ring-white"
                            aria-label="Change Language"
                        >
                            <GlobeIcon className="h-6 w-6" />
                        </button>
                        <button
                            onClick={logout}
                            className="ml-2 p-2 rounded-full text-gray-200 hover:bg-primary-dark hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-dark focus:ring-white"
                            aria-label={t('header.logout')}
                        >
                            <LogoutIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>
             {/* Mobile Navigation */}
            <nav className="md:hidden bg-primary p-2">
                <div className="flex justify-around items-center">
                    <NavLink to="/billing" className={navLinkClasses}>
                        <ReceiptIcon className="h-5 w-5 " />
                        <span className="ml-2">{t('header.billing')}</span>
                    </NavLink>
                    {user?.role === Role.Admin && (
                        <>
                            <NavLink to="/inventory" className={navLinkClasses}>
                                <InventoryIcon className="h-5 w-5" />
                                <span className="ml-2">{t('header.inventory')}</span>
                                {lowStockCount > 0 && (
                                    <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                        {lowStockCount}
                                    </span>
                                )}
                            </NavLink>
                            <NavLink to="/reports" className={navLinkClasses}>
                                <ChartIcon className="h-5 w-5" />
                                <span className="ml-2">{t('header.reports')}</span>
                            </NavLink>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Header;