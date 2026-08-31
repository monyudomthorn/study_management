import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/localStorage';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return loadFromStorage(STORAGE_KEYS.LANGUAGE, 'en');
  });

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.LANGUAGE, lang);
    document.documentElement.lang = lang;
    if (lang === 'kh') {
      document.body.classList.add('lang-kh');
    } else {
      document.body.classList.remove('lang-kh');
    }
  }, [lang]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'kh' : 'en'));
  };

  const setLanguage = (newLang) => {
    if (newLang === 'en' || newLang === 'kh') {
      setLang(newLang);
    }
  };

  // Translation helper function
  const t = (key) => {
    const langDict = translations[lang] || translations.en;
    if (langDict[key] !== undefined) {
      return langDict[key];
    }
    // Fallback to English if translation missing
    return translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
