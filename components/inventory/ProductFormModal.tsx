
import React, { useState, useEffect } from 'react';
import { Product, ProductCategory } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

interface ProductFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (product: Omit<Product, 'id'> & { id?: string; image: string }) => void;
    productToEdit?: Product | null;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({ isOpen, onClose, onSave, productToEdit }) => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [category, setCategory] = useState<ProductCategory>(ProductCategory.Fruit);
    const [imageData, setImageData] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);


    useEffect(() => {
        if (productToEdit) {
            setName(productToEdit.name);
            setPrice(productToEdit.price.toString());
            setStock(productToEdit.stock.toString());
            setCategory(productToEdit.category);
            setImagePreview(productToEdit.image);
            setImageData(null);
        } else {
            setName('');
            setPrice('');
            setStock('');
            setCategory(ProductCategory.Fruit);
            setImagePreview(null);
            setImageData(null);
        }
    }, [productToEdit, isOpen]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setImageData(result);
                setImagePreview(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const productData = {
            id: productToEdit?.id,
            name,
            price: parseFloat(price),
            stock: parseInt(stock, 10),
            category,
            image: imageData || productToEdit?.image || ''
        };
        onSave(productData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto p-6">
                <h2 className="text-2xl font-bold mb-4">{productToEdit ? t('productFormModal.editTitle') : t('productFormModal.addTitle')}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t('productFormModal.productName')}</label>
                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white text-text-secondary" required />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="image" className="block text-sm font-medium text-gray-700">{t('productFormModal.productImage')}</label>
                        {imagePreview && <img src={imagePreview} alt="Product preview" className="mt-2 h-24 w-24 object-cover rounded-md border p-1" />}
                        <input 
                            type="file" 
                            id="image" 
                            onChange={handleImageChange} 
                            accept="image/*" 
                            className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-primary-dark hover:file:bg-primary/80 cursor-pointer" 
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700">{t('productFormModal.pricePerKg')}</label>
                            <input type="number" id="price" value={price} onChange={e => setPrice(e.target.value)} step="0.01" min="0" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white text-text-secondary" required />
                        </div>
                        <div>
                            <label htmlFor="stock" className="block text-sm font-medium text-gray-700">{t('productFormModal.stockInGrams')}</label>
                            <input type="number" id="stock" value={stock} onChange={e => setStock(e.target.value)} min="0" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white text-text-secondary" required />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">{t('productFormModal.category')}</label>
                        <select id="category" value={category} onChange={e => setCategory(e.target.value as ProductCategory)} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-text-secondary" required>
                            {Object.values(ProductCategory).map(cat => (
                                <option key={cat} value={cat}>{t(`categories.${cat}`)}</option>
                            ))}
                        </select>
                    </div>
                    <div className="mt-6 flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">{t('productFormModal.cancel')}</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">{t('productFormModal.save')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductFormModal;