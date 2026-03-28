import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ueiiwlslncywthrgzrxz.supabase.co';
const supabaseKey = 'sb_publishable_5l-gfuSESg46mVTKk2Vo7w_XRPtfJDI';

export const supabase = createClient(supabaseUrl, supabaseKey);
