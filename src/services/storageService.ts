import { supabase } from '../lib/supabase';
import imageCompression from 'browser-image-compression';

export const storageService = {
  async uploadPassportImage(file: File): Promise<string> {
    // Limit file size to 1MB
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    const compressedFile = await imageCompression(file, options);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `passports/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('passports')
      .upload(filePath, compressedFile);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('passports').getPublicUrl(filePath);
    return data.publicUrl;
  }
};
