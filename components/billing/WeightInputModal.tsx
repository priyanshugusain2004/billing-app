
import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

interface WeightInputModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddToCart: (product: Product, weightInGrams: number) => void;
    product: Product | null;
}

const WeightInputModal: React.FC<WeightInputModalProps> = ({ isOpen, onClose, onAddToCart, product }) => {
    const [weight, setWeight] = useState('');
    const { t } = useTranslation();

    useEffect(() => {
        if (isOpen) {
            setWeight('');
        }
    }, [isOpen]);

    const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Allow only numbers
        if (/^\d*$/.test(value)) {
            setWeight(value);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const weightInGrams = parseInt(weight, 10);
        if (product && weightInGrams > 0) {
            if (weightInGrams > product.stock) {
                alert(t('weightModal.exceedsStock', { stock: product.stock }));
                return;
            }
            onAddToCart(product, weightInGrams);
        }
    };
    
    if (!isOpen || !product) return null;

    const calculatedPrice = (product.price / 1000) * (parseInt(weight, 10) || 0);
    const presetWeights = [100, 250, 500, 750, 1000];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-auto p-6 transform transition-all">
                <h2 className="text-2xl font-bold mb-2 text-gray-800">{t('weightModal.title', { productName: product.name })}</h2>
                <p className="text-md text-gray-600 mb-4">{t('weightModal.priceLabel', { price: product.price.toFixed(2) })}</p>
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-2">
                        <label htmlFor="weight-input" className="block text-sm font-medium text-gray-700">{t('weightModal.weightInputLabel')}</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <input
                                type="text"
                                inputMode="numeric"
                                id="weight-input"
                                value={weight}
                                onChange={handleWeightChange}
                                className="block w-full px-4 py-2 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary bg-white text-text-secondary"
                                placeholder={t('weightModal.weightInputPlaceholder')}
                                autoFocus
                                required
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">g</span>
                            </div>
                        </div>
                         {parseInt(weight, 10) > product.stock && <p className="text-red-500 text-xs mt-1">{t('weightModal.exceedsStock', { stock: product.stock })}</p>}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 my-4">
                        {presetWeights.map((preset) => (
                            <button
                                key={preset}
                                type="button"
                                onClick={() => setWeight(preset.toString())}
                                disabled={preset > product.stock}
                                className="px-3 py-1 text-sm border rounded-full transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed disabled:text-gray-400 bg-gray-100 text-gray-700 hover:bg-primary-light hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary-light"
                            >
                                {preset === 1000 ? '1kg' : `${preset}g`}
                            </button>
                        ))}
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-md text-center my-4">
                        <p className="text-lg font-semibold text-gray-800">
                            {t('weightModal.priceDisplay')}: <span className="text-primary-dark">₹{calculatedPrice.toFixed(2)}</span>
                        </p>
                    </div>

                    <div className="mt-6 flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">{t('weightModal.cancel')}</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:bg-gray-400" disabled={!weight || parseInt(weight) === 0 || parseInt(weight) > product.stock}>
                            {t('weightModal.addToCart')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WeightInputModal;