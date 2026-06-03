import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { ApiClient } from '../../api/client';
import { Restaurant, Cuisines } from '../../api/mocks/data';
import { useAppStore } from '../../store';
import { Colors, Spacing, Typography } from '../../theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import Skeleton from '../../components/common/Skeleton';

export const DiscoveryScreen: React.FC = () => {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Zustand Store
  const { toggleFavorite, isFavorite } = useAppStore();

  // State variables
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');

  // Debounced search state
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search input handler
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Load restaurants from Mock API
  const loadRestaurants = useCallback(async (cuisine: string, query: string, showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const data = await ApiClient.getRestaurants({ cuisine, query });
      setRestaurants(data);
    } catch (error) {
      console.error('Failed to load restaurants:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch data on query/cuisine change
  useEffect(() => {
    loadRestaurants(selectedCuisine, debouncedQuery);
  }, [selectedCuisine, debouncedQuery, loadRestaurants]);

  // Refresh handler
  const onRefresh = () => {
    setRefreshing(true);
    loadRestaurants(selectedCuisine, debouncedQuery, false);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={[styles.locationLabel, { color: colors.textSecondary }]}>DELIVER TO</Text>
        <TouchableOpacity style={styles.locationSelector} activeOpacity={0.7}>
          <Ionicons name="location" size={18} color={colors.primary} />
          <Text style={[styles.locationText, { color: colors.text }]} numberOfLines={1}>
            123 Main Street, San Francisco
          </Text>
          <Ionicons name="chevron-down" size={14} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={[styles.cartBadgeBtn, { backgroundColor: colors.surfaceVariant }]}
        onPress={() => router.push('/cart')}
        activeOpacity={0.8}
      >
        <Ionicons name="cart-outline" size={24} color={colors.text} />
      </TouchableOpacity>
    </View>
  );

  const renderSearchBar = () => (
    <View style={[styles.searchContainer, { backgroundColor: colors.surfaceVariant }]}>
      <Ionicons name="search-outline" size={20} color={colors.textSecondary} style={styles.searchIcon} />
      <TextInput
        style={[styles.searchInput, { color: colors.text }]}
        placeholder="Search dishes, restaurants or cuisines..."
        placeholderTextColor={colors.textMuted}
        value={searchQuery}
        onChangeText={setSearchQuery}
        clearButtonMode="while-editing"
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={() => setSearchQuery('')}>
          <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderCuisineFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.cuisineList}
    >
      {Cuisines.map((cuisine) => {
        const isSelected = selectedCuisine === cuisine;
        return (
          <TouchableOpacity
            key={cuisine}
            style={[
              styles.cuisinePill,
              {
                backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
              },
            ]}
            onPress={() => setSelectedCuisine(cuisine)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.cuisineText,
                {
                  color: isSelected ? '#FFFFFF' : colors.textSecondary,
                  fontWeight: isSelected ? '600' : '400',
                },
              ]}
            >
              {cuisine}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const renderSkeletonLoader = () => (
    <View style={styles.listContainer}>
      {[1, 2, 3].map((key) => (
        <View key={key} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Skeleton width="100%" height={180} borderRadius={16} />
          <View style={styles.cardInfo}>
            <View style={styles.cardHeaderRow}>
              <Skeleton width={150} height={20} borderRadius={4} />
              <Skeleton width={50} height={20} borderRadius={4} />
            </View>
            <View style={{ marginVertical: 8 }}>
              <Skeleton width={100} height={14} borderRadius={4} />
            </View>
            <View style={styles.cardMetrics}>
              <Skeleton width={60} height={16} borderRadius={4} />
              <Skeleton width={60} height={16} borderRadius={4} />
              <Skeleton width={60} height={16} borderRadius={4} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderRestaurantCard = ({ item }: { item: Restaurant }) => {
    const isFav = isFavorite(item.id);
    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
        ]}
        onPress={() => router.push(`/restaurant/${item.id}`)}
        activeOpacity={0.95}
      >
        <Image source={{ uri: item.coverImage }} style={styles.cardImage} />
        {item.featured && (
          <View style={[styles.featuredBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.featuredText}>PROMO</Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.favoriteBtn, { backgroundColor: 'rgba(255, 255, 255, 0.9)' }]}
          onPress={() => toggleFavorite(item.id)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isFav ? 'heart' : 'heart-outline'}
            size={22}
            color={isFav ? colors.primary : '#888888'}
          />
        </TouchableOpacity>

        <View style={styles.cardInfo}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.restaurantName, { color: colors.text }]} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color={colors.secondary} />
              <Text style={[styles.ratingText, { color: colors.text }]}>
                {item.rating.toFixed(1)}
              </Text>
            </View>
          </View>

          <Text style={[styles.cuisineType, { color: colors.textSecondary }]}>
            {item.cuisine} • {item.ratingCount}+ reviews
          </Text>

          <View style={styles.cardMetrics}>
            <View style={styles.metricItem}>
              <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.metricText, { color: colors.textSecondary }]}>
                {item.deliveryTime} mins
              </Text>
            </View>
            <View style={styles.metricSeparator} />
            <View style={styles.metricItem}>
              <Ionicons name="bicycle-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.metricText, { color: colors.textSecondary }]}>
                {item.deliveryFee === 0 ? 'Free' : `$${item.deliveryFee.toFixed(2)}`}
              </Text>
            </View>
            <View style={styles.metricSeparator} />
            <View style={styles.metricItem}>
              <Ionicons name="navigate-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.metricText, { color: colors.textSecondary }]}>
                {item.distance} km
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search-outline" size={64} color={colors.textMuted} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No Restaurants Found</Text>
      <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
        Try tweaking your filters or search keywords.
      </Text>
      <TouchableOpacity
        style={[styles.resetBtn, { backgroundColor: colors.primary }]}
        onPress={() => {
          setSearchQuery('');
          setSelectedCuisine('All');
        }}
      >
        <Text style={styles.resetBtnText}>Clear Filters</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}
      {renderSearchBar()}
      {renderCuisineFilter()}

      {loading ? (
        renderSkeletonLoader()
      ) : (
        <FlatList
          data={restaurants}
          renderItem={renderRestaurantCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  locationLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    maxWidth: 240,
  },
  locationText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    marginHorizontal: 4,
  },
  cartBadgeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    height: 48,
    borderRadius: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
  },
  cuisineList: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    maxHeight: 52,
  },
  cuisinePill: {
    paddingHorizontal: Spacing.md,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  cuisineText: {
    fontSize: Typography.fontSize.sm,
  },
  listContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  featuredText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  favoriteBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  cardInfo: {
    padding: Spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  restaurantName: {
    fontSize: Typography.fontSize.md,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    marginLeft: 4,
  },
  cuisineType: {
    fontSize: Typography.fontSize.xs,
    marginTop: 4,
  },
  cardMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricText: {
    fontSize: Typography.fontSize.xs,
    marginLeft: 4,
    fontWeight: '500',
  },
  metricSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CCCCCC',
    marginHorizontal: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
    marginTop: 16,
  },
  emptySub: {
    fontSize: Typography.fontSize.sm,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  resetBtn: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  resetBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: Typography.fontSize.sm,
  },
});

export default DiscoveryScreen;
