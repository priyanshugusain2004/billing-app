import React from 'react';
import { Product } from '../../types';
import PlusIcon from '../icons/PlusIcon';
import { useTranslation } from '../../hooks/useTranslation';

interface ProductCardProps {
    product: Product;
    onSelectProduct: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onSelectProduct }) => {
    const { t } = useTranslation();
    const isLowStock = product.stock > 0 && product.stock <= 5000;
    const isOutOfStock = product.stock === 0;

    const handleImageClick = () => {
        if (!isOutOfStock) {
            onSelectProduct(product);
        }
    };

    return (
        <div className={`relative rounded-lg shadow-md overflow-hidden border ${isOutOfStock ? 'border-gray-300 bg-gray-200' : 'border-gray-200 bg-white'} transition-transform duration-200 hover:scale-105`}>
            {isLowStock && !isOutOfStock && (
                <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full z-10">
                    {t('productCard.lowStock')}
                </div>
            )}
             {isOutOfStock && (
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                    {t('productCard.outOfStock')}
                </div>
            )}
            <div 
                className="relative group"
                onClick={handleImageClick}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleImageClick(); } }}
                role="button"
                tabIndex={isOutOfStock ? -1 : 0}
                aria-label={isOutOfStock ? t('productCard.outOfStockLabel', { productName: product.name }) : t('productCard.addToCartLabel', { productName: product.name })}
            >
                <img src={product.image} alt={product.name} className="w-full h-40 object-cover" loading="lazy" />
                {isOutOfStock ? (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center cursor-not-allowed">
                         <span className="text-white font-bold">{t('productCard.outOfStock')}</span>
                    </div>
                ) : (
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center cursor-pointer transition-all duration-300" aria-hidden="true">
                        <span className="text-white text-2xl font-bold opacity-0 group-hover:opacity-100 transform scale-150 group-hover:scale-100 transition-all duration-300">
                            <PlusIcon className="h-10 w-10" />
                        </span>
                    </div>
                )}
            </div>

            <div className="p-4">
                <h3 className="text-lg font-semibold text-text-primary">{product.name}</h3>
                <p className="text-sm text-text-secondary">{t(`categories.${product.category}`)}</p>
                <div className="mt-4">
                    <span className="text-xl font-bold text-primary-dark">₹{product.price.toFixed(2)}/kg</span>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;