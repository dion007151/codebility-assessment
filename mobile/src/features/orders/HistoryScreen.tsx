import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useAppStore, Order, OrderStatus } from '../../store';
import { Colors, Spacing, Typography } from '../../theme';
import { useColorScheme } from '@/hooks/useColorScheme';

export const HistoryScreen: React.FC = () => {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Zustand Store
  const { orders } = useAppStore();

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'placed':
        return colors.warning;
      case 'preparing':
        return colors.primary;
      case 'out_for_delivery':
        return colors.info;
      case 'delivered':
        return colors.success;
      case 'cancelled':
        return colors.error;
      default:
        return colors.textMuted;
    }
  };

  const formatStatus = (status: OrderStatus) => {
    return status.replace(/_/g, ' ').toUpperCase();
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const statusColor = getStatusColor(item.status);
    const dateStr = new Date(item.createdAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const isOngoing = item.status !== 'delivered' && item.status !== 'cancelled';

    return (
      <View
        style={[
          styles.orderCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.restaurantName, { color: colors.text }]}>
              {item.restaurantName}
            </Text>
            <Text style={[styles.orderDate, { color: colors.textMuted }]}>{dateStr}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {formatStatus(item.status)}
            </Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Text style={[styles.itemsSummary, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.items
            .map((i) => `${i.quantity}x ${i.menuItem.name}`)
            .join(', ')}
        </Text>

        <View style={styles.cardFooter}>
          <Text style={[styles.totalAmount, { color: colors.text }]}>
            Total Paid: <Text style={{ color: colors.primary }}>${item.total.toFixed(2)}</Text>
          </Text>

          {isOngoing ? (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push(`/order-tracking/${item.id}`)}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnText}>Track</Text>
              <Ionicons name="navigate-outline" size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionBtn, { borderColor: colors.primary, borderWidth: 1 }]}
              onPress={() => router.push(`/restaurant/${item.restaurantId}`)}
              activeOpacity={0.8}
            >
              <Text style={[styles.actionBtnText, { color: colors.primary }]}>Reorder</Text>
              <Ionicons name="refresh-outline" size={14} color={colors.primary} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Your Orders</Text>
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Orders Yet</Text>
          <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
            You haven't placed any food orders yet.
          </Text>
          <TouchableOpacity
            style={[styles.exploreBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/')}
          >
            <Text style={styles.exploreBtnText}>Find Food</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
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
  orderCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  restaurantName: {
    fontSize: Typography.fontSize.md,
    fontWeight: '700',
  },
  orderDate: {
    fontSize: Typography.fontSize.xs,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: Spacing.sm,
  },
  itemsSummary: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
    marginVertical: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  totalAmount: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '500',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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

export default HistoryScreen;
