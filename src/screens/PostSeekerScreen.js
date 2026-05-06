import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Alert,
  ActivityIndicator, SafeAreaView, Switch
} from 'react-native';
import { useSeekers } from '../hooks/useSeekers';

export default function PostSeekerScreen({ navigation }) {
  const { createSeeker } = useSeekers();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    budget_max: '',
    bedrooms_needed: '1',
    move_in_date: '',
    move_out_date: '',
    furnished_required: false,
    notes: '',
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const validate = () => {
    if (!form.budget_max || isNaN(+form.budget_max)) return 'Enter your max budget';
    if (!form.move_in_date) return 'Enter your move-in date (YYYY-MM-DD)';
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { Alert.alert('Missing info', err); return; }

    setLoading(true);
    try {
      await createSeeker({
        budget_max: parseInt(form.budget_max),
        bedrooms_needed: parseInt(form.bedrooms_needed),
        move_in_date: form.move_in_date,
        move_out_date: form.move_out_date || null,
        furnished_required: form.furnished_required,
        notes: form.notes.trim(),
      });
      Alert.alert(
        '✅ Posted!',
        'Leasers can now see what you need. You\'ll be notified when a match is found.',
        [{ text: 'See marketplace', onPress: () => navigation.goBack() }]
      );
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

          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.screenTitle}>What Are You Looking For?</Text>
            <Text style={styles.screenSubtitle}>Post your needs — leasers will reach out</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionLabel}>💰 Budget</Text>
            <TextInput
              style={styles.input}
              value={form.budget_max}
              onChangeText={v => set('budget_max', v)}
              placeholder="Max monthly rent, e.g. 1200"
              placeholderTextColor="#404060"
              keyboardType="numeric"
            />
            <Text style={styles.hint}>This is your maximum — you'll see all listings at or below this price</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionLabel}>🛏 Bedrooms Needed</Text>
            <View style={styles.stepper}>
              {['1', '2', '3', '4'].map(n => (
                <TouchableOpacity
                  key={n}
                  style={[styles.stepBtn, form.bedrooms_needed === n && styles.stepBtnActive]}
                  onPress={() => set('bedrooms_needed', n)}
                >
                  <Text style={[styles.stepText, form.bedrooms_needed === n && styles.stepTextActive]}>
                    {n} bed
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionLabel}>📅 Move-in Window</Text>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Move in (YYYY-MM-DD) *</Text>
                <TextInput
                  style={styles.input}
                  value={form.move_in_date}
                  onChangeText={v => set('move_in_date', v)}
                  placeholder="2025-08-15"
                  placeholderTextColor="#404060"
                />
              </View>
              <View style={{ width: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Move out (optional)</Text>
                <TextInput
                  style={styles.input}
                  value={form.move_out_date}
                  onChangeText={v => set('move_out_date', v)}
                  placeholder="2026-05-31"
                  placeholderTextColor="#404060"
                />
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionLabel}>✨ Preferences</Text>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Needs to be furnished</Text>
              <Switch
                value={form.furnished_required}
                onValueChange={v => set('furnished_required', v)}
                trackColor={{ true: '#00D4AA' }}
              />
            </View>
            <Text style={styles.fieldLabel}>Additional notes</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={form.notes}
              onChangeText={v => set('notes', v)}
              placeholder="Need pet-friendly, prefer close to engineering quad, flexible on move-in by 1-2 weeks..."
              placeholderTextColor="#404060"
              multiline numberOfLines={4}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#FFF" />
              : <Text style={styles.submitText}>🔍 Post My Search</Text>
            }
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  scroll: { padding: 16, paddingBottom: 48 },
  header: { marginBottom: 20 },
  backText: { color: '#00D4AA', fontSize: 15, fontWeight: '600', marginBottom: 10 },
  screenTitle: { color: '#FAFAFA', fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  screenSubtitle: { color: '#5050A0', fontSize: 14, marginTop: 4 },
  card: {
    backgroundColor: '#16161E', borderRadius: 16, padding: 16,
    marginBottom: 14, borderWidth: 1, borderColor: '#2A2A3A', gap: 10,
  },
  sectionLabel: { color: '#FAFAFA', fontSize: 15, fontWeight: '800' },
  input: {
    backgroundColor: '#0A0A0F', borderRadius: 10,
    borderWidth: 1, borderColor: '#2A2A3A',
    color: '#FAFAFA', fontSize: 15, padding: 11,
  },
  textarea: { height: 90, textAlignVertical: 'top' },
  hint: { color: '#404060', fontSize: 12 },
  stepper: { flexDirection: 'row', gap: 8 },
  stepBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: '#0A0A0F', borderWidth: 1, borderColor: '#2A2A3A',
    alignItems: 'center',
  },
  stepBtnActive: { backgroundColor: '#00D4AA', borderColor: '#00D4AA' },
  stepText: { color: '#7070A0', fontWeight: '700', fontSize: 13 },
  stepTextActive: { color: '#0A0A0F' },
  row: { flexDirection: 'row' },
  fieldLabel: { color: '#7070A0', fontSize: 12, fontWeight: '600', marginBottom: 4 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  switchLabel: { color: '#FAFAFA', fontSize: 15 },
  submitBtn: {
    backgroundColor: '#00D4AA', borderRadius: 14, padding: 18,
    alignItems: 'center', marginTop: 8,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: '#0A0A0F', fontWeight: '900', fontSize: 17 },
});
