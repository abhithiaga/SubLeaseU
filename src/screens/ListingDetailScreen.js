import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Image, Dimensions, Alert
} from 'react-native';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import MatchBadge from '../components/MatchBadge';

const { width } = Dimensions.get('window');

export default function ListingDetailScreen({ route, navigation }) {
  const { listing } = route.params;
  const [currentUser, setCurrentUser] = useState(null);
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUser(user));
  }, []);

  const isOwner = currentUser?.id === listing.user_id;

  const {
    building_name, address, unit_number, bedrooms, bathrooms, sqft,
    monthly_rent, lease_start, lease_end, sublease_start,
    description, reason, furnished, amenities, photos, urgent,
    profiles: poster, status
  } = listing;

  const startDate = lease_start ? format(new Date(lease_start), 'MMM d, yyyy') : '?';
  const endDate = lease_end ? format(new Date(lease_end), 'MMM d, yyyy') : '?';
  const subleaseDate = sublease_start ? format(new Date(sublease_start), 'MMM d, yyyy') : startDate;

  const handleMessage = () => {
    if (!currentUser) {
      Alert.alert('Sign in required', 'Please sign in to message this person.');
      return;
    }
    if (isOwner) {
      Alert.alert('This is your listing!', 'You posted this one.');
      return;
    }
    navigation.navigate('Messages', {
      listingId: listing.id,
      otherUserId: listing.user_id,
      otherName: poster?.full_name,
      context: `Hi! I'm interested in your sublease at ${building_name}.`,
    });
  };

  const handleMarkFilled = async () => {
    Alert.alert(
      'Mark as filled?',
      'This will remove the listing from the marketplace.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, it\'s filled',
          onPress: async () => {
            await supabase.from('listings').update({ status: 'filled' }).eq('id', listing.id);
            navigation.goBack();
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Photo gallery */}
        <View style={styles.gallery}>
          {photos?.length > 0 ? (
            <>
              <Image source={{ uri: photos[photoIndex] }} style={styles.mainPhoto} resizeMode="cover" />
              {photos.length > 1 && (
                <ScrollView horizontal style={styles.thumbnailRow} showsHorizontalScrollIndicator={false}>
                  {photos.map((p, i) => (
                    <TouchableOpacity key={i} onPress={() => setPhotoIndex(i)}>
                      <Image
                        source={{ uri: p }} style={[styles.thumbnail, photoIndex === i && styles.thumbnailActive]}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </>
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={{ fontSize: 64 }}>🏠</Text>
            </View>
          )}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          {urgent && (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentText}>⚡ URGENT</Text>
            </View>
          )}
        </View>

        <View style={styles.body}>

          {/* Price + name */}
          <View style={styles.topRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.buildingName}>{building_name}</Text>
              {address && <Text style={styles.address}>{address}{unit_number ? ` · Unit ${unit_number}` : ''}</Text>}
            </View>
            <View style={styles.priceBlock}>
              <Text style={styles.price}>${monthly_rent?.toLocaleString()}</Text>
              <Text style={styles.priceUnit}>/month</Text>
            </View>
          </View>

          {/* Specs */}
          <View style={styles.specRow}>
            <SpecChip icon="🛏" label={`${bedrooms} bed`} />
            <SpecChip icon="🚿" label={`${bathrooms} bath`} />
            {sqft && <SpecChip icon="📐" label={`${sqft} sqft`} />}
            {furnished && <SpecChip icon="🛋" label="Furnished" />}
          </View>

          {/* Dates */}
          <View style={styles.datesCard}>
            <DateRow icon="📅" label="Lease period" value={`${startDate} → ${endDate}`} />
            <DateRow icon="🔑" label="Need someone by" value={subleaseDate} highlight />
          </View>

          {/* Reason */}
          {reason && (
            <View style={styles.reasonCard}>
              <Text style={styles.reasonLabel}>Why they're subleasing</Text>
              <Text style={styles.reasonText}>"{reason}"</Text>
            </View>
          )}

          {/* Description */}
          {description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About this place</Text>
              <Text style={styles.descriptionText}>{description}</Text>
            </View>
          )}

          {/* Amenities */}
          {amenities?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Amenities</Text>
              <View style={styles.amenitiesRow}>
                {amenities.map(a => (
                  <View key={a} style={styles.amenityChip}>
                    <Text style={styles.amenityText}>{a}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Poster */}
          <View style={styles.posterCard}>
            <View style={styles.posterAvatarCircle}>
              <Text style={styles.posterAvatarText}>{poster?.full_name?.[0]?.toUpperCase() || '?'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.posterName}>{poster?.full_name}</Text>
              <Text style={styles.posterSchool}>{poster?.school}</Text>
            </View>
            {poster?.verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ Student verified</Text>
              </View>
            )}
          </View>

          {/* Owner controls */}
          {isOwner && (
            <TouchableOpacity style={styles.markFilledBtn} onPress={handleMarkFilled}>
              <Text style={styles.markFilledText}>✅ Mark as filled</Text>
            </TouchableOpacity>
          )}

          {/* Spacer for floating button */}
          <View style={{ height: 90 }} />
        </View>
      </ScrollView>

      {/* Floating message button */}
      {!isOwner && (
        <View style={styles.floatingBar}>
          <TouchableOpacity style={styles.messageBtn} onPress={handleMessage}>
            <Text style={styles.messageBtnText}>💬 Message about this place</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

function SpecChip({ icon, label }) {
  return (
    <View style={styles.specChip}>
      <Text style={styles.specIcon}>{icon}</Text>
      <Text style={styles.specLabel}>{label}</Text>
    </View>
  );
}

function DateRow({ icon, label, value, highlight }) {
  return (
    <View style={styles.dateRow}>
      <Text style={styles.dateIcon}>{icon}</Text>
      <View>
        <Text style={styles.dateLabel}>{label}</Text>
        <Text style={[styles.dateValue, highlight && styles.dateValueHighlight]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  gallery: { position: 'relative' },
  mainPhoto: { width, height: 260 },
  photoPlaceholder: { width, height: 260, backgroundColor: '#16161E', alignItems: 'center', justifyContent: 'center' },
  thumbnailRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#0A0A0F' },
  thumbnail: { width: 60, height: 60, borderRadius: 8, marginRight: 8 },
  thumbnailActive: { borderWidth: 2, borderColor: '#FF6B35' },
  backBtn: {
    position: 'absolute', top: 16, left: 16,
    backgroundColor: 'rgba(10,10,15,0.7)', width: 36, height: 36,
    borderRadius: 18, alignItems: 'center', justifyContent: 'center',
  },
  backBtnText: { color: '#FFF', fontSize: 20 },
  urgentBadge: {
    position: 'absolute', top: 16, right: 16,
    backgroundColor: '#FF3B30', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
  },
  urgentText: { color: '#FFF', fontWeight: '800', fontSize: 12 },
  body: { padding: 16 },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  buildingName: { color: '#FAFAFA', fontSize: 22, fontWeight: '900', letterSpacing: -0.5, marginBottom: 4 },
  address: { color: '#5050A0', fontSize: 13 },
  priceBlock: { alignItems: 'flex-end' },
  price: { color: '#FF6B35', fontSize: 28, fontWeight: '900' },
  priceUnit: { color: '#FF6B35', fontSize: 12, opacity: 0.7 },
  specRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  specChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#16161E', paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: '#2A2A3A',
  },
  specIcon: { fontSize: 14 },
  specLabel: { color: '#9090B8', fontSize: 13 },
  datesCard: {
    backgroundColor: '#16161E', borderRadius: 14, padding: 14,
    marginBottom: 14, borderWidth: 1, borderColor: '#2A2A3A', gap: 10,
  },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dateIcon: { fontSize: 20 },
  dateLabel: { color: '#5050A0', fontSize: 11, marginBottom: 2 },
  dateValue: { color: '#FAFAFA', fontSize: 14, fontWeight: '600' },
  dateValueHighlight: { color: '#FF6B35' },
  reasonCard: {
    backgroundColor: '#1A1020', borderRadius: 12, padding: 14, marginBottom: 14,
    borderLeftWidth: 4, borderLeftColor: '#FF6B35', borderWidth: 1, borderColor: '#2A1820',
  },
  reasonLabel: { color: '#7050A0', fontSize: 11, fontWeight: '600', marginBottom: 4 },
  reasonText: { color: '#C0A0D0', fontSize: 14, lineHeight: 20, fontStyle: 'italic' },
  section: { marginBottom: 14 },
  sectionTitle: { color: '#FAFAFA', fontSize: 15, fontWeight: '800', marginBottom: 8 },
  descriptionText: { color: '#8080B0', fontSize: 14, lineHeight: 22 },
  amenitiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenityChip: {
    backgroundColor: '#16161E', paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1, borderColor: '#2A2A3A',
  },
  amenityText: { color: '#7070A0', fontSize: 13 },
  posterCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#16161E', borderRadius: 14, padding: 14,
    marginBottom: 14, borderWidth: 1, borderColor: '#2A2A3A',
  },
  posterAvatarCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#FF6B35', alignItems: 'center', justifyContent: 'center',
  },
  posterAvatarText: { color: '#FFF', fontWeight: '900', fontSize: 18 },
  posterName: { color: '#FAFAFA', fontSize: 15, fontWeight: '700' },
  posterSchool: { color: '#5050A0', fontSize: 12 },
  verifiedBadge: {
    backgroundColor: 'rgba(52,199,89,0.1)', paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 6, borderWidth: 1, borderColor: '#34C759',
  },
  verifiedText: { color: '#34C759', fontSize: 11, fontWeight: '700' },
  markFilledBtn: {
    backgroundColor: 'rgba(52,199,89,0.1)', borderRadius: 12, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: '#34C759', marginBottom: 8,
  },
  markFilledText: { color: '#34C759', fontWeight: '700', fontSize: 15 },
  floatingBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#0A0A0F', padding: 16, paddingBottom: 24,
    borderTopWidth: 1, borderTopColor: '#16161E',
  },
  messageBtn: {
    backgroundColor: '#FF6B35', borderRadius: 14, padding: 16,
    alignItems: 'center',
  },
  messageBtnText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
});
