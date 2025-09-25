
import React, { useRef } from 'react';
import reactToPrint from 'react-to-print';
import { Sale } from '../../types';
import PrintIcon from '../icons/PrintIcon';
import AppleIcon from '../icons/AppleIcon';
import { useTranslation } from '../../hooks/useTranslation';

interface InvoiceModalProps {
    sale: Sale | null;
    onClose: () => void;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ sale, onClose }) => {
    const componentRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslation();

    const handlePrint = reactToPrint.useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `Invoice-${sale?.id}`,
    });

    if (!sale) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto p-6">
                <div ref={componentRef} className="p-4 text-gray-800">
                    <div className="text-center mb-6">
                        <div className="flex items-center justify-center">
                            <AppleIcon className="h-10 w-10 text-primary" />
                            <h1 className="text-2xl font-bold ml-2">{t('invoiceModal.title')}</h1>
                        </div>
                        <p className="text-sm">{t('invoiceModal.address')}</p>
                        <p className="text-sm">{t('invoiceModal.invoiceLabel', { invoiceId: sale.id.slice(-6) })}</p>
                        <p className="text-xs text-gray-500">{sale.date.toLocaleString()}</p>
                    </div>

                    <div className="border-t border-b border-dashed py-2">
                        <div className="flex justify-between font-semibold">
                            <span>{t('invoiceModal.item')}</span>
                            <span>{t('invoiceModal.total')}</span>
                        </div>
                         {sale.items.map(item => (
                            <div key={item.id} className="flex justify-between text-sm my-1">
                                <span>{item.name} ({item.weightInGrams}g)</span>
                                <span>₹{((item.price / 1000) * item.weightInGrams).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="py-2 mt-2 space-y-1">
                         <div className="flex justify-between"><span>{t('invoiceModal.subtotal')}:</span> <span>₹{sale.total.toFixed(2)}</span></div>
                         <div className="flex justify-between"><span>{t('invoiceModal.discount')}:</span> <span>-₹{sale.discount.toFixed(2)}</span></div>
                         <div className="flex justify-between font-bold text-lg border-t border-dashed mt-2 pt-2">
                            <span>{t('invoiceModal.grandTotal')}:</span>
                            <span>₹{sale.finalTotal.toFixed(2)}</span>
                        </div>
                    </div>
                     <p className="text-center text-xs mt-6 text-gray-600">{t('invoiceModal.thankYou')}</p>
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">{t('invoiceModal.close')}</button>
                    <button onClick={handlePrint} className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
                        <PrintIcon className="h-5 w-5 mr-2" />
                        {t('invoiceModal.print')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InvoiceModal;