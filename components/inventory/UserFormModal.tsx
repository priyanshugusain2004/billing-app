import React, { useState, useEffect } from 'react';
import { User, Role } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: Omit<User, 'id'> & { id?: string }) => void;
    userToEdit?: User | null;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, onSave, userToEdit }) => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [role, setRole] = useState<Role>(Role.Cashier);
    const [password, setPassword] = useState('');

    useEffect(() => {
        if (userToEdit) {
            setName(userToEdit.name);
            setRole(userToEdit.role);
            setPassword(''); // Don't pre-fill password for security
        } else {
            setName('');
            setRole(Role.Cashier);
            setPassword('');
        }
    }, [userToEdit, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (role === Role.Admin && !userToEdit && !password) {
            alert('Password is required for new Admin users.');
            return;
        }

        const userData: Omit<User, 'id'> & { id?: string } = {
            id: userToEdit?.id,
            name,
            role,
        };
        
        if (password) {
            userData.password = password;
        }

        onSave(userData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto p-6">
                <h2 className="text-2xl font-bold mb-4">{userToEdit ? t('userFormModal.editTitle') : t('userFormModal.addTitle')}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t('userFormModal.userName')}</label>
                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white text-text-secondary" required />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">{t('userFormModal.role')}</label>
                        <select id="role" value={role} onChange={e => setRole(e.target.value as Role)} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-text-secondary" required>
                            {Object.values(Role).map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>

                    {role === Role.Admin && (
                        <div className="mb-4">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">{t('userFormModal.password')}</label>
                            <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white text-text-secondary" />
                            <p className="text-xs text-gray-500 mt-1">{t('userFormModal.passwordHint')}</p>
                        </div>
                    )}

                    <div className="mt-6 flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">{t('userFormModal.cancel')}</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">{t('userFormModal.save')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserFormModal;