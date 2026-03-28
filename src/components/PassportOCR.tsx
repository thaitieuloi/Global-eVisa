import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Camera, Upload, FileText, Loader2, CheckCircle2, AlertCircle, X, RefreshCw, Send, Clock, Copy, Check, Info } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '../lib/utils';
import { PassportData, VisaLookupResult } from '../types';
import { orderService } from '../services/orderService';

interface PassportOCRProps {
  selectedVisa?: {
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
  };
  onComplete?: () => void;
}

export default function PassportOCR({ selectedVisa, onComplete }: PassportOCRProps) {
  const { t } = useTranslation();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [result, setResult] = useState<PassportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const processOCR = async () => {
    if (!image) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const model = "gemini-3-flash-preview";
      
      const base64Data = image.split(',')[1];
      
      const prompt = `
        Extract information from this passport image. 
        Return ONLY a JSON object with the following fields:
        - fullName: The full name of the person
        - dateOfBirth: Date of birth in YYYY-MM-DD format
        - passportNumber: The passport number
        - nationality: The nationality
        - dateOfIssue: Date of issue in YYYY-MM-DD format
        - dateOfExpiry: Date of expiry in YYYY-MM-DD format
        
        If a field is not found, use an empty string.
        Ensure the output is valid JSON.
      `;

      const response = await ai.models.generateContent({
        model: model,
        contents: {
          parts: [
            { text: prompt },
            { inlineData: { mimeType: "image/jpeg", data: base64Data } }
          ]
        },
        config: {
          responseMimeType: "application/json"
        }
      });

      const text = response.text;
      if (text) {
        try {
          const parsedData = JSON.parse(text) as PassportData;
          setResult(parsedData);
          
          if (!parsedData.fullName) {
            setError('Could not extract full name from the passport. Please ensure the photo is clear and try again.');
          }
        } catch (parseErr) {
          console.error('JSON Parsing Error:', parseErr, 'Raw text:', text);
          setError('Failed to parse the passport data. The image might be too blurry or the format is unsupported. Please try a clearer photo.');
        }
      } else {
        setError("The AI could not extract any text from this image. Please make sure the passport is well-lit and fully visible.");
      }
    } catch (err: any) {
      console.error('OCR Error:', err);
      if (err.message?.includes('API_KEY_INVALID')) {
        setError('Gemini API Key is invalid. Please check your environment configuration.');
      } else if (err.message?.includes('SAFETY')) {
        setError('The image was flagged by safety filters. Please ensure you are uploading a standard passport image.');
      } else {
        setError('An unexpected error occurred during scanning. Please check your internet connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!result || !selectedVisa) return;

    setRegistering(true);
    setError(null);

    try {
      await orderService.createOrder({
        visa_id: selectedVisa.visa_id,
        visa_name: selectedVisa.visa_name,
        visa_code: selectedVisa.visa_code,
        pricing_id: selectedVisa.pricing_id,
        total_fee: selectedVisa.total_fee,
        government_fee: selectedVisa.government_fee,
        service_fee: selectedVisa.service_fee,
        processing_fee: selectedVisa.processing_fee,
        currency: selectedVisa.currency,
        passport_data: result
      });
      setSuccess(true);
      if (onComplete) {
        setTimeout(onComplete, 2000);
      }
    } catch (err) {
      console.error('Registration failed:', err);
      setError('Failed to register your visa application. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setError(null);
    setSuccess(false);
    setCopied(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (success) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card rounded-[3rem] p-12 inline-block"
        >
          <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/20">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-4xl font-black text-brand-text mb-4">{t('ocr.success_title')}</h2>
          <p className="text-brand-muted text-lg max-w-md mx-auto">
            {t('ocr.success_desc')}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-black text-brand-text mb-4">{t('ocr.title')}</h2>
        <p className="text-brand-muted">{t('ocr.subtitle')}</p>
        
        {selectedVisa && (
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="glass-card rounded-3xl p-6 border border-sky-500/20 bg-sky-500/5">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="text-left">
                  <p className="text-[10px] font-black text-sky-500 uppercase tracking-[0.2em] mb-1">{t('visa.selected_visa')}</p>
                  <h3 className="text-2xl font-black text-brand-text">{selectedVisa.visa_name}</h3>
                  <div className="flex items-center gap-2 mt-2 text-brand-muted">
                    <Clock className="w-4 h-4 text-sky-500" />
                    <span className="text-sm font-bold">{selectedVisa.processing_time}</span>
                  </div>
                </div>
                
                <div className="w-full md:w-auto space-y-2 bg-brand-surface/40 p-4 rounded-2xl border border-brand-border min-w-[240px]">
                  <div className="flex justify-between text-xs font-bold text-brand-muted">
                    <span>{t('visa.government_fee')}</span>
                    <span className="text-brand-text">{selectedVisa.government_fee} {selectedVisa.currency}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-brand-muted">
                    <span>{t('visa.service_fee')}</span>
                    <span className="text-brand-text">{selectedVisa.service_fee} {selectedVisa.currency}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-brand-muted">
                    <span>{t('visa.processing_fee')}</span>
                    <span className="text-brand-text">{selectedVisa.processing_fee} {selectedVisa.currency}</span>
                  </div>
                  <div className="pt-2 border-t border-brand-border flex justify-between items-center">
                    <span className="text-xs font-black text-sky-500 uppercase tracking-widest">{t('visa.total_fee')}</span>
                    <span className="text-xl font-black text-brand-text">{selectedVisa.total_fee} {selectedVisa.currency}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Upload Section */}
        <div className="space-y-6">
          <div 
            onClick={() => !loading && !registering && fileInputRef.current?.click()}
            className={cn(
              "relative aspect-[4/3] rounded-[2.5rem] border-2 border-dashed border-brand-border flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group",
              image ? "border-sky-500/50" : "hover:border-sky-500/30 hover:bg-brand-surface/30",
              (loading || registering) && "pointer-events-none opacity-70"
            )}
          >
            {image ? (
              <>
                <img src={image} alt="Passport Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <RefreshCw className="w-10 h-10 text-white" />
                </div>
              </>
            ) : (
              <div className="text-center p-8">
                <div className="w-20 h-20 bg-sky-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Camera className="w-10 h-10 text-sky-500" />
                </div>
                <p className="text-xl font-bold text-brand-text mb-2">{t('ocr.upload_title')}</p>
                <p className="text-sm text-brand-muted">{t('ocr.upload_desc')}</p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={processOCR}
              disabled={!image || loading || registering || !!result}
              className="flex-1 bg-brand-surface border border-brand-border text-brand-text font-bold py-4 rounded-2xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:pointer-events-none hover:bg-brand-surface/80 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('ocr.scanning')}
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  {t('ocr.scan_button')}
                </>
              )}
            </button>
            {image && !loading && !registering && (
              <button
                onClick={reset}
                className="w-14 h-14 bg-brand-surface border border-brand-border rounded-2xl flex items-center justify-center text-brand-muted hover:text-red-500 hover:border-red-500/30 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-[2rem] p-6 border border-brand-border bg-brand-surface/20"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <h4 className="text-xs font-black uppercase tracking-widest text-brand-muted">{t('ocr.extracted_details')}</h4>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-4 py-2 bg-sky-500/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-sky-500 hover:bg-sky-500 hover:text-white transition-all border border-sky-500/20"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3" />
                      {t('common.copied')}
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      {t('common.copy')}
                    </>
                  )}
                </button>
              </div>
              <div className="rounded-xl overflow-hidden border border-brand-border/50 shadow-inner">
                <SyntaxHighlighter 
                  language="json" 
                  style={atomDark}
                  customStyle={{
                    margin: 0,
                    padding: '1.5rem',
                    fontSize: '11px',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                >
                  {JSON.stringify(result, null, 2)}
                </SyntaxHighlighter>
              </div>
            </motion.div>
          )}

          {result && result.fullName && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleRegister}
              disabled={registering}
              className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-sky-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {registering ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <Send className="w-6 h-6" />
                  {t('common.register')}
                </>
              )}
            </motion.button>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/10 border border-red-500/20 p-6 rounded-[2rem] flex flex-col gap-4"
            >
              <div className="flex items-center gap-3 text-red-500">
                <AlertCircle className="w-6 h-6" />
                <h4 className="font-black uppercase tracking-widest text-sm">{t('ocr.scan_error')}</h4>
              </div>
              <p className="text-brand-text font-medium text-sm leading-relaxed">
                {error}
              </p>
              <div className="bg-brand-surface/50 p-4 rounded-xl space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted flex items-center gap-2">
                  <Info className="w-3 h-3" />
                  {t('ocr.tips_title')}
                </p>
                <ul className="text-xs text-brand-muted list-disc list-inside space-y-1">
                  <li>{t('ocr.tip_1')}</li>
                  <li>{t('ocr.tip_2')}</li>
                  <li>{t('ocr.tip_3')}</li>
                  <li>{t('ocr.tip_4')}</li>
                </ul>
              </div>
              <button
                onClick={reset}
                className="text-xs font-black uppercase tracking-widest text-brand-text hover:text-sky-500 transition-colors flex items-center gap-2 mt-2"
              >
                <RefreshCw className="w-3 h-3" />
                {t('ocr.try_another')}
              </button>
            </motion.div>
          )}
        </div>

        {/* Results Section */}
        <div className="glass-card rounded-[2.5rem] p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5">
            <FileText className="w-32 h-32" />
          </div>
          
          <h3 className="text-xl font-bold text-brand-text mb-8 flex items-center gap-3">
            <CheckCircle2 className={cn("w-6 h-6", result ? "text-emerald-500" : "text-brand-muted")} />
            {t('ocr.extracted_details')}
          </h3>

          <div className="space-y-6 relative z-10">
            {[
              { label: t('ocr.full_name'), value: result?.fullName, key: 'fullName' },
              { label: t('ocr.passport_number'), value: result?.passportNumber, key: 'passportNumber' },
              { label: t('ocr.nationality'), value: result?.nationality, key: 'nationality' },
              { label: t('ocr.dob'), value: result?.dateOfBirth, key: 'dateOfBirth' },
              { label: t('ocr.doi'), value: result?.dateOfIssue, key: 'dateOfIssue' },
              { label: t('ocr.doe'), value: result?.dateOfExpiry, key: 'dateOfExpiry' },
            ].map((field) => (
              <div key={field.key} className="space-y-1.5">
                <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">{field.label}</label>
                <div className={cn(
                  "w-full bg-brand-surface/50 border border-brand-border rounded-xl px-4 py-3 text-brand-text min-h-[48px] flex items-center font-bold transition-all",
                  !field.value && "text-brand-muted/30 italic font-normal text-sm bg-brand-surface/20"
                )}>
                  {field.value || (loading ? t('ocr.extracting') : t('ocr.pending'))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
