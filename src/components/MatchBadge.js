import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MatchBadge({ score }) {
  if (!score || score < 70) return null;

  const label = score >= 100 ? '🎯 Perfect Match' : score >= 85 ? '⭐ Great Match' : '✨ Good Match';
  const color = score >= 100 ? '#FF6B35' : score >= 85 ? '#FFD60A' : '#00D4AA';

  return (
    <View style={[styles.badge, { borderColor: color, backgroundColor: `${color}18` }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1,
    alignSelf: 'flex-start', marginBottom: 8,
  },
  text: { fontSize: 12, fontWeight: '800' },
});
