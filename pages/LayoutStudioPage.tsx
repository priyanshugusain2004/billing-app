import React from 'react';
import { ShopLayoutTemplate } from '../types';
import { useStore } from '../hooks/useStore';

const getLayoutFromBusinessType = (businessType?: string | null): ShopLayoutTemplate => {
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

const templates: Array<{
    id: ShopLayoutTemplate;
    title: string;
    description: string;
}> = [
    {
        id: 'classic',
        title: 'Classic Grid',
        description: 'Balanced product grid with standard card spacing and side cart panel.',
    },
    {
        id: 'compact',
        title: 'Compact Counter',
        description: 'More products visible at once, smaller cards, optimized for fast billing desks.',
    },
    {
        id: 'market',
        title: 'Market View',
        description: 'Large visual cards with colorful accents, useful for touch-first kiosk style.',
    },
];

const LayoutStudioPage: React.FC = () => {
    const { shopLayout, setShopLayout } = useStore();
    const shopId = localStorage.getItem('shopId') || 'local-default';

    const onSelectLayout = (layout: ShopLayoutTemplate) => {
        localStorage.setItem(`${shopId}:layoutCustomized`, 'true');
        setShopLayout(layout);
    };

    const resetToBusinessDefault = () => {
        const businessType = localStorage.getItem(`${shopId}:shopBusinessType`);
        localStorage.removeItem(`${shopId}:layoutCustomized`);
        setShopLayout(getLayoutFromBusinessType(businessType));
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Layout Studio</h1>
                <p className="mt-1 text-sm text-gray-600">
                    Choose how your shop billing screen looks. This setting is saved per shop.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {templates.map((template) => {
                    const isActive = shopLayout === template.id;

                    return (
                        <button
                            key={template.id}
                            type="button"
                            onClick={() => onSelectLayout(template.id)}
                            className={`rounded-xl border p-5 text-left transition-all ${
                                isActive
                                    ? 'border-primary bg-primary/10 ring-2 ring-primary/40'
                                    : 'border-gray-200 bg-white hover:border-primary/40'
                            }`}
                        >
                            <h2 className="text-lg font-semibold text-gray-900">{template.title}</h2>
                            <p className="mt-2 text-sm text-gray-600">{template.description}</p>
                            <p className="mt-4 text-xs font-medium uppercase tracking-wide text-primary-dark">
                                {isActive ? 'Active template' : 'Set as active'}
                            </p>
                        </button>
                    );
                })}
            </div>

            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
                <p className="text-sm text-gray-700">
                    Want the layout to follow business type automatically again? Reset to business default.
                </p>
                <button
                    type="button"
                    onClick={resetToBusinessDefault}
                    className="mt-3 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
                >
                    Reset to Business Default
                </button>
            </div>
        </div>
    );
};

export default LayoutStudioPage;
