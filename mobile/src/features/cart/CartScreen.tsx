import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Image,
  SafeAreaView,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useAppStore, CartItem } from '../../store';
import { Colors, Spacing, Typography } from '../../theme';
import { useColorScheme } from '@/hooks/useColorScheme';

export const CartScreen: React.FC = () => {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Zustand Store
  const { cart, cartRestaurant, updateCartQuantity, removeFromCart, clearCart } = useAppStore();

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0);
  };

  const deliveryFee = cartRestaurant ? 2.99 : 0.0;
  const subtotal = calculateSubtotal();
  const total = subtotal + deliveryFee;

  const renderCartItem = ({ item }: { item: CartItem }) => {
    return (
      <View style={[styles.itemCard, { borderBottomColor: colors.border }]}>
        {item.menuItem.image && (
          <Image source={{ uri: item.menuItem.image }} style={styles.itemImage} />
        )}
        <View style={styles.itemInfo}>
          <Text style={[styles.itemName, { color: colors.text }]}>{item.menuItem.name}</Text>

          {item.selectedOptions.length > 0 && (
            <Text style={[styles.itemCustomizations, { color: colors.textSecondary }]}>
              {item.selectedOptions.map((o) => `${o.groupName}: ${o.optionName}`).join(', ')}
            </Text>
          )}

          {item.notes ? (
            <Text style={[styles.itemNotes, { color: colors.warning }]}>
              Note: "{item.notes}"
            </Text>
          ) : null}

          <View style={styles.priceRow}>
            <Text style={[styles.itemPrice, { color: colors.primary }]}>
              ${(item.totalPrice * item.quantity).toFixed(2)}
            </Text>
            <Text style={[styles.itemSinglePrice, { color: colors.textMuted }]}>
              (${item.totalPrice.toFixed(2)} each)
            </Text>
          </View>
        </View>

        <View style={styles.qtyContainer}>
          <TouchableOpacity
            style={[styles.qtyBtn, { borderColor: colors.border }]}
            onPress={() => updateCartQuantity(item.id, item.quantity - 1)}
          >
            <Ionicons name="remove" size={16} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.qtyText, { color: colors.text }]}>{item.quantity}</Text>
          <TouchableOpacity
            style={[styles.qtyBtn, { borderColor: colors.border }]}
            onPress={() => updateCartQuantity(item.id, item.quantity + 1)}
          >
            <Ionicons name="add" size={16} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (cart.length === 0) {
    return (
      <SafeAreaView style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <View style={styles.emptyContent}>
          <Ionicons name="cart-outline" size={80} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Your Cart is Empty</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Browse restaurants and add items to your cart.
          </Text>
          <TouchableOpacity
            style={[styles.startShoppingBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/')}
          >
            <Text style={styles.startShoppingText}>Start Exploring</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Your Cart</Text>
        <TouchableOpacity onPress={clearCart}>
          <Text style={[styles.clearBtnText, { color: colors.primary }]}>Clear</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={cart}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <View style={styles.restaurantRow}>
            <Ionicons name="restaurant-outline" size={20} color={colors.text} />
            <Text style={[styles.restaurantName, { color: colors.text }]}>
              {cartRestaurant?.name}
            </Text>
          </View>
        }
        ListFooterComponent={
          <View style={styles.summaryContainer}>
            <Text style={[styles.summaryTitle, { color: colors.text }]}>Bill Summary</Text>

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Subtotal</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                ${subtotal.toFixed(2)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Delivery Fee</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                ${deliveryFee.toFixed(2)}
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.summaryRow}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>
                ${total.toFixed(2)}
              </Text>
            </View>
          </View>
        }
      />

      {/* Sticky Bottom Action Panel */}
      <View style={[styles.checkoutPanel, { borderTopColor: colors.border, backgroundColor: colors.card }]}>
        <View>
          <Text style={[styles.totalPrompt, { color: colors.textSecondary }]}>Total Price</Text>
          <Text style={[styles.totalPromptVal, { color: colors.text }]}>
            ${total.toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.checkoutBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/checkout')}
        >
          <Text style={styles.checkoutText}>Checkout</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
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
  clearBtnText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 100,
  },
  restaurantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  restaurantName: {
    fontSize: Typography.fontSize.md,
    fontWeight: '700',
    marginLeft: 8,
  },
  itemCard: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
  },
  itemName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
  },
  itemCustomizations: {
    fontSize: 11,
    marginTop: 2,
  },
  itemNotes: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  itemPrice: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
  },
  itemSinglePrice: {
    fontSize: Typography.fontSize.xs,
    marginLeft: 4,
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    paddingHorizontal: 8,
  },
  summaryContainer: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    borderRadius: 16,
  },
  summaryTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.sm,
  },
  summaryValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
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
  checkoutPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    height: 80,
  },
  totalPrompt: {
    fontSize: 10,
    fontWeight: '600',
  },
  totalPromptVal: {
    fontSize: Typography.fontSize.md,
    fontWeight: '800',
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
  },
  checkoutText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: Typography.fontSize.sm,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyContent: {
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
  emptySubtitle: {
    fontSize: Typography.fontSize.sm,
    marginTop: 8,
    textAlign: 'center',
  },
  startShoppingBtn: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  startShoppingText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: Typography.fontSize.sm,
  },
});

export default CartScreen;
