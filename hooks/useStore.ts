
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

export const useStore = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useStore must be used within an AppProvider');
    }
    return context;
};
