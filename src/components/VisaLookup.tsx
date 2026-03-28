import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Globe, MapPin, CreditCard, Clock, CheckCircle2, AlertCircle, ChevronRight, Loader2 } from 'lucide-react';
import { visaService } from '../services/visaService';
import { Destination, Nationality, VisaLookupResult } from '../types';
import { cn, formatCurrency } from '../lib/utils';

interface VisaLookupProps {
  onApply?: (visa: {
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
  }) => void;
}

export default function VisaLookup({ onApply }: VisaLookupProps) {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [nationalities, setNationalities] = useState<Nationality[]>([]);
  const [selectedDest, setSelectedDest] = useState<string>('');
  const [selectedNat, setSelectedNat] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<VisaLookupResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const [dests, nats] = await Promise.all([
          visaService.getDestinations(),
          visaService.getNationalities()
        ]);
        setDestinations(dests);
        setNationalities(nats);
      } catch (err) {
        console.error('Failed to load initial data:', err);
        setError('Failed to connect to the database. Please ensure tables are created in Supabase.');
      }
    }
    init();
  }, []);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDest || !selectedNat) return;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const data = await visaService.lookupVisas(selectedDest, selectedNat);
      setResults(data);
    } catch (err) {
      console.error('Lookup failed:', err);
      setError('An error occurred while checking visa eligibility.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = (visa: VisaLookupResult, option: any) => {
    if (onApply) {
      onApply({
        visa_id: visa.visa_id,
        visa_name: visa.visa_name,
        visa_code: visa.visa_code,
        pricing_id: option.id,
        total_fee: option.fees.total_fee,
        government_fee: option.fees.government_fee,
        service_fee: option.fees.service_fee,
        processing_fee: option.fees.processing_fee,
        currency: option.fees.currency,
        processing_time: `${option.processing_time_value} ${option.processing_time_unit}`
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold text-brand-text mb-6 tracking-tight">
          Check Your <span className="gradient-text">eVisa Eligibility</span>
        </h1>
        <p className="text-lg text-brand-muted max-w-2xl mx-auto font-medium">
          The fastest way to verify electronic visa requirements and get instant pricing for your next global journey.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-[2rem] p-10 mb-16 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 to-indigo-600 opacity-50" />
        
        <form onSubmit={handleLookup} className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end relative z-10">
          <div className="space-y-3">
            <label className="text-xs font-bold text-brand-muted uppercase tracking-widest flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-sky-400" />
              Destination
            </label>
            <div className="relative">
              <select
                value={selectedDest}
                onChange={(e) => setSelectedDest(e.target.value)}
                className="w-full bg-brand-surface/50 border border-brand-border rounded-2xl px-5 py-4 text-brand-text focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer hover:bg-brand-surface/80"
                required
              >
                <option value="" className="bg-brand-surface">Select destination</option>
                {destinations.map((d) => (
                  <option key={d.id} value={d.id} className="bg-brand-surface">{d.name}</option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-brand-muted">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-brand-muted uppercase tracking-widest flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              Nationality
            </label>
            <div className="relative">
              <select
                value={selectedNat}
                onChange={(e) => setSelectedNat(e.target.value)}
                className="w-full bg-brand-surface/50 border border-brand-border rounded-2xl px-5 py-4 text-brand-text focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer hover:bg-brand-surface/80"
                required
              >
                <option value="" className="bg-brand-surface">Select nationality</option>
                {nationalities.map((n) => (
                  <option key={n.id} value={n.id} className="bg-brand-surface">{n.name}</option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-brand-muted">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !selectedDest || !selectedNat}
            className={cn(
              "w-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold py-4 px-8 rounded-2xl flex items-center justify-center gap-3 transition-all hover:shadow-xl hover:shadow-sky-500/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
              loading && "animate-pulse"
            )}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Search className="w-5 h-5" />
                Check Visa
              </>
            )}
          </button>
        </form>
      </motion.div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-500/10 border border-red-500/20 text-red-500 p-5 rounded-2xl flex items-start gap-3 mb-8"
          >
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <p className="text-sm font-semibold">{error}</p>
          </motion.div>
        )}

        {results && results.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center py-20 glass-card rounded-[2rem] border-2 border-dashed border-brand-border"
          >
            <div className="w-20 h-20 bg-brand-surface/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-brand-muted" />
            </div>
            <h3 className="text-2xl font-bold text-brand-text mb-3">Not Eligible</h3>
            <p className="text-brand-muted max-w-md mx-auto">
              Sorry, citizens of your nationality are not currently eligible for an eVisa to this destination.
            </p>
          </motion.div>
        )}

        {results && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-12"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
              <h2 className="text-3xl font-bold text-brand-text tracking-tight">Available Visa Options</h2>
            </div>

            <div className="grid grid-cols-1 gap-12">
              {results.map((visa, idx) => (
                <motion.div
                  key={visa.visa_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass-card rounded-[2.5rem] overflow-hidden group"
                >
                  <div className="p-8 bg-brand-surface/5 border-b border-brand-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-500 mb-2 block">
                        {visa.visa_code}
                      </span>
                      <h3 className="text-2xl font-extrabold text-brand-text">{visa.visa_name}</h3>
                    </div>
                    <div className="px-4 py-1.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-full text-xs font-bold uppercase tracking-wider">
                      Eligible
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {visa.pricing_options.map((option) => (
                        <div 
                          key={option.id}
                          className="group/option relative bg-brand-surface/30 border border-brand-border rounded-3xl p-6 hover:bg-brand-surface/50 hover:border-sky-500/30 transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-brand-surface/50 flex items-center justify-center group-hover/option:bg-sky-500 group-hover/option:text-white transition-all duration-300">
                              <Clock className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Processing</p>
                              <p className="text-base font-bold text-brand-text">
                                {option.processing_time_value} {option.processing_time_unit}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-3 mb-8">
                            <div className="flex justify-between text-sm text-brand-muted">
                              <span>Gov. Fee</span>
                              <span className="font-medium text-brand-text">{formatCurrency(option.fees.government_fee, option.fees.currency)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-brand-muted">
                              <span>Service Fee</span>
                              <span className="font-medium text-brand-text">{formatCurrency(option.fees.service_fee, option.fees.currency)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-brand-muted">
                              <span>Processing Fee</span>
                              <span className="font-medium text-brand-text">{formatCurrency(option.fees.processing_fee, option.fees.currency)}</span>
                            </div>
                            <div className="pt-4 border-t border-brand-border flex justify-between items-end">
                              <span className="text-xs font-bold text-brand-muted uppercase tracking-widest">Total</span>
                              <span className="text-3xl font-black text-brand-text">
                                {formatCurrency(option.fees.total_fee, option.fees.currency)}
                              </span>
                            </div>
                          </div>

                          <button 
                            onClick={() => handleApplyClick(visa, option)}
                            className="w-full py-4 rounded-2xl bg-brand-surface/50 text-brand-text font-bold text-sm flex items-center justify-center gap-2 group-hover/option:bg-brand-primary group-hover/option:text-white transition-all duration-300"
                          >
                            Apply Now
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
