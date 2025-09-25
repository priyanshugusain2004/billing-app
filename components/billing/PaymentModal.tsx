
import React, { useState, useEffect } from 'react';
import { PaymentMethod } from '../../types';
import CashIcon from '../icons/CashIcon';
import CardIcon from '../icons/CardIcon';
import { useStore } from '../../hooks/useStore';
import { useTranslation } from '../../hooks/useTranslation';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onFinalize: (paymentMethod: PaymentMethod) => void;
    finalTotal: number;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onFinalize, finalTotal }) => {
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(PaymentMethod.Cash);
    const { qrCodeUrl } = useStore();
    const { t } = useTranslation();

    useEffect(() => {
        if (isOpen) {
            setSelectedMethod(PaymentMethod.Cash); // Reset on open
        }
    }, [isOpen]);
    
    const handleFinalize = () => {
        onFinalize(selectedMethod);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-auto p-6 transform transition-all">
                <h2 className="text-2xl font-bold mb-4 text-center text-primary-dark">{t('paymentModal.title')}</h2>
                
                <div className="bg-primary-light p-4 rounded-lg text-center mb-6">
                    <p className="text-sm text-primary-dark font-medium">{t('paymentModal.totalDue')}</p>
                    <p className="text-4xl font-bold text-primary-dark">₹{finalTotal.toFixed(2)}</p>
                </div>

                <div className="mb-6">
                    <p className="text-lg font-semibold text-center text-gray-700 mb-4">{t('paymentModal.selectMethod')}</p>
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => setSelectedMethod(PaymentMethod.Cash)}
                            className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all ${selectedMethod === PaymentMethod.Cash ? 'border-primary bg-primary-light' : 'border-gray-300 hover:border-primary'}`}
                        >
                            <CashIcon className="h-10 w-10 mb-2 text-primary-dark" />
                            <span className="font-semibold text-primary-dark">{t('paymentModal.cash')}</span>
                        </button>
                        <button 
                            onClick={() => setSelectedMethod(PaymentMethod.Online)}
                            className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all ${selectedMethod === PaymentMethod.Online ? 'border-primary bg-primary-light' : 'border-gray-300 hover:border-primary'}`}
                        >
                            <CardIcon className="h-10 w-10 mb-2 text-primary-dark" />
                            <span className="font-semibold text-primary-dark">{t('paymentModal.online')}</span>
                        </button>
                    </div>
                </div>

                {selectedMethod === PaymentMethod.Online && (
                    <div className="my-6 text-center p-4 border-dashed border-2 border-gray-300 rounded-lg animate-fade-in">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('paymentModal.scanToPay')}</h3>
                        {qrCodeUrl ? (
                            <div className="flex justify-center">
                                <img src={qrCodeUrl} alt="Payment QR Code" className="w-48 h-48" />
                            </div>
                        ) : (
                            <p className="text-red-500">{t('paymentModal.qrNotConfigured')}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">{t('paymentModal.qrInstruction')}</p>
                    </div>
                )}


                <div className="mt-8 flex flex-col space-y-3">
                    <button 
                        onClick={handleFinalize} 
                        className="w-full bg-primary text-white py-3 rounded-md font-semibold hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark transition-colors"
                    >
                        {t('paymentModal.finishSale')}
                    </button>
                    <button 
                        onClick={onClose} 
                        className="w-full bg-gray-200 text-gray-800 py-2 rounded-md font-semibold hover:bg-gray-300 transition-colors"
                    >
                        {t('paymentModal.cancel')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;