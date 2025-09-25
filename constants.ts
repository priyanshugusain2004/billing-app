import { Product, User, Role, ProductCategory } from './types';

export const DEFAULT_PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIiBmaWxsPSIjY2NjY2NjIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2UwZTBlMCIvPjxwYXRoIGQ9Ik0xNjUgMzVoLTEzMGMtNS41MiAwLTEwIDQuNDgtMTAgMTB2MTEwYzAgNS41MiA0LjQ4IDEwIDEwIDEwaDEzMGM1LjUyIDAgMTAtNC40OCAxMC0xMHctMTEwYzAtNS41Mi00LjQ4LTEwLTEwLTEwek0xNTUgMTU1aC0xMTB2LTguMjhsMjUtMzEuMjVjLjgtLjk5IDIuMjQtMS4xMiAzLjIzLS4yOGwyNS44IDIxLjUgMzUuMi00Ni45M2MuOC0xLjA3IDIuMy0xLjE5IDMuMjYtLjI1bDMwLjUxIDM1LjIxdjMwLjJ6Ii8+PC9zdmc+';

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_USERS: User[] = [
    { id: 'u1', name: 'Admin User', role: Role.Admin, password: 'gusain' }
];