import { createContext, useContext, useMemo, useState } from 'react';

const LocaleContext = createContext();

function LocaleProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    const savedLocale = localStorage.getItem('locale'); 
    return savedLocale || 'id'; // defaultnya bhs indonesia
  })

  const toggleLocale = () => {
    setLocale(prev => {
      const newLocale = prev === 'id' ? 'en' : 'id';
      localStorage.setItem('locale', newLocale);
      return newLocale;
    });
  };

  const localeContextValue = useMemo(() => ({
    locale,
    toggleLocale
  }), [locale]);

  return (
    <LocaleContext.Provider value={localeContextValue}>
      {children}
    </LocaleContext.Provider>
  );
}

function useLocale() {
  const context = useContext(LocaleContext);
  return context;
}

export {
  LocaleProvider, useLocale
}