import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, RefreshControl, ActivityIndicator, SafeAreaView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import LeaserCard from '../components/LeaserCard';
import LeaseeCard from '../components/LeaseeCard';
import FilterBar from '../components/FilterBar';
import { useListings } from '../hooks/useListings';
import { useSeekers } from '../hooks/useSeekers';

export default function MarketplaceScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('leasers'); // 'leasers' | 'leasees'
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ bedrooms: null, maxRent: null, urgent: false });

  const { listings, loading: listingsLoading, refetch: refetchListings } = useListings({
    bedrooms: filters.bedrooms,
    maxRent: filters.maxRent,
    urgent: filters.urgent || undefined,
  });

  const { seekers, loading: seekersLoading, refetch: refetchSeekers } = useSeekers({
    bedrooms: filters.bedrooms,
  });

  const loading = activeTab === 'leasers' ? listingsLoading : seekersLoading;
  const refetch = activeTab === 'leasers' ? refetchListings : refetchSeekers;

  // Search filter
  const filteredListings = listings.filter(l =>
    !searchQuery ||
    l.building_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSeekers = seekers.filter(s =>
    !searchQuery ||
    s.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLeaserPress = (listing) => {
    navigation.navigate('ListingDetail', { listing });
  };

  const handleLeaseeMessage = (seeker) => {
    navigation.navigate('Messages', {
      listingId: null,
      otherUserId: seeker.user_id,
      otherName: seeker.profiles?.full_name,
      context: `Hi! I saw you're looking for a ${seeker.bedrooms_needed}bd near campus.`,
    });
  };

  const renderLeaser = ({ item }) => (
    <LeaserCard
      listing={item}
      onPress={() => handleLeaserPress(item)}
    />
  );

  const renderLeasee = ({ item }) => (
    <LeaseeCard
      seeker={item}
      onPress={() => {}}
      onMessage={() => handleLeaseeMessage(item)}
    />
  );

  const matchCount = filteredListings.filter(l =>
    !filters.maxRent || l.monthly_rent <= filters.maxRent
  ).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>SubleaseU</Text>
          <Text style={styles.headerSub}>Student sublease marketplace</Text>
        </View>
        <TouchableOpacity
          style={styles.postBtn}
          onPress={() => navigation.navigate(activeTab === 'leasers' ? 'PostListing' : 'PostSeeker')}
        >
          <Text style={styles.postBtnText}>+ Post</Text>
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={activeTab === 'leasers' ? 'Search buildings...' : 'Search seekers...'}
            placeholderTextColor="#404060"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'leasers' && styles.tabBtnActive]}
          onPress={() => setActiveTab('leasers')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'leasers' && styles.tabBtnTextActive]}>
            🏠 Leasers
          </Text>
          <View style={[styles.tabCount, activeTab === 'leasers' && styles.tabCountActive]}>
            <Text style={styles.tabCountText}>{filteredListings.length}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'leasees' && styles.tabBtnActive]}
          onPress={() => setActiveTab('leasees')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'leasees' && styles.tabBtnTextActive]}>
            🔍 Seekers
          </Text>
          <View style={[styles.tabCount, activeTab === 'leasees' && styles.tabCountActive]}>
            <Text style={styles.tabCountText}>{filteredSeekers.length}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <FilterBar filters={filters} onChange={setFilters} mode={activeTab} />

      {/* List */}
      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator color="#FF6B35" size="large" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : activeTab === 'leasers' ? (
        <FlatList
          data={filteredListings}
          keyExtractor={item => item.id}
          renderItem={renderLeaser}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor="#FF6B35" />}
          ListEmptyComponent={<EmptyState mode="leasers" onPost={() => navigation.navigate('PostListing')} />}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={filteredSeekers}
          keyExtractor={item => item.id}
          renderItem={renderLeasee}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor="#00D4AA" />}
          ListEmptyComponent={<EmptyState mode="leasees" onPost={() => navigation.navigate('PostSeeker')} />}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Match counter footer */}
      {!loading && filteredListings.length > 0 && filteredSeekers.length > 0 && (
        <View style={styles.matchBar}>
          <Text style={styles.matchText}>
            🤝 {Math.min(filteredListings.length, filteredSeekers.length)} potential matches in view
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

function EmptyState({ mode, onPost }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>{mode === 'leasers' ? '🏠' : '🔍'}</Text>
      <Text style={styles.emptyTitle}>
        {mode === 'leasers' ? 'No listings yet' : 'No seekers yet'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {mode === 'leasers'
          ? 'Be the first to post your sublease'
          : 'Post what you need and leasers will find you'}
      </Text>
      <TouchableOpacity style={styles.emptyBtn} onPress={onPost}>
        <Text style={styles.emptyBtnText}>+ Post {mode === 'leasers' ? 'a listing' : 'your search'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
  },
  headerTitle: { color: '#FAFAFA', fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  headerSub: { color: '#3030A0', fontSize: 12 },
  postBtn: {
    backgroundColor: '#FF6B35', paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20,
  },
  postBtnText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  searchRow: { paddingHorizontal: 16, marginBottom: 8 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#16161E', borderRadius: 12,
    borderWidth: 1, borderColor: '#2A2A3A',
    paddingHorizontal: 12, paddingVertical: 10,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, color: '#FAFAFA', fontSize: 15 },
  clearBtn: { color: '#5050A0', fontSize: 16, paddingLeft: 8 },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16, marginBottom: 4, gap: 8,
  },
  tabBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, borderRadius: 12, gap: 6,
    backgroundColor: '#16161E', borderWidth: 1, borderColor: '#2A2A3A',
  },
  tabBtnActive: { backgroundColor: 'rgba(255,107,53,0.12)', borderColor: '#FF6B35' },
  tabBtnText: { color: '#5050A0', fontWeight: '700', fontSize: 14 },
  tabBtnTextActive: { color: '#FF6B35' },
  tabCount: {
    backgroundColor: '#2A2A3A', borderRadius: 10,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  tabCountActive: { backgroundColor: 'rgba(255,107,53,0.2)' },
  tabCountText: { color: '#FAFAFA', fontSize: 11, fontWeight: '800' },
  listContent: { paddingHorizontal: 16, paddingBottom: 80, paddingTop: 4 },
  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: '#5050A0' },
  matchBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,212,170,0.1)', paddingVertical: 10,
    alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(0,212,170,0.2)',
  },
  matchText: { color: '#00D4AA', fontWeight: '700', fontSize: 13 },
  emptyState: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { color: '#FAFAFA', fontSize: 20, fontWeight: '800', marginBottom: 8 },
  emptySubtitle: { color: '#5050A0', fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  emptyBtn: {
    backgroundColor: '#FF6B35', paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 12,
  },
  emptyBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
});
