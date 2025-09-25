import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { User, Role, Product, CartItem, Sale, DiscountTier } from '../types';
import { INITIAL_PRODUCTS, INITIAL_USERS, DEFAULT_PLACEHOLDER_IMAGE } from '../constants';

interface AppContextType {
    user: User | null;
    users: User[];
    login: (userId: string, password?: string) => boolean;
    logout: () => void;
    addUser: (user: Omit<User, 'id'>) => void;
    updateUser: (user: User) => void;
    deleteUser: (userId: string) => void;
    products: Product[];
    addProduct: (product: Omit<Product, 'id'>) => void;
    updateProduct: (product: Product) => void;
    deleteProduct: (productId: string) => void;
    cart: CartItem[];
    addToCart: (product: Product, weightInGrams: number) => void;
    removeFromCart: (productId: string) => void;
    clearCart: () => void;
    sales: Sale[];
    addSale: (sale: Omit<Sale, 'id' | 'date' | 'cashierId'>) => Sale;
    qrCodeUrl: string | null;
    setQrCodeUrl: (url: string) => void;
    discountTiers: DiscountTier[];
    updateDiscountTiers: (tiers: DiscountTier[]) => void;
    clearSales: () => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    const initialDiscounts: DiscountTier[] = [
        { id: 'tier1', threshold: 200, percentage: 5 },
        { id: 'tier2', threshold: 400, percentage: 10 },
    ];

    // Load from localStorage or use defaults
    const [user, setUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>(() => {
        const data = localStorage.getItem('users');
        return data ? JSON.parse(data) : INITIAL_USERS;
    });
    const [products, setProducts] = useState<Product[]>(() => {
        const data = localStorage.getItem('products');
        return data ? JSON.parse(data) : INITIAL_PRODUCTS;
    });
    const [cart, setCart] = useState<CartItem[]>(() => {
        const data = localStorage.getItem('cart');
        return data ? JSON.parse(data) : [];
    });
    const [sales, setSales] = useState<Sale[]>(() => {
        const data = localStorage.getItem('sales');
        return data ? JSON.parse(data, (key, value) => {
            if (key === 'date' && typeof value === 'string') return new Date(value);
            return value;
        }) : [];
    });
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(() => {
        const data = localStorage.getItem('qrCodeUrl');
        return data ? data : null;
    });
    const [discountTiers, setDiscountTiers] = useState<DiscountTier[]>(() => {
        const data = localStorage.getItem('discountTiers');
        return data ? JSON.parse(data) : initialDiscounts;
    });

    // Persist to localStorage on change
    useEffect(() => { localStorage.setItem('users', JSON.stringify(users)); }, [users]);
    useEffect(() => { localStorage.setItem('products', JSON.stringify(products)); }, [products]);
    useEffect(() => { localStorage.setItem('cart', JSON.stringify(cart)); }, [cart]);
    useEffect(() => { localStorage.setItem('sales', JSON.stringify(sales)); }, [sales]);
    useEffect(() => { if (qrCodeUrl) { localStorage.setItem('qrCodeUrl', qrCodeUrl); } else { localStorage.removeItem('qrCodeUrl'); } }, [qrCodeUrl]);
    useEffect(() => { localStorage.setItem('discountTiers', JSON.stringify(discountTiers)); }, [discountTiers]);

    const login = (userId: string, password?: string): boolean => {
        const foundUser = users.find(u => u.id === userId);
        if (!foundUser) {
            return false;
        }

        if (foundUser.role === Role.Admin) {
            if (foundUser.password === password) {
                setUser(foundUser);
                return true;
            }
            return false;
        }

        setUser(foundUser);
        return true;
    };

    const logout = () => {
        setUser(null);
    };

    const addUser = (userData: Omit<User, 'id'>) => {
        const newUser: User = {
            ...userData,
            id: `user-${Date.now()}`
        };
        setUsers(prev => [...prev, newUser]);
    };

    const updateUser = (userData: User) => {
        setUsers(prev => prev.map(u => u.id === userData.id ? userData : u));
    };

    const deleteUser = (userId: string) => {
        const userToDelete = users.find(u => u.id === userId);
        const adminCount = users.filter(u => u.role === Role.Admin).length;

        if (userToDelete?.role === Role.Admin && adminCount <= 1) {
            alert("Cannot delete the last admin user.");
            return;
        }
        setUsers(prev => prev.filter(u => u.id !== userId));
    };

    const addToCart = (product: Product, weightInGrams: number) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                return prevCart.map(item =>
                    item.id === product.id ? { ...item, weightInGrams: item.weightInGrams + weightInGrams } : item
                );
            }
            return [...prevCart, { ...product, weightInGrams }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };

    const clearCart = () => {
        setCart([]);
    };

    const addSale = (saleData: Omit<Sale, 'id' | 'date' | 'cashierId'>): Sale => {
        const newSale: Sale = {
            ...saleData,
            id: `sale-${Date.now()}`,
            date: new Date(),
            cashierId: user?.id || 'unknown'
        };
        setSales(prevSales => [newSale, ...prevSales]);

        newSale.items.forEach(cartItem => {
            setProducts(prevProducts => prevProducts.map(p =>
                p.id === cartItem.id ? { ...p, stock: p.stock - cartItem.weightInGrams } : p
            ));
        });

        clearCart();
        return newSale;
    };

    const addProduct = (productData: Omit<Product, 'id'>) => {
        const newProduct: Product = {
            ...productData,
            id: `prod-${Date.now()}`,
            image: productData.image || DEFAULT_PLACEHOLDER_IMAGE
        };
        setProducts(prev => [newProduct, ...prev]);
    };

    const updateProduct = (productData: Product) => {
        setProducts(prev => prev.map(p => p.id === productData.id ? productData : p));
    };
    
    const deleteProduct = (productId: string) => {
        setProducts(prev => prev.filter(p => p.id !== productId));
    };
    
    const updateDiscountTiers = (tiers: DiscountTier[]) => {
        const sortedTiers = [...tiers].sort((a, b) => a.threshold - b.threshold);
        setDiscountTiers(sortedTiers);
    };

    // Clear all sales
    const clearSales = () => {
        setSales([]);
    };

    const value = {
        user,
        users,
        login,
        logout,
        addUser,
        updateUser,
        deleteUser,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        sales,
        addSale,
        qrCodeUrl,
        setQrCodeUrl,
        discountTiers,
        updateDiscountTiers,
        clearSales,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};