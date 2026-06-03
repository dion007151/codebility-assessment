import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { ApiClient } from '../../api/client';
import { AddressPresets } from '../../api/mocks/data';
import { useAppStore, startOrderStatusSimulation } from '../../store';
import { Colors, Spacing, Typography } from '../../theme';
import { useColorScheme } from '@/hooks/useColorScheme';

export const CheckoutScreen: React.FC = () => {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Zustand Store
  const { cart, cartRestaurant, clearCart, addOrder } = useAppStore();

  // Component State
  const [step, setStep] = useState(1); // Steps: 1 = Address, 2 = Payment, 3 = Review
  const [addresses, setAddresses] = useState(AddressPresets);
  const [selectedAddressId, setSelectedAddressId] = useState(AddressPresets[0].id);
  const [selectedPayment, setSelectedPayment] = useState('Credit Card');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const data = await ApiClient.getAddressPresets();
        setAddresses(data);
        if (data.length > 0) {
          setSelectedAddressId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load address presets:', err);
      }
    };
    loadAddresses();
  }, []);

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0);
  };

  const subtotal = calculateSubtotal();
  const deliveryFee = cartRestaurant ? 2.99 : 0.0;
  const total = subtotal + deliveryFee;

  const currentAddress = addresses.find((a) => a.id === selectedAddressId)?.address || '';

  const handlePlaceOrder = async () => {
    if (!cartRestaurant) return;
    setIsSubmitting(true);

    try {
      const orderDetails = await ApiClient.createOrder({
        restaurantId: cartRestaurant.id,
        restaurantName: cartRestaurant.name,
        items: cart,
        total: total,
        address: currentAddress,
        paymentMethod: selectedPayment,
      });

      // Submit to store
      addOrder({
        id: orderDetails.id,
        restaurantId: orderDetails.restaurantId,
        restaurantName: orderDetails.restaurantName,
        items: orderDetails.items,
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        total: orderDetails.total,
        address: orderDetails.address,
        paymentMethod: orderDetails.paymentMethod,
        status: 'placed',
        createdAt: orderDetails.createdAt,
        eta: orderDetails.eta,
      });

      // Start background status simulation
      startOrderStatusSimulation(orderDetails.id);

      // Clear checkout cart
      clearCart();

      // Go to tracking
      router.replace(`/order-tracking/${orderDetails.id}`);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Order Placement Failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicatorRow}>
      {['Address', 'Payment', 'Review'].map((label, idx) => {
        const stepNum = idx + 1;
        const isCurrent = step === stepNum;
        const isPassed = step > stepNum;

        return (
          <React.Fragment key={label}>
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepNumberCircle,
                  {
                    backgroundColor: isCurrent
                      ? colors.primary
                      : isPassed
                      ? colors.success
                      : colors.surfaceVariant,
                  },
                ]}
              >
                {isPassed ? (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                ) : (
                  <Text
                    style={[
                      styles.stepNumberText,
                      { color: isCurrent ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    {stepNum}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  {
                    color: isCurrent
                      ? colors.primary
                      : isPassed
                      ? colors.text
                      : colors.textSecondary,
                    fontWeight: isCurrent ? '700' : '400',
                  },
                ]}
              >
                {label}
              </Text>
            </View>
            {idx < 2 && (
              <View
                style={[
                  styles.stepLine,
                  { backgroundColor: step > stepNum ? colors.success : colors.border },
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => (step > 1 ? setStep(step - 1) : router.back())}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      {renderStepIndicator()}

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Step 1: Address Selection */}
        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Delivery Address</Text>
            {addresses.map((addr) => {
              const isSelected = addr.id === selectedAddressId;
              return (
                <TouchableOpacity
                  key={addr.id}
                  style={[
                    styles.addressCard,
                    {
                      borderColor: isSelected ? colors.primary : colors.border,
                      backgroundColor: colors.card,
                    },
                  ]}
                  onPress={() => setSelectedAddressId(addr.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.addressLeft}>
                    <Ionicons
                      name={addr.label === 'Home' ? 'home-outline' : 'business-outline'}
                      size={20}
                      color={isSelected ? colors.primary : colors.textSecondary}
                    />
                    <View style={styles.addressTextCol}>
                      <Text style={[styles.addressLabelText, { color: colors.text }]}>
                        {addr.label}
                      </Text>
                      <Text style={[styles.addressText, { color: colors.textSecondary }]}>
                        {addr.address}
                      </Text>
                    </View>
                  </View>
                  <Ionicons
                    name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={isSelected ? colors.primary : colors.textSecondary}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Step 2: Payment Method */}
        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Payment Method</Text>
            {['Credit Card', 'Apple Pay', 'PayPal', 'Cash on Delivery'].map((method) => {
              const isSelected = method === selectedPayment;
              const getIcon = () => {
                switch (method) {
                  case 'Credit Card':
                    return 'card-outline';
                  case 'Apple Pay':
                    return 'logo-apple';
                  case 'PayPal':
                    return 'logo-paypal';
                  default:
                    return 'cash-outline';
                }
              };
              return (
                <TouchableOpacity
                  key={method}
                  style={[
                    styles.paymentCard,
                    {
                      borderColor: isSelected ? colors.primary : colors.border,
                      backgroundColor: colors.card,
                    },
                  ]}
                  onPress={() => setSelectedPayment(method)}
                  activeOpacity={0.8}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons
                      name={getIcon()}
                      size={24}
                      color={isSelected ? colors.primary : colors.textSecondary}
                      style={{ marginRight: 12 }}
                    />
                    <Text style={[styles.paymentMethodText, { color: colors.text }]}>
                      {method}
                    </Text>
                  </View>
                  <Ionicons
                    name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={isSelected ? colors.primary : colors.textSecondary}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Step 3: Review Order Summary */}
        {step === 3 && (
          <View style={styles.stepContent}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Review Your Order</Text>

            {/* Restaurant Detail Info */}
            <View style={[styles.reviewBlock, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.reviewHeading, { color: colors.text }]}>Restaurant</Text>
              <Text style={[styles.reviewValueText, { color: colors.textSecondary }]}>
                {cartRestaurant?.name}
              </Text>
            </View>

            {/* Address Selection review */}
            <View style={[styles.reviewBlock, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.reviewHeading, { color: colors.text }]}>Deliver To</Text>
              <Text style={[styles.reviewValueText, { color: colors.textSecondary }]}>
                {currentAddress}
              </Text>
            </View>

            {/* Payment Selection review */}
            <View style={[styles.reviewBlock, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.reviewHeading, { color: colors.text }]}>Payment Method</Text>
              <Text style={[styles.reviewValueText, { color: colors.textSecondary }]}>
                {selectedPayment}
              </Text>
            </View>

            {/* Items summary */}
            <View style={[styles.reviewBlock, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.reviewHeading, { color: colors.text, marginBottom: 8 }]}>Items</Text>
              {cart.map((item) => (
                <View key={item.id} style={styles.reviewItemRow}>
                  <Text style={[styles.reviewItemText, { color: colors.text }]} numberOfLines={1}>
                    {item.quantity}x {item.menuItem.name}
                  </Text>
                  <Text style={[styles.reviewItemPrice, { color: colors.textSecondary }]}>
                    ${(item.totalPrice * item.quantity).toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>

            {/* Pricing Summary */}
            <View style={[styles.pricingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.pricingRow}>
                <Text style={{ color: colors.textSecondary }}>Subtotal</Text>
                <Text style={{ color: colors.text }}>${subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.pricingRow}>
                <Text style={{ color: colors.textSecondary }}>Delivery</Text>
                <Text style={{ color: colors.text }}>${deliveryFee.toFixed(2)}</Text>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.pricingRow}>
                <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
                <Text style={[styles.totalValue, { color: colors.primary }]}>
                  ${total.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.card }]}>
        {step < 3 ? (
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: colors.primary }]}
            onPress={() => setStep(step + 1)}
          >
            <Text style={styles.btnText}>Continue</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.placeOrderBtn, { backgroundColor: colors.primary }]}
            onPress={handlePlaceOrder}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.btnText}>Place Order - ${total.toFixed(2)}</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
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
  stepIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
  },
  stepItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepNumberText: {
    fontSize: 10,
    fontWeight: '700',
  },
  stepLabel: {
    fontSize: 10,
  },
  stepLine: {
    width: 40,
    height: 2,
    marginHorizontal: 8,
    alignSelf: 'center',
    marginTop: -16,
  },
  scrollContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 100,
  },
  stepContent: {
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  addressLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addressTextCol: {
    marginLeft: 12,
    flex: 1,
    paddingRight: 8,
  },
  addressLabelText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
  },
  addressText: {
    fontSize: Typography.fontSize.xs,
    marginTop: 2,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  paymentMethodText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
  reviewBlock: {
    borderRadius: 12,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  reviewHeading: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reviewValueText: {
    fontSize: Typography.fontSize.sm,
    marginTop: 4,
    fontWeight: '500',
  },
  reviewItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  reviewItemText: {
    fontSize: Typography.fontSize.sm,
    flex: 1,
    marginRight: 8,
  },
  reviewItemPrice: {
    fontSize: Typography.fontSize.sm,
  },
  pricingCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.sm,
  },
  totalLabel: {
    fontSize: Typography.fontSize.md,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '800',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    borderTopWidth: 1,
    height: 80,
    justifyContent: 'center',
  },
  nextBtn: {
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeOrderBtn: {
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: Typography.fontSize.md,
  },
});

export default CheckoutScreen;
