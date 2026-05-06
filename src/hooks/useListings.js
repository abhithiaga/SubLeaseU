import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useListings({ school, bedrooms, maxRent, urgent } = {}) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('listings')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url,
            verified,
            school
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (school) query = query.eq('school', school);
      if (bedrooms) query = query.eq('bedrooms', bedrooms);
      if (maxRent) query = query.lte('monthly_rent', maxRent);
      if (urgent) query = query.eq('urgent', true);

      const { data, error: err } = await query;
      if (err) throw err;
      setListings(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [school, bedrooms, maxRent, urgent]);

  useEffect(() => {
    fetchListings();

    // Realtime subscription — new listings appear instantly
    const channel = supabase
      .channel('listings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'listings' }, () => {
        fetchListings();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [fetchListings]);

  const createListing = async (listing) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: profile } = await supabase
      .from('profiles')
      .select('school')
      .eq('id', user.id)
      .single();

    const { data, error } = await supabase
      .from('listings')
      .insert({
        ...listing,
        user_id: user.id,
        school: profile?.school || listing.school,
        urgent: isUrgent(listing.sublease_start || listing.lease_start),
      })
      .select()
      .single();

    if (error) throw error;
    await fetchListings();
    return data;
  };

  const updateListing = async (id, updates) => {
    const { data, error } = await supabase
      .from('listings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    await fetchListings();
    return data;
  };

  const deleteListing = async (id) => {
    const { error } = await supabase.from('listings').delete().eq('id', id);
    if (error) throw error;
    await fetchListings();
  };

  return { listings, loading, error, refetch: fetchListings, createListing, updateListing, deleteListing };
}

function isUrgent(dateStr) {
  if (!dateStr) return false;
  const diff = new Date(dateStr) - new Date();
  return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
}
