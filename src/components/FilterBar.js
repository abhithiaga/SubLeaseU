import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function FilterBar({ filters, onChange, mode = 'leaser' }) {
  const bedroomOptions = [null, 1, 2, 3, 4];
  const priceOptions = mode === 'leaser'
    ? [null, 800, 1000, 1200, 1500, 2000]
    : [null, 800, 1000, 1200, 1500];

  const toggle = (key, value) => {
    onChange({ ...filters, [key]: filters[key] === value ? null : value });
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>

        {/* Bedrooms */}
        {bedroomOptions.map(b => (
          <TouchableOpacity
            key={`bed-${b}`}
            style={[styles.chip, filters.bedrooms === b && styles.chipActive]}
            onPress={() => toggle('bedrooms', b)}
          >
            <Text style={[styles.chipText, filters.bedrooms === b && styles.chipTextActive]}>
              {b === null ? 'Any beds' : `${b} bed`}
            </Text>
          </TouchableOpacity>
        ))}

        <View style={styles.divider} />

        {/* Price */}
        {priceOptions.map(p => (
          <TouchableOpacity
            key={`price-${p}`}
            style={[styles.chip, filters.maxRent === p && styles.chipActive]}
            onPress={() => toggle('maxRent', p)}
          >
            <Text style={[styles.chipText, filters.maxRent === p && styles.chipTextActive]}>
              {p === null ? 'Any price' : `≤$${p.toLocaleString()}`}
            </Text>
          </TouchableOpacity>
        ))}

        <View style={styles.divider} />

        {/* Urgent only */}
        <TouchableOpacity
          style={[styles.chip, filters.urgent && styles.chipUrgent]}
          onPress={() => toggle('urgent', !filters.urgent)}
        >
          <Text style={[styles.chipText, filters.urgent && styles.chipTextUrgent]}>
            ⚡ Urgent
          </Text>
        </TouchableOpacity>

        {/* Furnished */}
        <TouchableOpacity
          style={[styles.chip, filters.furnished && styles.chipActive]}
          onPress={() => toggle('furnished', !filters.furnished)}
        >
          <Text style={[styles.chipText, filters.furnished && styles.chipTextActive]}>
            🛋 Furnished
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 4 },
  row: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#16161E',
    borderWidth: 1, borderColor: '#2A2A3A',
  },
  chipActive: { backgroundColor: 'rgba(255,107,53,0.15)', borderColor: '#FF6B35' },
  chipUrgent: { backgroundColor: 'rgba(255,59,48,0.15)', borderColor: '#FF3B30' },
  chipText: { color: '#7070A0', fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: '#FF6B35' },
  chipTextUrgent: { color: '#FF3B30' },
  divider: {
    width: 1, backgroundColor: '#2A2A3A', marginHorizontal: 4,
    alignSelf: 'stretch',
  },
});
