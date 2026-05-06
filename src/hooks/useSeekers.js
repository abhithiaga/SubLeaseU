import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useSeekers({ school, bedrooms, maxBudget } = {}) {
  const [seekers, setSeekers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSeekers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('seekers')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url,
            verified,
            school
          )
        `)
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (school) query = query.eq('school', school);
      if (bedrooms) query = query.eq('bedrooms_needed', bedrooms);
      if (maxBudget) query = query.gte('budget_max', maxBudget);

      const { data, error: err } = await query;
      if (err) throw err;
      setSeekers(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [school, bedrooms, maxBudget]);

  useEffect(() => {
    fetchSeekers();

    const channel = supabase
      .channel('seekers-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'seekers' }, () => {
        fetchSeekers();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [fetchSeekers]);

  const createSeeker = async (seekerData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: profile } = await supabase
      .from('profiles')
      .select('school')
      .eq('id', user.id)
      .single();

    const { data, error } = await supabase
      .from('seekers')
      .insert({
        ...seekerData,
        user_id: user.id,
        school: profile?.school || seekerData.school,
      })
      .select()
      .single();

    if (error) throw error;
    await fetchSeekers();
    return data;
  };

  const deactivateSeeker = async (id) => {
    const { error } = await supabase
      .from('seekers')
      .update({ active: false })
      .eq('id', id);
    if (error) throw error;
    await fetchSeekers();
  };

  return { seekers, loading, error, refetch: fetchSeekers, createSeeker, deactivateSeeker };
}
