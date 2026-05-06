import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { supabase, isEduEmail, schoolFromEmail } from '../lib/supabase';

export default function AuthScreen() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const school = schoolFromEmail(email);
  const validEdu = isEduEmail(email);

  const handleSignup = async () => {
    if (!validEdu) {
      Alert.alert('Student emails only', 'Please use your .edu university email to sign up.');
      return;
    }
    if (!fullName.trim()) {
      Alert.alert('Name required', 'Please enter your full name.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) throw error;

      // Update profile with name
      if (data.user) {
        await supabase.from('profiles').update({ full_name: fullName }).eq('id', data.user.id);
      }

      Alert.alert(
        '📬 Check your email',
        `We sent a confirmation link to ${email}. Click it to activate your account.`,
        [{ text: 'OK', onPress: () => setMode('login') }]
      );
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });
      if (error) throw error;
      // Navigation handled by AppNavigator listening to auth state
    } catch (e) {
      Alert.alert('Login failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Logo */}
        <View style={styles.logoArea}>
          <Text style={styles.logoEmoji}>🏠</Text>
          <Text style={styles.logoText}>SubleaseU</Text>
          <Text style={styles.tagline}>Student sublease marketplace</Text>
        </View>

        {/* Tab toggle */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, mode === 'login' && styles.tabActive]}
            onPress={() => setMode('login')}
          >
            <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>Log in</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, mode === 'signup' && styles.tabActive]}
            onPress={() => setMode('signup')}
          >
            <Text style={[styles.tabText, mode === 'signup' && styles.tabTextActive]}>Sign up</Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {mode === 'signup' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full name</Text>
              <TextInput
                style={styles.input}
                placeholder="Jane Smith"
                placeholderTextColor="#404060"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>University email</Text>
            <TextInput
              style={[styles.input, email && !validEdu && styles.inputError]}
              placeholder="you@utexas.edu"
              placeholderTextColor="#404060"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {email && validEdu && (
              <Text style={styles.schoolDetected}>✓ Detected: {school}</Text>
            )}
            {email && !validEdu && (
              <Text style={styles.emailWarning}>⚠ Must be a .edu email</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Min. 6 characters"
              placeholderTextColor="#404060"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={mode === 'signup' ? handleSignup : handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitText}>
                {mode === 'signup' ? 'Create account →' : 'Log in →'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.disclaimer}>
          Student-only platform. Only .edu emails accepted.{'\n'}
          Your school is automatically detected from your email.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logoArea: { alignItems: 'center', marginBottom: 40 },
  logoEmoji: { fontSize: 56, marginBottom: 8 },
  logoText: { color: '#FAFAFA', fontSize: 36, fontWeight: '900', letterSpacing: -1 },
  tagline: { color: '#5050A0', fontSize: 15, marginTop: 4 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#16161E',
    borderRadius: 14, padding: 4,
    marginBottom: 28, borderWidth: 1, borderColor: '#2A2A3A',
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: '#FF6B35' },
  tabText: { color: '#5050A0', fontWeight: '700', fontSize: 15 },
  tabTextActive: { color: '#FFF' },
  form: { gap: 16 },
  inputGroup: { gap: 6 },
  label: { color: '#7070A0', fontSize: 13, fontWeight: '600', marginLeft: 2 },
  input: {
    backgroundColor: '#16161E', borderRadius: 12,
    borderWidth: 1, borderColor: '#2A2A3A',
    color: '#FAFAFA', fontSize: 16, padding: 14,
  },
  inputError: { borderColor: '#FF3B30' },
  schoolDetected: { color: '#34C759', fontSize: 12, marginLeft: 4 },
  emailWarning: { color: '#FF6B35', fontSize: 12, marginLeft: 4 },
  submitBtn: {
    backgroundColor: '#FF6B35',
    borderRadius: 14, padding: 16,
    alignItems: 'center', marginTop: 8,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: '#FFF', fontWeight: '800', fontSize: 17 },
  disclaimer: {
    color: '#303060', fontSize: 12, textAlign: 'center',
    marginTop: 28, lineHeight: 18,
  },
});
