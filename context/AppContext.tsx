import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { User, Role, Product, CartItem, Sale, DiscountTier, ShopLayoutTemplate } from '../types';
import { INITIAL_PRODUCTS, INITIAL_USERS, DEFAULT_PLACEHOLDER_IMAGE } from '../constants';

const DEFAULT_SHOP_SCOPE = 'local-default';

const getCurrentShopScope = (): string => {
    return localStorage.getItem('shopId') || DEFAULT_SHOP_SCOPE;
};

const getScopedStorageKey = (scope: string, key: string): string => {
    return `${scope}:${key}`;
};

const getLayoutFromBusinessType = (businessType: string | null): ShopLayoutTemplate => {
    switch (businessType) {
        case 'supermarket':
            return 'compact';
        case 'fruit-shop':
        case 'vegetable-shop':
            return 'market';
        case 'grocery':
        case 'other':
        default:
            return 'classic';
    }
};

const parseSalesData = (data: string): Sale[] => {
    return JSON.parse(data, (key, value) => {
        if (key === 'date' && typeof value === 'string') return new Date(value);
        return value;
    });
};

interface AppContextType {
    user: User | null;
    users: User[];
    login: (userId: string, password?: string) => boolean;
    setAuthenticatedUser: (user: User) => void;
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
    shopLayout: ShopLayoutTemplate;
    setShopLayout: (layout: ShopLayoutTemplate) => void;
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

    const readScopedJson = <T,>(scope: string, key: string, fallback: T): T => {
        const scoped = localStorage.getItem(getScopedStorageKey(scope, key));
        if (scoped) {
            return JSON.parse(scoped) as T;
        }

        // Backward compatibility with pre-scope data for old local setup only.
        if (scope === DEFAULT_SHOP_SCOPE) {
            const legacy = localStorage.getItem(key);
            if (legacy) {
                return JSON.parse(legacy) as T;
            }
        }

        return fallback;
    };

    const readScopedSales = (scope: string): Sale[] => {
        const scoped = localStorage.getItem(getScopedStorageKey(scope, 'sales'));
        if (scoped) {
            return parseSalesData(scoped);
        }

        if (scope === DEFAULT_SHOP_SCOPE) {
            const legacy = localStorage.getItem('sales');
            if (legacy) {
                return parseSalesData(legacy);
            }
        }

        return [];
    };

    const readScopedString = (scope: string, key: string): string | null => {
        const scoped = localStorage.getItem(getScopedStorageKey(scope, key));
        if (scoped !== null) {
            return scoped;
        }

        if (scope === DEFAULT_SHOP_SCOPE) {
            return localStorage.getItem(key);
        }

        return null;
    };

    const getDefaultLayoutForScope = (scope: string): ShopLayoutTemplate => {
        const businessType = readScopedString(scope, 'shopBusinessType');
        return getLayoutFromBusinessType(businessType);
    };

    // Load from localStorage or use defaults
    const [activeShopScope, setActiveShopScope] = useState<string>(() => getCurrentShopScope());
    const [lastLoadedScope, setLastLoadedScope] = useState<string>(() => getCurrentShopScope());
    const [user, setUser] = useState<User | null>(() => {
        const data = localStorage.getItem('currentUser');
        return data ? JSON.parse(data) : null;
    });
    const [users, setUsers] = useState<User[]>(() => {
        return readScopedJson<User[]>(getCurrentShopScope(), 'users', INITIAL_USERS);
    });
    const [products, setProducts] = useState<Product[]>(() => {
        return readScopedJson<Product[]>(getCurrentShopScope(), 'products', INITIAL_PRODUCTS);
    });
    const [cart, setCart] = useState<CartItem[]>(() => {
        return readScopedJson<CartItem[]>(getCurrentShopScope(), 'cart', []);
    });
    const [sales, setSales] = useState<Sale[]>(() => {
        return readScopedSales(getCurrentShopScope());
    });
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(() => {
        return readScopedString(getCurrentShopScope(), 'qrCodeUrl');
    });
    const [discountTiers, setDiscountTiers] = useState<DiscountTier[]>(() => {
        return readScopedJson<DiscountTier[]>(getCurrentShopScope(), 'discountTiers', initialDiscounts);
    });
    const [shopLayout, setShopLayout] = useState<ShopLayoutTemplate>(() => {
        const scope = getCurrentShopScope();
        return readScopedJson<ShopLayoutTemplate>(scope, 'shopLayout', getDefaultLayoutForScope(scope));
    });

    useEffect(() => {
        setUsers(readScopedJson<User[]>(activeShopScope, 'users', INITIAL_USERS));
        setProducts(readScopedJson<Product[]>(activeShopScope, 'products', INITIAL_PRODUCTS));
        setCart(readScopedJson<CartItem[]>(activeShopScope, 'cart', []));
        setSales(readScopedSales(activeShopScope));
        setQrCodeUrl(readScopedString(activeShopScope, 'qrCodeUrl'));
        setDiscountTiers(readScopedJson<DiscountTier[]>(activeShopScope, 'discountTiers', initialDiscounts));
        setShopLayout(
            readScopedJson<ShopLayoutTemplate>(
                activeShopScope,
                'shopLayout',
                getDefaultLayoutForScope(activeShopScope)
            )
        );
        setLastLoadedScope(activeShopScope);
    }, [activeShopScope]);

    // Persist to localStorage on change
    useEffect(() => {
        if (lastLoadedScope !== activeShopScope) return;
        localStorage.setItem(getScopedStorageKey(activeShopScope, 'users'), JSON.stringify(users));
    }, [users, activeShopScope, lastLoadedScope]);
    useEffect(() => {
        if (lastLoadedScope !== activeShopScope) return;
        localStorage.setItem(getScopedStorageKey(activeShopScope, 'products'), JSON.stringify(products));
    }, [products, activeShopScope, lastLoadedScope]);
    useEffect(() => {
        if (lastLoadedScope !== activeShopScope) return;
        localStorage.setItem(getScopedStorageKey(activeShopScope, 'cart'), JSON.stringify(cart));
    }, [cart, activeShopScope, lastLoadedScope]);
    useEffect(() => {
        if (lastLoadedScope !== activeShopScope) return;
        localStorage.setItem(getScopedStorageKey(activeShopScope, 'sales'), JSON.stringify(sales));
    }, [sales, activeShopScope, lastLoadedScope]);
    useEffect(() => {
        if (lastLoadedScope !== activeShopScope) return;
        const key = getScopedStorageKey(activeShopScope, 'qrCodeUrl');
        if (qrCodeUrl) {
            localStorage.setItem(key, qrCodeUrl);
        } else {
            localStorage.removeItem(key);
        }
    }, [qrCodeUrl, activeShopScope, lastLoadedScope]);
    useEffect(() => {
        if (lastLoadedScope !== activeShopScope) return;
        localStorage.setItem(getScopedStorageKey(activeShopScope, 'discountTiers'), JSON.stringify(discountTiers));
    }, [discountTiers, activeShopScope, lastLoadedScope]);
    useEffect(() => {
        if (lastLoadedScope !== activeShopScope) return;
        localStorage.setItem(getScopedStorageKey(activeShopScope, 'shopLayout'), JSON.stringify(shopLayout));
    }, [shopLayout, activeShopScope, lastLoadedScope]);

    const login = (userId: string, password?: string): boolean => {
        const foundUser = users.find(u => u.id === userId);
        if (!foundUser) {
            return false;
        }

        if (foundUser.role === Role.Admin) {
            // Always check password against localStorage value
            const adminPassword = localStorage.getItem('siteNamePassword');
            if (adminPassword === password) {
                setUser(foundUser);
                localStorage.setItem('currentUser', JSON.stringify(foundUser));
                setActiveShopScope(getCurrentShopScope());
                return true;
            }
            return false;
        }

        setUser(foundUser);
        localStorage.setItem('currentUser', JSON.stringify(foundUser));
        setActiveShopScope(getCurrentShopScope());
        return true;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        localStorage.removeItem('shopId');
        localStorage.removeItem('shopSettings');
        setActiveShopScope(DEFAULT_SHOP_SCOPE);
    };

    const setAuthenticatedUser = (userData: User) => {
        setUser(userData);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        setActiveShopScope(getCurrentShopScope());
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
        setAuthenticatedUser,
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
        shopLayout,
        setShopLayout,
        clearSales,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};