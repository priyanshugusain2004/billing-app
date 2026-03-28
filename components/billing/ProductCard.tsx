import React from 'react';
import { Product, ShopLayoutTemplate } from '../../types';
import PlusIcon from '../icons/PlusIcon';
import { useTranslation } from '../../hooks/useTranslation';

interface ProductCardProps {
    product: Product;
    onSelectProduct: (product: Product) => void;
    layout: ShopLayoutTemplate;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onSelectProduct, layout }) => {
    const { t } = useTranslation();
    const isLowStock = product.stock > 0 && product.stock <= 5000;
    const isOutOfStock = product.stock === 0;

    const handleImageClick = () => {
        if (!isOutOfStock) {
            onSelectProduct(product);
        }
    };

    const cardClass =
        layout === 'compact'
            ? `relative rounded-md shadow-sm overflow-hidden border ${isOutOfStock ? 'border-gray-300 bg-gray-100' : 'border-indigo-100 bg-white'} transition-all duration-150 hover:shadow-md`
            : layout === 'market'
                ? `relative rounded-2xl shadow-lg overflow-hidden border ${isOutOfStock ? 'border-gray-300 bg-gray-100' : 'border-amber-200 bg-[linear-gradient(180deg,#ffffff,#fff7ed)]'} transition-transform duration-200 hover:scale-[1.02]`
                : `relative rounded-lg shadow-md overflow-hidden border ${isOutOfStock ? 'border-gray-300 bg-gray-200' : 'border-gray-200 bg-white'} transition-transform duration-200 hover:scale-105`;

    const imageClass = layout === 'compact' ? 'w-full h-28 object-cover' : layout === 'market' ? 'w-full h-48 object-cover' : 'w-full h-40 object-cover';

    const titleClass = layout === 'compact' ? 'text-base font-semibold text-text-primary' : 'text-lg font-semibold text-text-primary';

    return (
        <div className={cardClass}>
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
                <img src={product.image} alt={product.name} className={imageClass} loading="lazy" />
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

            <div className={layout === 'compact' ? 'p-3' : 'p-4'}>
                <h3 className={titleClass}>{product.name}</h3>
                <p className="text-sm text-text-secondary">{t(`categories.${product.category}`)}</p>
                <div className="mt-4">
                    <span className="text-xl font-bold text-primary-dark">₹{product.price.toFixed(2)}/kg</span>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;