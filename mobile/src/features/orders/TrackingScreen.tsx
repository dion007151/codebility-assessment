import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppStore, OrderStatus } from '../../store';
import { Colors, Spacing, Typography } from '../../theme';
import { useColorScheme } from '@/hooks/useColorScheme';

export const TrackingScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Zustand Store
  const { orders, cancelOrder } = useAppStore();

  const order = orders.find((o) => o.id === id);

  // Status index for step tracking
  const getStatusStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'placed':
        return 0;
      case 'preparing':
        return 1;
      case 'out_for_delivery':
        return 2;
      case 'delivered':
        return 3;
      default:
        return -1;
    }
  };

  const currentStep = order ? getStatusStepIndex(order.status) : -1;

  const stepsList = [
    { label: 'Order Placed', desc: 'We have received your order.', icon: 'receipt-outline' },
    { label: 'Preparing Food', desc: 'The kitchen is preparing your meal.', icon: 'restaurant-outline' },
    { label: 'Out for Delivery', desc: 'Our courier is carrying your order.', icon: 'bicycle-outline' },
    { label: 'Delivered', desc: 'Enjoy your food!', icon: 'checkmark-circle-outline' },
  ];

  if (!order) {
    return (
      <SafeAreaView style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Order not found.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/')}>
          <Text style={{ color: colors.primary }}>Go to Home</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isCancellable = order.status === 'placed' || order.status === 'preparing';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/(tabs)/orders')}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Track Order</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={[styles.statusCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.orderNumberText, { color: colors.textMuted }]}>
            ORDER ID: {order.id}
          </Text>
          <Text style={[styles.restName, { color: colors.text }]}>{order.restaurantName}</Text>

          {order.status === 'cancelled' ? (
            <View style={styles.cancelledContainer}>
              <Ionicons name="close-circle" size={48} color={colors.error} />
              <Text style={[styles.cancelledTitle, { color: colors.error }]}>Order Cancelled</Text>
              <Text style={[styles.cancelledDesc, { color: colors.textSecondary }]}>
                This order was cancelled and a refund has been initiated.
              </Text>
            </View>
          ) : (
            <View style={styles.deliveryProgress}>
              <View style={styles.etaRow}>
                <Ionicons name="time" size={20} color={colors.primary} />
                <View style={{ marginLeft: 8 }}>
                  <Text style={[styles.etaLabel, { color: colors.textSecondary }]}>Estimated Delivery</Text>
                  <Text style={[styles.etaVal, { color: colors.text }]}>
                    {order.status === 'delivered' ? 'Delivered' : `${order.eta} mins`}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Steps List */}
        {order.status !== 'cancelled' && (
          <View style={[styles.stepsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {stepsList.map((step, idx) => {
              const isActive = idx <= currentStep;
              const isLatest = idx === currentStep;

              return (
                <View key={step.label} style={styles.stepRow}>
                  {/* Left Column: Line & Circle */}
                  <View style={styles.stepTimelineCol}>
                    <View
                      style={[
                        styles.stepCircle,
                        {
                          backgroundColor: isLatest
                            ? colors.primary
                            : isActive
                            ? colors.success
                            : colors.border,
                        },
                      ]}
                    >
                      <Ionicons
                        name={step.icon as any}
                        size={16}
                        color={isActive ? '#FFFFFF' : colors.textSecondary}
                      />
                    </View>
                    {idx < stepsList.length - 1 && (
                      <View
                        style={[
                          styles.verticalLine,
                          {
                            backgroundColor: idx < currentStep ? colors.success : colors.border,
                          },
                        ]}
                      />
                    )}
                  </View>

                  {/* Right Column: Descriptions */}
                  <View style={styles.stepInfoCol}>
                    <Text
                      style={[
                        styles.stepLabelText,
                        {
                          color: isLatest
                            ? colors.primary
                            : isActive
                            ? colors.text
                            : colors.textMuted,
                          fontWeight: isActive ? '700' : '400',
                        },
                      ]}
                    >
                      {step.label}
                    </Text>
                    <Text
                      style={[
                        styles.stepDescText,
                        {
                          color: isActive ? colors.textSecondary : colors.textMuted,
                        },
                      ]}
                    >
                      {step.desc}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Deliver Details */}
        <View style={[styles.detailsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Delivery Address</Text>
          <View style={styles.addressInfo}>
            <Ionicons name="location-outline" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
            <Text style={[styles.addressText, { color: colors.textSecondary }]}>
              {order.address}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 8 }]}>Order Summary</Text>
          {order.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={[styles.itemLabel, { color: colors.text }]}>
                {item.quantity}x {item.menuItem.name}
              </Text>
              <Text style={[styles.itemPrice, { color: colors.textSecondary }]}>
                ${(item.totalPrice * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.priceSummaryRow}>
            <Text style={[styles.priceSummaryLabel, { color: colors.text }]}>Total Paid</Text>
            <Text style={[styles.priceSummaryVal, { color: colors.primary }]}>
              ${order.total.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Cancellation Button */}
        {isCancellable && (
          <TouchableOpacity
            style={[styles.cancelBtn, { borderColor: colors.error }]}
            onPress={() => cancelOrder(order.id)}
            activeOpacity={0.8}
          >
            <Text style={[styles.cancelBtnText, { color: colors.error }]}>Cancel Order</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
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
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: '700',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  statusCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  orderNumberText: {
    fontSize: 10,
    fontWeight: '700',
  },
  restName: {
    fontSize: Typography.fontSize.md,
    fontWeight: '700',
    marginTop: 4,
  },
  cancelledContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  cancelledTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: '700',
    marginTop: 8,
  },
  cancelledDesc: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    marginTop: 4,
  },
  deliveryProgress: {
    marginTop: Spacing.md,
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  etaLabel: {
    fontSize: Typography.fontSize.xs,
  },
  etaVal: {
    fontSize: Typography.fontSize.md,
    fontWeight: '800',
    marginTop: 2,
  },
  stepsCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  stepRow: {
    flexDirection: 'row',
    minHeight: 60,
  },
  stepTimelineCol: {
    alignItems: 'center',
    marginRight: 16,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verticalLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  stepInfoCol: {
    flex: 1,
    paddingBottom: Spacing.sm,
    justifyContent: 'center',
  },
  stepLabelText: {
    fontSize: Typography.fontSize.sm,
  },
  stepDescText: {
    fontSize: 11,
    marginTop: 2,
  },
  detailsCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
  },
  addressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  addressText: {
    fontSize: Typography.fontSize.xs,
    flex: 1,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  itemLabel: {
    fontSize: Typography.fontSize.sm,
    flex: 1,
    marginRight: 8,
  },
  itemPrice: {
    fontSize: Typography.fontSize.sm,
  },
  priceSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceSummaryLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
  },
  priceSummaryVal: {
    fontSize: Typography.fontSize.md,
    fontWeight: '800',
  },
  cancelBtn: {
    borderWidth: 1,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  cancelBtnText: {
    fontWeight: '700',
    fontSize: Typography.fontSize.sm,
  },
});

export default TrackingScreen;
