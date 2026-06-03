import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { MockRestaurants, Restaurant } from '@/src/api/mocks/data';
import { useAppStore } from '@/src/store';
import { Colors, Spacing, Typography } from '@/src/theme';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function FavoritesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Zustand Store
  const { favorites, toggleFavorite } = useAppStore();

  // Filter mock restaurants by favorites array
  const favoriteRestaurants = MockRestaurants.filter((r) =>
    favorites.includes(r.id)
  );

  const renderRestaurantCard = ({ item }: { item: Restaurant }) => {
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
        <TouchableOpacity
          style={[styles.favoriteBtn, { backgroundColor: 'rgba(255, 255, 255, 0.9)' }]}
          onPress={() => toggleFavorite(item.id)}
          activeOpacity={0.8}
        >
          <Ionicons name="heart" size={22} color={colors.primary} />
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
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={64} color={colors.textMuted} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No Favorites Yet</Text>
      <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
        Tap the heart icon on any restaurant to save it here.
      </Text>
      <TouchableOpacity
        style={[styles.exploreBtn, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/')}
      >
        <Text style={styles.exploreBtnText}>Find Restaurants</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Favorites</Text>
      </View>

      <FlatList
        data={favoriteRestaurants}
        renderItem={renderRestaurantCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '800',
  },
  listContainer: {
    padding: Spacing.md,
    paddingBottom: 40,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 120,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
    marginTop: 16,
  },
  emptySub: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    marginTop: 8,
  },
  exploreBtn: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: Typography.fontSize.sm,
  },
});
