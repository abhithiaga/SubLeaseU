import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, Dimensions
} from 'react-native';
import { format } from 'date-fns';

const { width } = Dimensions.get('window');

export default function LeaserCard({ listing, onPress, compact = false }) {
  const {
    building_name, monthly_rent, bedrooms, bathrooms,
    lease_start, lease_end, urgent, furnished,
    photos, reason, profiles, sqft,
  } = listing;

  const poster = profiles;
  const photo = photos?.[0];
  const startDate = lease_start ? format(new Date(lease_start), 'MMM d') : '?';
  const endDate = lease_end ? format(new Date(lease_end), 'MMM d, yyyy') : '?';

  return (
    <TouchableOpacity style={[styles.card, compact && styles.cardCompact]} onPress={onPress} activeOpacity={0.92}>
      {/* Photo */}
      <View style={styles.photoContainer}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.photo} resizeMode="cover" />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoPlaceholderText}>🏠</Text>
          </View>
        )}
        {urgent && (
          <View style={styles.urgentBadge}>
            <Text style={styles.urgentText}>⚡ URGENT</Text>
          </View>
        )}
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>${monthly_rent?.toLocaleString()}</Text>
          <Text style={styles.priceUnit}>/mo</Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.body}>
        <Text style={styles.buildingName} numberOfLines={1}>{building_name}</Text>

        <View style={styles.specs}>
          <Text style={styles.spec}>{bedrooms}bd</Text>
          <Text style={styles.specDot}>·</Text>
          <Text style={styles.spec}>{bathrooms}ba</Text>
          {sqft && <><Text style={styles.specDot}>·</Text><Text style={styles.spec}>{sqft} sqft</Text></>}
          {furnished && <><Text style={styles.specDot}>·</Text><Text style={styles.spec}>Furnished</Text></>}
        </View>

        <View style={styles.dates}>
          <Text style={styles.dateText}>📅 {startDate} → {endDate}</Text>
        </View>

        {reason && !compact && (
          <View style={styles.reasonBox}>
            <Text style={styles.reasonText} numberOfLines={2}>"{reason}"</Text>
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.posterRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>
                {poster?.full_name?.[0]?.toUpperCase() || '?'}
              </Text>
            </View>
            <View>
              <Text style={styles.posterName}>{poster?.full_name || 'Student'}</Text>
              <Text style={styles.posterSchool}>{poster?.school}</Text>
            </View>
          </View>
          {poster?.verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Verified</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#16161E',
    borderRadius: 18,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2A2A3A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  cardCompact: { marginBottom: 8 },
  photoContainer: { position: 'relative', height: 180 },
  photo: { width: '100%', height: '100%' },
  photoPlaceholder: {
    width: '100%', height: '100%',
    backgroundColor: '#1E1E2E',
    alignItems: 'center', justifyContent: 'center',
  },
  photoPlaceholderText: { fontSize: 48 },
  urgentBadge: {
    position: 'absolute', top: 12, left: 12,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8,
  },
  urgentText: { color: '#FFF', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  priceBadge: {
    position: 'absolute', bottom: 12, right: 12,
    backgroundColor: 'rgba(10,10,15,0.85)',
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 10, flexDirection: 'row', alignItems: 'baseline',
    borderWidth: 1, borderColor: '#FF6B35',
  },
  priceText: { color: '#FF6B35', fontSize: 18, fontWeight: '800' },
  priceUnit: { color: '#FF6B35', fontSize: 11, marginLeft: 2 },
  body: { padding: 14 },
  buildingName: { color: '#FAFAFA', fontSize: 16, fontWeight: '700', marginBottom: 6 },
  specs: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  spec: { color: '#9090A8', fontSize: 13 },
  specDot: { color: '#3A3A4A', marginHorizontal: 5, fontSize: 13 },
  dates: { marginBottom: 8 },
  dateText: { color: '#7070A0', fontSize: 12 },
  reasonBox: {
    backgroundColor: '#1E1E2E',
    borderRadius: 8, padding: 10, marginBottom: 10,
    borderLeftWidth: 3, borderLeftColor: '#FF6B35',
  },
  reasonText: { color: '#B0B0C8', fontSize: 13, fontStyle: 'italic' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  posterRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatarCircle: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#FF6B35', alignItems: 'center', justifyContent: 'center',
  },
  avatarInitial: { color: '#FFF', fontWeight: '800', fontSize: 13 },
  posterName: { color: '#FAFAFA', fontSize: 13, fontWeight: '600' },
  posterSchool: { color: '#6060A0', fontSize: 11 },
  verifiedBadge: {
    backgroundColor: 'rgba(52,199,89,0.15)',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
    borderWidth: 1, borderColor: '#34C759',
  },
  verifiedText: { color: '#34C759', fontSize: 11, fontWeight: '600' },
});
