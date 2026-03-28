import { supabase } from '../lib/supabase';
import { Destination, Nationality, VisaLookupResult } from '../types';

export const visaService = {
  async getDestinations(): Promise<Destination[]> {
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async getNationalities(): Promise<Nationality[]> {
    const { data, error } = await supabase
      .from('nationalities')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async lookupVisas(destinationId: string, nationalityId: string): Promise<VisaLookupResult[]> {
    // 1. Get eligible visa types for this destination and nationality
    const { data: eligibilities, error: eligError } = await supabase
      .from('visa_eligibilities')
      .select(`
        visa_type_id,
        visa_types!inner (
          id,
          code,
          name,
          destination_id
        )
      `)
      .eq('nationality_id', nationalityId)
      .eq('is_eligible', true)
      .eq('is_active', true)
      .eq('visa_types.destination_id', destinationId);

    if (eligError) throw eligError;
    if (!eligibilities || eligibilities.length === 0) return [];

    const visaTypeIds = eligibilities.map(e => e.visa_type_id);

    // 2. Get pricing for these visa types
    const { data: pricings, error: priceError } = await supabase
      .from('visa_pricings')
      .select('*')
      .in('visa_type_id', visaTypeIds)
      .eq('is_active', true);

    if (priceError) throw priceError;

    // 3. Group and format the results
    return eligibilities.map(elig => {
      const visaType = elig.visa_types as any;
      const visaPricings = (pricings || []).filter(p => p.visa_type_id === visaType.id);

      return {
        visa_id: visaType.id,
        visa_code: visaType.code,
        visa_name: visaType.name,
        pricing_options: visaPricings.map(p => ({
          id: p.id,
          processing_time_value: p.processing_time_value,
          processing_time_unit: p.processing_time_unit,
          fees: {
            government_fee: p.government_fee,
            processing_fee: p.processing_fee,
            service_fee: p.service_fee,
            total_fee: p.government_fee + p.processing_fee + p.service_fee,
            currency: p.currency,
          }
        }))
      };
    });
  },

  // Helper to seed initial data if needed (for demonstration)
  async seedInitialData() {
    // This is a simplified seed function. 
    // In a real app, this would be handled via migrations or an admin panel.
    console.log('Seeding initial data logic would go here...');
  }
};
