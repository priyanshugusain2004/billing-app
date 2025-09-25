
import React from 'react';
import { useStore } from '../../hooks/useStore';
import { CartItem } from '../../types';
import TrashIcon from '../icons/TrashIcon';
import { useTranslation } from '../../hooks/useTranslation';

interface CartProps {
    onProceedToPayment: () => void;
    subtotal: number;
    discount: number;
    discountPercentage: number;
    finalTotal: number;
}

const Cart: React.FC<CartProps> = ({ onProceedToPayment, subtotal, discount, discountPercentage, finalTotal }) => {
    const { cart, removeFromCart, clearCart } = useStore();
    const { t } = useTranslation();
    
    return (
        <div className="bg-white rounded-lg shadow-lg p-6 h-full flex flex-col">
            <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-primary-dark">{t('billingPage.cartTitle')}</h2>
            
            {cart.length === 0 ? (
                <div className="flex-grow flex items-center justify-center">
                    <p className="text-text-secondary">{t('billingPage.cartEmpty')}</p>
                </div>
            ) : (
                <div className="flex-grow overflow-y-auto -mr-6 pr-6">
                    {cart.map((item: CartItem) => (
                        <div key={item.id} className="flex items-center justify-between mb-4">
                            <div className="flex-1">
                                <p className="font-semibold">{item.name}</p>
                                <p className="text-sm text-text-secondary">{item.weightInGrams}g @ ₹{item.price.toFixed(2)}/kg</p>
                            </div>
                            <span className="w-24 text-right font-semibold">₹{((item.price / 1000) * item.weightInGrams).toFixed(2)}</span>
                            <button onClick={() => removeFromCart(item.id)} className="ml-4 text-red-500 hover:text-red-700">
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="border-t pt-4 mt-4">
                <div className="space-y-2 text-text-secondary">
                    <div className="flex justify-between"><span>{t('billingPage.subtotal')}:</span> <span className="font-medium text-text-primary">₹{subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between">
                        <span>{t('billingPage.discount')} {discountPercentage > 0 && `(${discountPercentage}%)`}:</span>
                        <span className="font-medium text-red-600">-₹{discount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-primary-dark border-t pt-2 mt-2">
                        <span>{t('billingPage.total')}:</span>
                        <span>₹{finalTotal.toFixed(2)}</span>
                    </div>
                </div>

                <div className="mt-6 flex flex-col space-y-2">
                    <button
                        onClick={onProceedToPayment}
                        disabled={cart.length === 0}
                        className="w-full bg-primary text-white py-3 rounded-md font-semibold hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {t('billingPage.proceedToPayment')}
                    </button>
                    <button
                        onClick={clearCart}
                        disabled={cart.length === 0}
                        className="w-full bg-red-500 text-white py-2 rounded-md font-semibold hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        {t('billingPage.clearCart')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;