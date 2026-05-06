import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper: parse school from .edu email
export function schoolFromEmail(email) {
  const domain = email.split('@')[1];
  const schools = {
    'utexas.edu': 'UT Austin',
    'tamu.edu': 'Texas A&M',
    'rice.edu': 'Rice University',
    'baylor.edu': 'Baylor',
    'unt.edu': 'UNT',
    'uh.edu': 'University of Houston',
    'harvard.edu': 'Harvard',
    'mit.edu': 'MIT',
    'stanford.edu': 'Stanford',
    'ucla.edu': 'UCLA',
    'usc.edu': 'USC',
    'gatech.edu': 'Georgia Tech',
  };
  return schools[domain] || domain?.replace('.edu', '').toUpperCase() || 'Unknown';
}

export function isEduEmail(email) {
  return email?.toLowerCase().endsWith('.edu');
}
