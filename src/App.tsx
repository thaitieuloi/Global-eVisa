import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Globe, Shield, Zap, Search, FileText, Sun, Moon, Menu, X, LayoutDashboard } from 'lucide-react';
import VisaLookup from './components/VisaLookup';
import PassportOCR from './components/PassportOCR';
import AdminDashboard from './components/AdminDashboard';
import LanguageSwitcher from './components/LanguageSwitcher';
import { cn } from './lib/utils';

type View = 'lookup' | 'ocr' | 'admin';

export default function App() {
  const { t } = useTranslation();
  const [view, setView] = useState<View>('lookup');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedVisa, setSelectedVisa] = useState<{
    visa_id: string;
    visa_name: string;
    visa_code: string;
    pricing_id: string;
    total_fee: number;
    government_fee: number;
    service_fee: number;
    processing_fee: number;
    currency: string;
    processing_time: string;
  } | undefined>(undefined);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleApplyVisa = (visa: any) => {
    setSelectedVisa(visa);
    setView('ocr');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRegistrationComplete = () => {
    // Optionally redirect to a success page or back to lookup
    setTimeout(() => {
      setView('lookup');
      setSelectedVisa(undefined);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans transition-colors duration-300">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass-card border-x-0 border-t-0 rounded-none">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setView('lookup')}>
            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-110 transition-transform">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter text-brand-text">GLOBAL<span className="text-sky-500">eVISA</span></span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => setView('lookup')}
              className={cn(
                "text-sm font-bold uppercase tracking-widest transition-colors flex items-center gap-2",
                view === 'lookup' ? "text-sky-500" : "text-brand-muted hover:text-brand-text"
              )}
            >
              <Search className="w-4 h-4" />
              {t('admin.search')}
            </button>
            <button 
              onClick={() => setView('ocr')}
              className={cn(
                "text-sm font-bold uppercase tracking-widest transition-colors flex items-center gap-2",
                view === 'ocr' ? "text-sky-500" : "text-brand-muted hover:text-brand-text"
              )}
            >
              <FileText className="w-4 h-4" />
              {t('ocr.title')}
            </button>
            <button 
              onClick={() => setView('admin')}
              className={cn(
                "text-sm font-bold uppercase tracking-widest transition-colors flex items-center gap-2",
                view === 'admin' ? "text-sky-500" : "text-brand-muted hover:text-brand-text"
              )}
            >
              <LayoutDashboard className="w-4 h-4" />
              {t('admin.dashboard')}
            </button>
            <div className="h-6 w-px bg-brand-border mx-2" />
            <LanguageSwitcher />
            <button 
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center text-brand-text hover:bg-brand-surface/80 transition-all"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center gap-4">
            <button onClick={toggleTheme} className="text-brand-text p-2">
              {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
            </button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-brand-text p-2">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-brand-border bg-brand-surface overflow-hidden"
            >
              <div className="p-6 space-y-4">
                <button 
                  onClick={() => { setView('lookup'); setIsMenuOpen(false); }}
                  className={cn(
                    "w-full text-left py-3 px-4 rounded-xl font-bold flex items-center gap-3",
                    view === 'lookup' ? "bg-sky-500/10 text-sky-500" : "text-brand-muted"
                  )}
                >
                  <Search className="w-5 h-5" />
                  Visa Lookup
                </button>
                <button 
                  onClick={() => { setView('ocr'); setIsMenuOpen(false); }}
                  className={cn(
                    "w-full text-left py-3 px-4 rounded-xl font-bold flex items-center gap-3",
                    view === 'ocr' ? "bg-sky-500/10 text-sky-500" : "text-brand-muted"
                  )}
                >
                  <FileText className="w-5 h-5" />
                  Passport OCR
                </button>
                <button 
                  onClick={() => { setView('admin'); setIsMenuOpen(false); }}
                  className={cn(
                    "w-full text-left py-3 px-4 rounded-xl font-bold flex items-center gap-3",
                    view === 'admin' ? "bg-sky-500/10 text-sky-500" : "text-brand-muted"
                  )}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Admin
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="relative min-h-[70vh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {view === 'lookup' && <VisaLookup onApply={handleApplyVisa} />}
            {view === 'ocr' && <PassportOCR selectedVisa={selectedVisa} onComplete={handleRegistrationComplete} />}
            {view === 'admin' && <AdminDashboard />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-brand-border py-20 mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-black tracking-tighter text-brand-text">GLOBAL<span className="text-sky-500">eVISA</span></span>
              </div>
              <p className="text-brand-muted max-w-sm font-medium leading-relaxed">
                Empowering global travelers with instant visa intelligence and seamless digital processing.
              </p>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-sky-500">Technology</h4>
              <ul className="space-y-4 text-sm font-bold text-brand-muted">
                <li className="flex items-center gap-2 hover:text-brand-text transition-colors cursor-pointer">
                  <Zap className="w-4 h-4 text-sky-500" /> Real-time Processing
                </li>
                <li className="flex items-center gap-2 hover:text-brand-text transition-colors cursor-pointer">
                  <Shield className="w-4 h-4 text-indigo-500" /> Secure Data Vault
                </li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-sky-500">Contact</h4>
              <p className="text-sm font-bold text-brand-muted">support@globalevisa.com</p>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center hover:border-sky-500/50 transition-all cursor-pointer">
                  <Globe className="w-5 h-5 text-brand-muted" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-brand-border flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs font-bold text-brand-muted">
              © 2026 GLOBAL eVISA SYSTEM. All rights reserved.
            </p>
            <div className="flex gap-8 text-xs font-bold text-brand-muted uppercase tracking-widest">
              <a href="#" className="hover:text-brand-text transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-brand-text transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
