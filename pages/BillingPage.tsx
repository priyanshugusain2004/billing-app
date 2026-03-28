
import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import { ProductCategory, Product, PaymentMethod } from '../types';
import ProductCard from '../components/billing/ProductCard';
import Cart from '../components/billing/Cart';
import PaymentModal from '../components/billing/PaymentModal';
import SearchIcon from '../components/icons/SearchIcon';
import WeightInputModal from '../components/billing/WeightInputModal';
import { useTranslation } from '../hooks/useTranslation';

const BillingPage: React.FC = () => {
    const { products, addToCart, addSale, cart, discountTiers, shopLayout } = useStore();
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const shopId = typeof window !== 'undefined' ? localStorage.getItem('shopId') || 'local-default' : 'local-default';
    const shopBusinessType = typeof window !== 'undefined'
        ? localStorage.getItem(`${shopId}:shopBusinessType`) || ''
        : '';

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [products, searchTerm, selectedCategory]);

    const subtotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price / 1000) * item.weightInGrams, 0), [cart]);
    
    const { discount, discountPercentage } = useMemo(() => {
        const applicableTier = [...discountTiers]
            .sort((a, b) => b.threshold - a.threshold) // Sort descending by threshold to find the best match
            .find(tier => subtotal >= tier.threshold);

        if (applicableTier) {
            const calculatedDiscount = subtotal * (applicableTier.percentage / 100);
            return { discount: calculatedDiscount, discountPercentage: applicableTier.percentage };
        }

        return { discount: 0, discountPercentage: 0 };
    }, [subtotal, discountTiers]);

    const finalTotal = useMemo(() => {
        const calculatedTotal = subtotal - discount;
        return calculatedTotal < 0 ? 0 : calculatedTotal;
    }, [subtotal, discount]);
    
    const handleProductSelect = (product: Product) => {
        setSelectedProduct(product);
        setIsWeightModalOpen(true);
    };

    const handleAddToCart = (product: Product, weight: number) => {
        addToCart(product, weight);
        setIsWeightModalOpen(false);
        setSelectedProduct(null);
    };

    const handleProceedToPayment = () => {
        if (cart.length > 0) {
            setIsPaymentModalOpen(true);
        }
    };
    
    const handleFinalizeSale = (paymentMethod: PaymentMethod) => {
        const saleData = {
            items: cart,
            total: subtotal,
            discount,
            finalTotal,
            paymentMethod
        };
        addSale(saleData);
        setIsPaymentModalOpen(false);
    };

    const categories = useMemo(() => {
        if (shopBusinessType === 'fruit-shop') {
            return ['all', ProductCategory.Fruit, ProductCategory.Other];
        }

        if (shopBusinessType === 'vegetable-shop') {
            return ['all', ProductCategory.Vegetable, ProductCategory.Other];
        }

        return ['all', ...Object.values(ProductCategory)];
    }, [shopBusinessType]);

    useEffect(() => {
        if (shopBusinessType === 'fruit-shop') {
            setSelectedCategory(ProductCategory.Fruit);
            return;
        }

        if (shopBusinessType === 'vegetable-shop') {
            setSelectedCategory(ProductCategory.Vegetable);
            return;
        }

        setSelectedCategory('all');
    }, [shopBusinessType]);

    const billingShellClass =
        shopLayout === 'compact'
            ? 'grid grid-cols-1 xl:grid-cols-4 gap-4 h-[calc(100vh-8rem)]'
            : 'grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]';

    const pageToneClass =
        shopLayout === 'market'
            ? 'rounded-2xl p-3 bg-[linear-gradient(120deg,#fff7ed,white,#ecfeff)]'
            : shopLayout === 'compact'
                ? 'rounded-xl p-2 bg-[linear-gradient(120deg,#f8fafc,white,#eef2ff)]'
                : '';

    const productPanelClass =
        shopLayout === 'market'
            ? 'lg:col-span-2 bg-gradient-to-br from-orange-50 via-white to-emerald-50 p-6 rounded-xl shadow-md flex flex-col'
            : 'lg:col-span-2 bg-white p-6 rounded-lg shadow-md flex flex-col';

    const productGridClass =
        shopLayout === 'compact'
            ? 'grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3'
            : shopLayout === 'market'
                ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
                : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6';

    return (
        <div className={`${pageToneClass} ${billingShellClass}`}>
            {/* Products Section */}
            <div className={productPanelClass}>
                <div className="mb-4">
                    <h1 className="text-2xl font-bold text-gray-800">{t('billingPage.productsTitle')}</h1>
                    <div className="mt-4 flex flex-col sm:flex-row gap-4">
                         {/* Search Input */}
                        <div className="relative flex-grow">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <SearchIcon className="h-5 w-5 text-gray-400" />
                            </span>
                            <input
                                type="text"
                                placeholder={t('billingPage.searchInputPlaceholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-full focus:ring-primary focus:border-primary bg-white text-text-secondary"
                            />
                        </div>
                         {/* Category Filters */}
                        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                            {categories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category as ProductCategory | 'all')}
                                    className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                                        selectedCategory === category
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    {category === 'all' ? t('billingPage.allCategory') : t(`categories.${category as ProductCategory}`)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto -m-2 p-2">
                    <div className={productGridClass}>
                        {filteredProducts.map((product: Product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onSelectProduct={handleProductSelect}
                                layout={shopLayout}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Cart Section */}
            <div className="lg:col-span-1 h-full">
                <Cart 
                    onProceedToPayment={handleProceedToPayment} 
                    subtotal={subtotal}
                    discount={discount}
                    discountPercentage={discountPercentage}
                    finalTotal={finalTotal}
                    layout={shopLayout}
                />
            </div>
            
            <WeightInputModal
                isOpen={isWeightModalOpen}
                product={selectedProduct}
                onAddToCart={handleAddToCart}
                onClose={() => setIsWeightModalOpen(false)}
            />

            <PaymentModal 
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onFinalize={handleFinalizeSale}
                finalTotal={finalTotal}
            />
        </div>
    );
};

export default BillingPage;