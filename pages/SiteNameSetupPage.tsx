import React, { useState } from 'react';

interface SiteNameSetupPageProps {
    onSiteNameSet: (name: string) => void;
}

const SiteNameSetupPage: React.FC<SiteNameSetupPageProps> = ({ onSiteNameSet }) => {
    const [siteName, setSiteName] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('siteName') || 'gusain billing app' : 'gusain billing app');
    const [error, setError] = useState('');
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!siteName.trim()) {
            setError('Site name cannot be empty.');
            return;
        }
        if (!password.trim()) {
            setPasswordError('Password is required.');
            return;
        }
        localStorage.setItem('siteName', siteName.trim());
        localStorage.setItem('siteNamePassword', password.trim());
        // Always update admin password for all admin users
        const users = JSON.parse(localStorage.getItem('users') || '[{"id":"u1","name":"Admin User","role":"Admin"}]');
        users.forEach((u: any) => {
            if (u.role === 'Admin') {
                u.password = password.trim();
            }
        });
        localStorage.setItem('users', JSON.stringify(users));
        onSiteNameSet(siteName.trim());
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm space-y-6">
                <h1 className="text-2xl font-bold text-primary-dark text-center mb-4">Set Your Shop Name</h1>
                <input
                    type="text"
                    value={siteName}
                    onChange={e => setSiteName(e.target.value)}
                    placeholder="Enter shop name..."
                    className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
                />
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Set password for site name changes..."
                    className="w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
                />
                {passwordError && <p className="text-red-500 text-sm text-center">{passwordError}</p>}
                <button
                    type="submit"
                    className="w-full bg-primary text-white py-2 rounded-md font-semibold hover:bg-primary-dark"
                >
                    Save & Continue
                </button>
            </form>
        </div>
    );
};

export default SiteNameSetupPage;
