import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useMessages(listingId, otherUserId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id);
    });
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!listingId || !currentUserId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id (full_name, avatar_url),
          receiver:receiver_id (full_name, avatar_url)
        `)
        .eq('listing_id', listingId)
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark received messages as read
      const unread = (data || []).filter(m => m.receiver_id === currentUserId && !m.read);
      if (unread.length > 0) {
        await supabase
          .from('messages')
          .update({ read: true })
          .in('id', unread.map(m => m.id));
      }
    } finally {
      setLoading(false);
    }
  }, [listingId, currentUserId]);

  useEffect(() => {
    fetchMessages();

    if (!listingId) return;
    const channel = supabase
      .channel(`messages-${listingId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `listing_id=eq.${listingId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [fetchMessages, listingId]);

  const sendMessage = async (body) => {
    if (!currentUserId || !otherUserId || !listingId) throw new Error('Missing context');

    const { data, error } = await supabase
      .from('messages')
      .insert({
        listing_id: listingId,
        sender_id: currentUserId,
        receiver_id: otherUserId,
        body,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  // Get all conversations for inbox screen (no listingId needed)
  const getInbox = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        listing:listing_id (building_name, monthly_rent),
        sender:sender_id (full_name, avatar_url),
        receiver:receiver_id (full_name, avatar_url)
      `)
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Group by listing + other user, return latest message per thread
    const threads = {};
    (data || []).forEach(msg => {
      const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
      const key = `${msg.listing_id}-${otherId}`;
      if (!threads[key]) threads[key] = msg;
    });
    return Object.values(threads);
  };

  return { messages, loading, sendMessage, getInbox, currentUserId };
}
