export type ProcessingTimeUnit = 'days' | 'hours';

export interface Destination {
  id: string;
  iso_code: string;
  name: string;
  is_active: boolean;
}

export interface Nationality {
  id: string;
  iso_code: string;
  name: string;
  is_active: boolean;
}

export interface VisaType {
  id: string;
  destination_id: string;
  code: string;
  name: string;
  is_active: boolean;
}

export interface VisaEligibility {
  visa_type_id: string;
  nationality_id: string;
  is_eligible: boolean;
  is_active: boolean;
}

export interface VisaPricing {
  id: string;
  visa_type_id: string;
  processing_time_value: number;
  processing_time_unit: ProcessingTimeUnit;
  government_fee: number;
  processing_fee: number;
  service_fee: number;
  currency: string;
  is_active: boolean;
}

export interface VisaLookupResult {
  visa_id: string;
  visa_code: string;
  visa_name: string;
  pricing_options: {
    id: string;
    processing_time_value: number;
    processing_time_unit: ProcessingTimeUnit;
    fees: {
      government_fee: number;
      processing_fee: number;
      service_fee: number;
      total_fee: number;
      currency: string;
    };
  }[];
}

export interface PassportData {
  fullName: string;
  dateOfBirth: string;
  passportNumber: string;
  nationality: string;
  dateOfIssue: string;
  dateOfExpiry: string;
}

export interface Order {
  id: string;
  created_at: string;
  visa_id: string;
  visa_name: string;
  visa_code: string;
  pricing_id: string;
  total_fee: number;
  government_fee: number;
  service_fee: number;
  processing_fee: number;
  currency: string;
  passport_data: PassportData;
  passport_image_url?: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
}
