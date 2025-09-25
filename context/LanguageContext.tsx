import React, { createContext, useState, ReactNode, useCallback, useEffect } from 'react';

type Language = 'en' | 'hi';

interface LanguageContextType {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: string, replacements?: { [key: string]: string | number }) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const findInObject = (obj: any, key: string): string | undefined => {
    return key.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
}

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('en');
    const [translations, setTranslations] = useState<{ [key in Language]?: any }>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTranslations = async () => {
            try {
                const [enResponse, hiResponse] = await Promise.all([
                    fetch('/locales/en.json'),
                    fetch('/locales/hi.json')
                ]);

                if (!enResponse.ok || !hiResponse.ok) {
                    throw new Error('Failed to fetch translation files');
                }

                const enData = await enResponse.json();
                const hiData = await hiResponse.json();

                setTranslations({ en: enData, hi: hiData });
            } catch (error) {
                console.error("Failed to load translation files:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTranslations();
    }, []); // Runs once on component mount

    const t = useCallback((key: string, replacements?: { [key: string]: string | number }) => {
        if (isLoading) {
            return ''; // Return empty string while loading
        }

        let translationString = findInObject(translations[language], key);

        // Fallback to English if translation is missing in the current language
        if (!translationString) {
            translationString = findInObject(translations['en'], key);
        }

        // If still not found, return the key itself as a last resort
        if (!translationString) {
            console.warn(`Translation for key '${key}' not found.`);
            return key;
        }

        if (replacements) {
            Object.keys(replacements).forEach(placeholder => {
                const regex = new RegExp(`{{${placeholder}}}`, 'g');
                translationString = translationString!.replace(regex, String(replacements[placeholder]));
            });
        }
        
        return translationString!;
    }, [language, translations, isLoading]);

    const value = {
        language,
        setLanguage,
        t,
    };

    // Prevent rendering children until translations are loaded to avoid UI flicker
    if (isLoading) {
        return null; 
    }

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};
