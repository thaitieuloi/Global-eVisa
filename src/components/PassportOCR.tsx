import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Upload, FileText, Loader2, CheckCircle2, AlertCircle, X, RefreshCw, Send, Clock } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
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
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [result, setResult] = useState<PassportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
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
        const parsedData = JSON.parse(text) as PassportData;
        setResult(parsedData);
      } else {
        throw new Error("No text extracted from image.");
      }
    } catch (err) {
      console.error('OCR failed:', err);
      setError('Failed to extract information from the passport. Please try a clearer image.');
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
    if (fileInputRef.current) fileInputRef.current.value = '';
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
          <h2 className="text-4xl font-black text-brand-text mb-4">Application Registered!</h2>
          <p className="text-brand-muted text-lg max-w-md mx-auto">
            Your visa application has been successfully submitted. Our team will process it shortly.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-black text-brand-text mb-4">Complete Your Application</h2>
        <p className="text-brand-muted">Please scan your passport to automatically fill in the required details.</p>
        
        {selectedVisa && (
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="glass-card rounded-3xl p-6 border border-sky-500/20 bg-sky-500/5">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="text-left">
                  <p className="text-[10px] font-black text-sky-500 uppercase tracking-[0.2em] mb-1">Selected Visa</p>
                  <h3 className="text-2xl font-black text-brand-text">{selectedVisa.visa_name}</h3>
                  <div className="flex items-center gap-2 mt-2 text-brand-muted">
                    <Clock className="w-4 h-4 text-sky-500" />
                    <span className="text-sm font-bold">{selectedVisa.processing_time}</span>
                  </div>
                </div>
                
                <div className="w-full md:w-auto space-y-2 bg-brand-surface/40 p-4 rounded-2xl border border-brand-border min-w-[240px]">
                  <div className="flex justify-between text-xs font-bold text-brand-muted">
                    <span>Government Fee</span>
                    <span className="text-brand-text">{selectedVisa.government_fee} {selectedVisa.currency}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-brand-muted">
                    <span>Service Fee</span>
                    <span className="text-brand-text">{selectedVisa.service_fee} {selectedVisa.currency}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-brand-muted">
                    <span>Processing Fee</span>
                    <span className="text-brand-text">{selectedVisa.processing_fee} {selectedVisa.currency}</span>
                  </div>
                  <div className="pt-2 border-t border-brand-border flex justify-between items-center">
                    <span className="text-xs font-black text-sky-500 uppercase tracking-widest">Total Fee</span>
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
                <p className="text-xl font-bold text-brand-text mb-2">Upload Passport Photo</p>
                <p className="text-sm text-brand-muted">Click to browse or drag and drop</p>
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
                  Scanning...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  Scan Passport
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
                  REGISTER APPLICATION
                </>
              )}
            </motion.button>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="glass-card rounded-[2.5rem] p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5">
            <FileText className="w-32 h-32" />
          </div>
          
          <h3 className="text-xl font-bold text-brand-text mb-8 flex items-center gap-3">
            <CheckCircle2 className={cn("w-6 h-6", result ? "text-emerald-500" : "text-brand-muted")} />
            Extracted Passport Details
          </h3>

          <div className="space-y-6 relative z-10">
            {[
              { label: 'Full Name', value: result?.fullName, key: 'fullName' },
              { label: 'Passport Number', value: result?.passportNumber, key: 'passportNumber' },
              { label: 'Nationality', value: result?.nationality, key: 'nationality' },
              { label: 'Date of Birth', value: result?.dateOfBirth, key: 'dateOfBirth' },
              { label: 'Date of Issue', value: result?.dateOfIssue, key: 'dateOfIssue' },
              { label: 'Date of Expiry', value: result?.dateOfExpiry, key: 'dateOfExpiry' },
            ].map((field) => (
              <div key={field.key} className="space-y-1.5">
                <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">{field.label}</label>
                <div className={cn(
                  "w-full bg-brand-surface/50 border border-brand-border rounded-xl px-4 py-3 text-brand-text min-h-[48px] flex items-center font-bold transition-all",
                  !field.value && "text-brand-muted/30 italic font-normal text-sm bg-brand-surface/20"
                )}>
                  {field.value || (loading ? 'Extracting...' : 'Pending scan...')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
