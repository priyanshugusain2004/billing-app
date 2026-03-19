/**
 * Updated Cart Component with API Integration
 */

import React, { useState } from 'react';
import { orderService } from '../services/api';
import { PaymentMethod } from '../types';

interface CartProps {
  items: CartItem[];
  shop: IShop | null;
  onCheckoutSuccess: () => void;
}

export const Cart: React.FC<CartProps> = ({ items, shop, onCheckoutSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.Cash
  );
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate totals
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Auto-calculate discount based on subtotal (if enabled)
  const calculatedDiscount = shop?.settings.enableDiscounts
    ? calculateDiscount(subtotal)
    : 0;

  const gst = shop?.settings.enableGST ? subtotal * 0.18 : 0;
  const finalTotal = subtotal - (discount || calculatedDiscount) + gst;

  const handleCheckout = async () => {
    if (items.length === 0) {
      setError('Cart is empty');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderData = {
        items: items.map((item) => ({
          productId: item.id,
          price: item.price,
          quantity: item.quantity,
          weightInGrams: item.weightInGrams,
        })),
        paymentMethod,
        discount: discount || calculatedDiscount,
        gst: shop?.settings.enableGST ? Math.round(gst * 100) / 100 : 0,
        notes: notes || undefined,
      };

      await orderService.create(orderData);

      // Success
      setNotes('');
      onCheckoutSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Cart Summary</h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      <div className="border-t border-b py-4 mb-4">
        <div className="flex justify-between mb-2">
          <span>Subtotal:</span>
          <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
        </div>

        {shop?.settings.enableDiscounts && (
          <div className="flex justify-between mb-2">
            <span>Discount:</span>
            <span className="font-semibold">
              -₹{(discount || calculatedDiscount).toFixed(2)}
            </span>
          </div>
        )}

        {shop?.settings.enableGST && (
          <div className="flex justify-between mb-2">
            <span>GST (18%):</span>
            <span className="font-semibold">+₹{gst.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between text-xl font-bold mt-4 pt-4 border-t">
          <span>Final Total:</span>
          <span className="text-green-600">₹{finalTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="mb-4">
        <label className="block font-semibold mb-2">Payment Method</label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              value={PaymentMethod.Cash}
              checked={paymentMethod === PaymentMethod.Cash}
              onChange={(e) =>
                setPaymentMethod(e.target.value as PaymentMethod)
              }
              className="mr-2"
            />
            Cash
          </label>

          {shop?.settings.enableQRPayment && (
            <label className="flex items-center">
              <input
                type="radio"
                value={PaymentMethod.Online}
                checked={paymentMethod === PaymentMethod.Online}
                onChange={(e) =>
                  setPaymentMethod(e.target.value as PaymentMethod)
                }
                className="mr-2"
              />
              Online (UPI/Card)
            </label>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="mb-4">
        <label className="block font-semibold mb-2">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          placeholder="Add notes to order..."
          rows={3}
        />
      </div>

      {/* Checkout Button */}
      <button
        onClick={handleCheckout}
        disabled={loading || items.length === 0}
        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : `Complete Order (₹${finalTotal.toFixed(2)})`}
      </button>
    </div>
  );
};

/**
 * Calculate automatic discount based on subtotal
 */
const calculateDiscount = (subtotal: number): number => {
  if (subtotal >= 5000) return subtotal * 0.1; // 10%
  if (subtotal >= 2000) return subtotal * 0.05; // 5%
  if (subtotal >= 500) return subtotal * 0.02; // 2%
  return 0;
};
