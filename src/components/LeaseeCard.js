import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';

export default function LeaseeCard({ seeker, onPress, onMessage }) {
  const { budget_max, bedrooms_needed, move_in_date, move_out_date, notes, furnished_required, profiles } = seeker;
  const poster = profiles;
  const moveIn = move_in_date ? format(new Date(move_in_date), 'MMM d, yyyy') : '?';
  const moveOut = move_out_date ? format(new Date(move_out_date), 'MMM d, yyyy') : 'Flexible';

  // Generate hue from user ID for avatar color variety
  const hue = poster?.full_name
    ? poster.full_name.charCodeAt(0) * 7 % 360
    : 200;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.92}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: `hsl(${hue},60%,45%)` }]}>
          <Text style={styles.avatarText}>{poster?.full_name?.[0]?.toUpperCase() || '?'}</Text>
        </View>
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{poster?.full_name || 'Student'}</Text>
            {poster?.verified && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.school}>{poster?.school}</Text>
        </View>
        <View style={styles.budgetBadge}>
          <Text style={styles.budgetLabel}>up to</Text>
          <Text style={styles.budgetAmount}>${budget_max?.toLocaleString()}</Text>
        </View>
      </View>

      {/* Needs */}
      <View style={styles.chips}>
        <View style={styles.chip}><Text style={styles.chipText}>{bedrooms_needed} bed</Text></View>
        {furnished_required && <View style={styles.chip}><Text style={styles.chipText}>Furnished</Text></View>}
        <View style={[styles.chip, styles.chipDate]}>
          <Text style={styles.chipText}>📅 {moveIn}</Text>
        </View>
        {move_out_date && (
          <View style={[styles.chip, styles.chipDate]}>
            <Text style={styles.chipText}>→ {moveOut}</Text>
          </View>
        )}
      </View>

      {/* Notes */}
      {notes && (
        <Text style={styles.notes} numberOfLines={2}>{notes}</Text>
      )}

      {/* Action */}
      <TouchableOpacity style={styles.messageBtn} onPress={onMessage}>
        <Text style={styles.messageBtnText}>💬 I have a place for you</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#16161E',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2A3A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  avatarText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  headerInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  name: { color: '#FAFAFA', fontSize: 15, fontWeight: '700' },
  checkmark: { color: '#34C759', fontWeight: '800', fontSize: 13 },
  school: { color: '#6060A0', fontSize: 12 },
  budgetBadge: { alignItems: 'flex-end' },
  budgetLabel: { color: '#6060A0', fontSize: 10 },
  budgetAmount: { color: '#00D4AA', fontSize: 17, fontWeight: '800' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  chip: {
    backgroundColor: '#1E1E2E',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1, borderColor: '#2A2A3A',
  },
  chipDate: { borderColor: '#3A3A5A' },
  chipText: { color: '#9090B8', fontSize: 12 },
  notes: { color: '#7070A0', fontSize: 13, marginBottom: 10, lineHeight: 18 },
  messageBtn: {
    backgroundColor: 'rgba(0,212,170,0.1)',
    borderRadius: 10, padding: 10,
    alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(0,212,170,0.3)',
  },
  messageBtnText: { color: '#00D4AA', fontWeight: '700', fontSize: 14 },
});
