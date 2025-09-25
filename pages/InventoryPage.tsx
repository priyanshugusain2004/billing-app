import React, { useState, useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import { Product, DiscountTier, User } from '../types';
import ProductFormModal from '../components/inventory/ProductFormModal';
import UserFormModal from '../components/inventory/UserFormModal';
import PlusIcon from '../components/icons/PlusIcon';
import TrashIcon from '../components/icons/TrashIcon';
import { useTranslation } from '../hooks/useTranslation';

const InventoryPage: React.FC = () => {
    const { 
        products, addProduct, updateProduct, deleteProduct: removeProduct, 
        qrCodeUrl, setQrCodeUrl, 
        discountTiers, updateDiscountTiers,
        users, addUser, updateUser, deleteUser
    } = useStore();
    const { t } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<Product | null>(null);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [newQrCodeUrl, setNewQrCodeUrl] = useState(qrCodeUrl || '');
    const [localTiers, setLocalTiers] = useState<DiscountTier[]>([]);

    useEffect(() => {
        setNewQrCodeUrl(qrCodeUrl || '');
    }, [qrCodeUrl]);

    useEffect(() => {
        setLocalTiers(JSON.parse(JSON.stringify(discountTiers)));
    }, [discountTiers]);

    const handleOpenModal = (product: Product | null = null) => {
        setProductToEdit(product);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setProductToEdit(null);
    };

    const handleSaveProduct = (productData: Omit<Product, 'id'> & { id?: string; image: string; }) => {
        if (productData.id) {
            updateProduct(productData as Product);
        } else {
            const { id, ...newProductData } = productData;
            addProduct(newProductData);
        }
        handleCloseModal();
    };
    
    const handleDeleteProduct = (productId: string) => {
        if (window.confirm(t('inventoryPage.deleteConfirm'))) {
            removeProduct(productId);
        }
    };
    
    const handleUpdateQrCode = () => {
        setQrCodeUrl(newQrCodeUrl);
        alert(t('inventoryPage.qrUpdateSuccess'));
    };

    const handleOpenUserModal = (user: User | null = null) => {
        setUserToEdit(user);
        setIsUserModalOpen(true);
    };

    const handleCloseUserModal = () => {
        setIsUserModalOpen(false);
        setUserToEdit(null);
    };

    const handleSaveUser = (userData: Omit<User, 'id'> & { id?: string }) => {
        if (userData.id) {
            const originalUser = users.find(u => u.id === userData.id);
            if (userData.role === 'Admin' && !userData.password && originalUser?.password) {
                userData.password = originalUser.password;
            }
            updateUser(userData as User);
        } else {
            addUser(userData as Omit<User, 'id'>);
        }
        handleCloseUserModal();
    };

    const handleDeleteUser = (userId: string) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            deleteUser(userId);
        }
    };
    
    const handleTierChange = (id: string, field: 'threshold' | 'percentage', value: string) => {
        const numericValue = parseInt(value, 10);
        if (isNaN(numericValue) && value !== '') return;

        setLocalTiers(prev => prev.map(t =>
            t.id === id ? { ...t, [field]: isNaN(numericValue) ? 0 : numericValue } : t
        ));
    };

    const handleAddTier = () => {
        const newTier: DiscountTier = {
            id: `tier-${Date.now()}`,
            threshold: 0,
            percentage: 0
        };
        setLocalTiers(prev => [...prev, newTier]);
    };

    const handleRemoveTier = (id: string) => {
        setLocalTiers(prev => prev.filter(t => t.id !== id));
    };

    const handleSaveDiscounts = () => {
        if (localTiers.some(t => t.threshold <= 0 || t.percentage <= 0)) {
            alert(t('inventoryPage.discountValidationError'));
            return;
        }
        updateDiscountTiers(localTiers);
        alert(t('inventoryPage.discountSaveSuccess'));
    };

    return (
        <div className="container mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">{t('inventoryPage.title')}</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    {t('inventoryPage.addNewProduct')}
                </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-gray-700 mb-4">{t('inventoryPage.storeSettings')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div>
                        <label htmlFor="qr-code-url" className="block text-sm font-medium text-gray-700 mb-1">{t('inventoryPage.qrCodeUrlLabel')}</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                id="qr-code-url"
                                value={newQrCodeUrl}
                                onChange={(e) => setNewQrCodeUrl(e.target.value)}
                                className="flex-grow block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white text-text-secondary"
                                placeholder="https://example.com/qr.png"
                            />
                            <button
                                onClick={handleUpdateQrCode}
                                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
                            >
                                {t('inventoryPage.update')}
                            </button>
                        </div>
                    </div>
                    {qrCodeUrl && (
                        <div>
                            <p className="text-sm font-medium text-gray-700">{t('inventoryPage.qrCodePreview')}</p>
                            <img src={qrCodeUrl} alt="Payment QR Code" className="mt-2 h-32 w-32 border rounded-md p-1 bg-gray-50" />
                        </div>
                    )}
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-bold text-gray-700 mb-2">{t('inventoryPage.discountSettings')}</h3>
                    <p className="text-sm text-gray-500 mb-4">{t('inventoryPage.discountDescription')}</p>
                    
                    <div className="space-y-3">
                        {localTiers.map((tier) => (
                            <div key={tier.id} className="flex items-center gap-2 flex-wrap bg-gray-50 p-3 rounded-md">
                                <span className="text-sm font-medium text-gray-700">{t('inventoryPage.ifSubtotalOver')}</span>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                                    <input
                                        type="number"
                                        value={tier.threshold}
                                        onChange={(e) => handleTierChange(tier.id, 'threshold', e.target.value)}
                                        className="w-28 pl-7 pr-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white text-text-secondary"
                                        min="1"
                                    />
                                </div>
                                <span className="text-sm font-medium text-gray-700">{t('inventoryPage.giveA')}</span>
                                 <div className="relative">
                                    <input
                                        type="number"
                                        value={tier.percentage}
                                        onChange={(e) => handleTierChange(tier.id, 'percentage', e.target.value)}
                                        className="w-24 pr-8 pl-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white text-text-secondary"
                                        min="1"
                                    />
                                     <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">%</span>
                                </div>
                                 <span className="text-sm font-medium text-gray-700">{t('inventoryPage.discount')}</span>
                                <button
                                    onClick={() => handleRemoveTier(tier.id)}
                                    className="ml-auto text-red-500 hover:text-red-700 p-1"
                                    aria-label="Remove tier"
                                >
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-4 flex gap-4">
                        <button
                            onClick={handleAddTier}
                            className="flex items-center bg-gray-200 text-gray-800 px-3 py-2 text-sm rounded-md hover:bg-gray-300 transition-colors"
                        >
                            <PlusIcon className="h-4 w-4 mr-1" />
                            {t('inventoryPage.addTier')}
                        </button>
                        <button
                            onClick={handleSaveDiscounts}
                            className="bg-primary text-white px-4 py-2 text-sm rounded-md hover:bg-primary-dark transition-colors"
                        >
                            {t('inventoryPage.saveDiscounts')}
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-700">{t('inventoryPage.userManagement')}</h2>
                     <button
                        onClick={() => handleOpenUserModal()}
                        className="flex items-center bg-gray-200 text-gray-800 px-3 py-2 text-sm rounded-md hover:bg-gray-300 transition-colors"
                    >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        {t('inventoryPage.addNewUser')}
                    </button>
                </div>
                <div className="overflow-x-auto">
                     <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">{t('inventoryPage.actions')}</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleOpenUserModal(user)} className="text-primary hover:text-primary-dark">{t('inventoryPage.edit')}</button>
                                        <button onClick={() => handleDeleteUser(user.id)} className="ml-4 text-red-600 hover:text-red-800"><TrashIcon className="h-5 w-5" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('inventoryPage.product')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('inventoryPage.category')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('inventoryPage.price')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('inventoryPage.stock')}</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">{t('inventoryPage.actions')}</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {products.length > 0 ? products.map(product => (
                                <tr key={product.id} className={`${product.stock > 0 && product.stock <= 5000 ? 'bg-yellow-50' : ''} ${product.stock === 0 ? 'bg-red-50' : ''}`}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <img className="h-10 w-10 rounded-full object-cover" src={product.image} alt={product.name} />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t(`categories.${product.category}`)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{product.price.toFixed(2)}/kg</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            product.stock > 5000 ? 'bg-green-100 text-green-800' :
                                            product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {(product.stock / 1000).toFixed(2)} kg
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleOpenModal(product)} className="text-primary hover:text-primary-dark">{t('inventoryPage.edit')}</button>
                                        <button onClick={() => handleDeleteProduct(product.id)} className="ml-4 text-red-600 hover:text-red-800"><TrashIcon className="h-5 w-5" /></button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-gray-500">No products in inventory. Click 'Add New Product' to get started.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ProductFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveProduct}
                productToEdit={productToEdit}
            />
            <UserFormModal
                isOpen={isUserModalOpen}
                onClose={handleCloseUserModal}
                onSave={handleSaveUser}
                userToEdit={userToEdit}
            />
        </div>
    );
};

export default InventoryPage;