import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'hi' | 'bn' | 'te' | 'mr' | 'ta' | 'gu' | 'kn' | 'ml' | 'or' | 'as';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'SafeTravel Monitor': 'SafeTravel Monitor',
    'Home': 'Home',
    'Register': 'Register',
    'My Dashboard': 'My Dashboard',
    'Authority Dashboard': 'Authority Dashboard',
    'SOS': 'SOS',
    'Logout': 'Logout',
    'Smart Tourist Safety Monitoring': 'Smart Tourist Safety Monitoring',
    'Ensuring safe travels with AI-powered monitoring and rapid emergency response': 'Ensuring safe travels with AI-powered monitoring and rapid emergency response',
    'Get Started': 'Get Started',
    'Authority Login': 'Authority Login',
    'Digital ID Generation': 'Digital ID Generation',
    'AI Anomaly Detection': 'AI Anomaly Detection',
    'Real-time Monitoring': 'Real-time Monitoring',
    'Emergency Response': 'Emergency Response',
    'Tourist Registration': 'Tourist Registration',
    'Full Name': 'Full Name',
    'Email': 'Email',
    'Phone': 'Phone',
    'Passport/Aadhaar': 'Passport/Aadhaar',
    'Emergency Contact': 'Emergency Contact',
    'Planned Itinerary': 'Planned Itinerary',
    'Register Tourist': 'Register Tourist',
    'Generate Digital ID': 'Generate Digital ID',
    'Tourist Dashboard': 'Tourist Dashboard',
    'Current Location': 'Current Location',
    'Trip Status': 'Trip Status',
    'Active': 'Active',
    'IoT Device': 'IoT Device',
    'Connected': 'Connected',
    'Emergency Alert': 'Emergency Alert',
    'Send SOS': 'Send SOS',
    'Authority Dashboard': 'Authority Dashboard',
    'Active Tourists': 'Active Tourists',
    'Risk Alerts': 'Risk Alerts',
    'Recent Incidents': 'Recent Incidents',
    'Generate E-FIR': 'Generate E-FIR',
    'Emergency Response Center': 'Emergency Response Center',
    'Location Tracking': 'Location Tracking',
    'Health Monitoring': 'Health Monitoring',
    'Manual SOS': 'Manual SOS'
  },
  hi: {
    'SafeTravel Monitor': 'सुरक्षित यात्रा मॉनिटर',
    'Home': 'होम',
    'Register': 'पंजीकरण',
    'My Dashboard': 'मेरा डैशबोर्ड',
    'Authority Dashboard': 'प्राधिकरण डैशबोर्ड',
    'SOS': 'एसओएस',
    'Logout': 'लॉगआउट',
    'Smart Tourist Safety Monitoring': 'स्मार्ट पर्यटक सुरक्षा निगरानी',
    'Tourist Registration': 'पर्यटक पंजीकरण',
    'Full Name': 'पूरा नाम',
    'Email': 'ईमेल',
    'Phone': 'फोन',
    'Emergency Contact': 'आपातकालीन संपर्क',
    'Generate Digital ID': 'डिजिटल आईडी जनरेट करें',
    'Active': 'सक्रिय',
    'Connected': 'जुड़ा हुआ'
  },
  bn: {
    'SafeTravel Monitor': 'নিরাপদ ভ্রমণ মনিটর',
    'Home': 'হোম',
    'Register': 'নিবন্ধন',
    'My Dashboard': 'আমার ড্যাশবোর্ড',
    'SOS': 'এসওএস',
    'Tourist Registration': 'পর্যটক নিবন্ধন',
    'Full Name': 'পূর্ণ নাম',
    'Email': 'ইমেইল',
    'Phone': 'ফোন',
    'Active': 'সক্রিয়',
    'Connected': 'সংযুক্ত'
  },
  te: {
    'SafeTravel Monitor': 'సేఫ్ ట్రావెల్ మానిటర్',
    'Home': 'హోం',
    'Register': 'నమోదు',
    'SOS': 'ఎస్‌ఓఎస్',
    'Tourist Registration': 'పర్యాటక నమోదు',
    'Full Name': 'పూర్తి పేరు',
    'Active': 'క్రియాశీల',
    'Connected': 'కనెక్ట్ చేయబడింది'
  },
  mr: {
    'SafeTravel Monitor': 'सेफ ट्रॅव्हल मॉनिटर',
    'Home': 'होम',
    'Register': 'नोंदणी',
    'SOS': 'एसओएस',
    'Active': 'सक्रिय',
    'Connected': 'जोडलेले'
  },
  ta: {
    'SafeTravel Monitor': 'பாதுகாப்பான பயண கண்காணிப்பு',
    'Home': 'முகப்பு',
    'Register': 'பதிவு',
    'SOS': 'எஸ்ஓஎஸ்',
    'Active': 'செயலில்',
    'Connected': 'இணைக்கப்பட்டது'
  },
  gu: {
    'SafeTravel Monitor': 'સેફ ટ્રાવેલ મોનિટર',
    'Home': 'હોમ',
    'Register': 'નોંધણી',
    'SOS': 'એસઓએસ',
    'Active': 'સક્રિય',
    'Connected': 'જોડાયેલ'
  },
  kn: {
    'SafeTravel Monitor': 'ಸೇಫ್ ಟ್ರಾವೆಲ್ ಮಾನಿಟರ್',
    'Home': 'ಮುಖ್ಯಪುಟ',
    'Register': 'ನೋಂದಣಿ',
    'SOS': 'ಎಸ್ಓಎಸ್',
    'Active': 'ಸಕ್ರಿಯ',
    'Connected': 'ಸಂಪರ್ಕಗೊಂಡಿದೆ'
  },
  ml: {
    'SafeTravel Monitor': 'സേഫ് ട്രാവൽ മോണിറ്റർ',
    'Home': 'ഹോം',
    'Register': 'രജിസ്റ്റർ',
    'SOS': 'എസ്ഓഎസ്',
    'Active': 'സജീവം',
    'Connected': 'കണക്റ്റുചെയ്തു'
  },
  or: {
    'SafeTravel Monitor': 'ସେଫ ଟ୍ରାଭେଲ ମନିଟର',
    'Home': 'ହୋମ',
    'Register': 'ପଞ୍ଜିକରଣ',
    'SOS': 'ଏସଓଏସ',
    'Active': 'ସକ୍ରିୟ',
    'Connected': 'ସଂଯୁକ୍ତ'
  },
  as: {
    'SafeTravel Monitor': 'সুৰক্ষিত ভ্ৰমণ নিৰীক্ষক',
    'Home': 'ঘৰ',
    'Register': 'পঞ্জীয়ন',
    'SOS': 'এছঅ\'এছ',
    'Active': 'সক্ৰিয়',
    'Connected': 'সংযুক্ত'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}