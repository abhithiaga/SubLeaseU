import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Alert,
  ActivityIndicator, SafeAreaView, Switch
} from 'react-native';
import { useListings } from '../hooks/useListings';

const AMENITIES_OPTIONS = ['Gym', 'Pool', 'Parking', 'Pet-friendly', 'Rooftop', 'Study room', 'Doorman', 'In-unit W/D'];

export default function PostListingScreen({ navigation }) {
  const { createListing } = useListings();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    building_name: '',
    address: '',
    unit_number: '',
    bedrooms: '1',
    bathrooms: '1',
    sqft: '',
    monthly_rent: '',
    lease_start: '',
    lease_end: '',
    sublease_start: '',
    description: '',
    reason: '',
    furnished: false,
    contact_email: '',
    contact_phone: '',
    amenities: [],
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const toggleAmenity = (a) => {
    set('amenities',
      form.amenities.includes(a)
        ? form.amenities.filter(x => x !== a)
        : [...form.amenities, a]
    );
  };

  const validate = () => {
    if (!form.building_name.trim()) return 'Building name is required';
    if (!form.monthly_rent || isNaN(+form.monthly_rent)) return 'Valid monthly rent is required';
    if (!form.lease_start) return 'Lease start date is required (YYYY-MM-DD)';
    if (!form.lease_end) return 'Lease end date is required (YYYY-MM-DD)';
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { Alert.alert('Missing info', err); return; }

    setLoading(true);
    try {
      await createListing({
        building_name: form.building_name.trim(),
        address: form.address.trim(),
        unit_number: form.unit_number.trim(),
        bedrooms: parseInt(form.bedrooms),
        bathrooms: parseFloat(form.bathrooms),
        sqft: form.sqft ? parseInt(form.sqft) : null,
        monthly_rent: parseInt(form.monthly_rent),
        lease_start: form.lease_start,
        lease_end: form.lease_end,
        sublease_start: form.sublease_start || form.lease_start,
        description: form.description.trim(),
        reason: form.reason.trim(),
        furnished: form.furnished,
        amenities: form.amenities,
        contact_email: form.contact_email.trim(),
        contact_phone: form.contact_phone.trim(),
        photos: [],
      });
      Alert.alert('🎉 Listing posted!', 'Your sublease is now live.', [
        { text: 'View marketplace', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.screenTitle}>Post Your Sublease</Text>
          </View>

          {/* Section: Property */}
          <Section title="🏠 Property Info">
            <Field label="Building Name *" placeholder="WAMPUS at Union">
              <TextInput style={styles.input} value={form.building_name} onChangeText={v => set('building_name', v)} placeholder="WAMPUS at Union" placeholderTextColor="#404060" />
            </Field>
            <Field label="Address" placeholder="3001 Whitis Ave, Austin, TX">
              <TextInput style={styles.input} value={form.address} onChangeText={v => set('address', v)} placeholder="3001 Whitis Ave" placeholderTextColor="#404060" />
            </Field>
            <View style={styles.row}>
              <Field label="Unit #" flex={1}>
                <TextInput style={styles.input} value={form.unit_number} onChangeText={v => set('unit_number', v)} placeholder="4B" placeholderTextColor="#404060" />
              </Field>
              <View style={styles.rowGap} />
              <Field label="Sqft" flex={1}>
                <TextInput style={styles.input} value={form.sqft} onChangeText={v => set('sqft', v)} placeholder="680" placeholderTextColor="#404060" keyboardType="numeric" />
              </Field>
            </View>
            <View style={styles.row}>
              <Field label="Bedrooms *" flex={1}>
                <View style={styles.stepper}>
                  {['1','2','3','4'].map(n => (
                    <TouchableOpacity key={n} style={[styles.stepBtn, form.bedrooms === n && styles.stepBtnActive]} onPress={() => set('bedrooms', n)}>
                      <Text style={[styles.stepText, form.bedrooms === n && styles.stepTextActive]}>{n}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Field>
              <View style={styles.rowGap} />
              <Field label="Bathrooms *" flex={1}>
                <View style={styles.stepper}>
                  {['1','1.5','2','2.5'].map(n => (
                    <TouchableOpacity key={n} style={[styles.stepBtn, form.bathrooms === n && styles.stepBtnActive]} onPress={() => set('bathrooms', n)}>
                      <Text style={[styles.stepText, form.bathrooms === n && styles.stepTextActive]}>{n}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Field>
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Furnished</Text>
              <Switch value={form.furnished} onValueChange={v => set('furnished', v)} trackColor={{ true: '#FF6B35' }} />
            </View>
          </Section>

          {/* Section: Lease */}
          <Section title="📅 Lease Details">
            <Field label="Monthly Rent ($) *">
              <TextInput style={styles.input} value={form.monthly_rent} onChangeText={v => set('monthly_rent', v)} placeholder="1190" placeholderTextColor="#404060" keyboardType="numeric" />
            </Field>
            <View style={styles.row}>
              <Field label="Lease Start (YYYY-MM-DD) *" flex={1}>
                <TextInput style={styles.input} value={form.lease_start} onChangeText={v => set('lease_start', v)} placeholder="2025-08-15" placeholderTextColor="#404060" />
              </Field>
              <View style={styles.rowGap} />
              <Field label="Lease End *" flex={1}>
                <TextInput style={styles.input} value={form.lease_end} onChangeText={v => set('lease_end', v)} placeholder="2026-05-31" placeholderTextColor="#404060" />
              </Field>
            </View>
            <Field label="I Need Someone By (YYYY-MM-DD)">
              <TextInput style={styles.input} value={form.sublease_start} onChangeText={v => set('sublease_start', v)} placeholder="Same as lease start" placeholderTextColor="#404060" />
            </Field>
          </Section>

          {/* Section: Story */}
          <Section title="✍️ Your Story">
            <Field label="Why are you subleasing?">
              <TextInput
                style={[styles.input, styles.textarea]}
                value={form.reason}
                onChangeText={v => set('reason', v)}
                placeholder="Got a summer internship in Boston and need someone to take over..."
                placeholderTextColor="#404060"
                multiline numberOfLines={2}
              />
            </Field>
            <Field label="Additional description">
              <TextInput
                style={[styles.input, styles.textarea]}
                value={form.description}
                onChangeText={v => set('description', v)}
                placeholder="Quiet building, amazing city views, 5 min walk to campus..."
                placeholderTextColor="#404060"
                multiline numberOfLines={3}
              />
            </Field>
          </Section>

          {/* Section: Amenities */}
          <Section title="✨ Amenities">
            <View style={styles.amenitiesGrid}>
              {AMENITIES_OPTIONS.map(a => (
                <TouchableOpacity
                  key={a}
                  style={[styles.amenityBtn, form.amenities.includes(a) && styles.amenityBtnActive]}
                  onPress={() => toggleAmenity(a)}
                >
                  <Text style={[styles.amenityText, form.amenities.includes(a) && styles.amenityTextActive]}>{a}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Section>

          {/* Section: Contact */}
          <Section title="📞 Contact Info">
            <Field label="Contact email (shown after match)">
              <TextInput style={styles.input} value={form.contact_email} onChangeText={v => set('contact_email', v)} placeholder="you@utexas.edu" placeholderTextColor="#404060" keyboardType="email-address" autoCapitalize="none" />
            </Field>
            <Field label="Phone (optional)">
              <TextInput style={styles.input} value={form.contact_phone} onChangeText={v => set('contact_phone', v)} placeholder="(512) 555-0100" placeholderTextColor="#404060" keyboardType="phone-pad" />
            </Field>
          </Section>

          {/* Submit */}
          <TouchableOpacity style={[styles.submitBtn, loading && styles.submitBtnDisabled]} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitText}>🚀 Post Listing</Text>}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Field({ label, children, flex }) {
  return (
    <View style={[styles.field, flex && { flex }]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  scroll: { padding: 16, paddingBottom: 48 },
  header: { marginBottom: 20 },
  backBtn: { marginBottom: 8 },
  backText: { color: '#FF6B35', fontSize: 15, fontWeight: '600' },
  screenTitle: { color: '#FAFAFA', fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  section: {
    backgroundColor: '#16161E', borderRadius: 16, padding: 16,
    marginBottom: 16, borderWidth: 1, borderColor: '#2A2A3A', gap: 12,
  },
  sectionTitle: { color: '#FAFAFA', fontSize: 15, fontWeight: '800', marginBottom: 4 },
  field: { gap: 5 },
  fieldLabel: { color: '#7070A0', fontSize: 12, fontWeight: '600' },
  input: {
    backgroundColor: '#0A0A0F', borderRadius: 10,
    borderWidth: 1, borderColor: '#2A2A3A',
    color: '#FAFAFA', fontSize: 15, padding: 11,
  },
  textarea: { height: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row' },
  rowGap: { width: 10 },
  stepper: { flexDirection: 'row', gap: 6 },
  stepBtn: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
    backgroundColor: '#0A0A0F', borderWidth: 1, borderColor: '#2A2A3A',
  },
  stepBtnActive: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  stepText: { color: '#7070A0', fontWeight: '700' },
  stepTextActive: { color: '#FFF' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  switchLabel: { color: '#FAFAFA', fontSize: 15 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenityBtn: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    backgroundColor: '#0A0A0F', borderWidth: 1, borderColor: '#2A2A3A',
  },
  amenityBtnActive: { backgroundColor: 'rgba(255,107,53,0.15)', borderColor: '#FF6B35' },
  amenityText: { color: '#7070A0', fontSize: 13 },
  amenityTextActive: { color: '#FF6B35' },
  submitBtn: {
    backgroundColor: '#FF6B35', borderRadius: 14, padding: 18,
    alignItems: 'center', marginTop: 8,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: '#FFF', fontWeight: '900', fontSize: 17 },
});
