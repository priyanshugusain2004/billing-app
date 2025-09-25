export enum Role {
    Admin = 'Admin',
    Cashier = 'Cashier'
}

export interface User {
    id: string;
    name: string;
    role: Role;
    password?: string;
}

export enum ProductCategory {
    Fruit = 'Fruit',
    Vegetable = 'Vegetable',
    Other = 'Other'
}

export interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
    category: ProductCategory;
    image: string;
}

export interface CartItem extends Product {
    weightInGrams: number;
}

export enum PaymentMethod {
    Cash = 'Cash',
    Online = 'Online',
}

export interface Sale {
    id: string;
    items: CartItem[];
    total: number;
    discount: number;
    finalTotal: number;
    date: Date;
    cashierId: string;
    paymentMethod: PaymentMethod;
}

export interface DiscountTier {
    id: string;
    threshold: number;
    percentage: number;
}