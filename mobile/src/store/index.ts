import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MenuItem, Restaurant } from '../api/mocks/data';

export interface CartItem {
  id: string; // unique cart item id (e.g. menu-item-id + customization-hash)
  menuItem: MenuItem;
  quantity: number;
  selectedOptions: {
    groupName: string;
    optionName: string;
    price: number;
  }[];
  notes?: string;
  totalPrice: number; // single item price including options
}

export type OrderStatus = 'placed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  restaurantId: string;
  restaurantName: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  address: string;
  paymentMethod: string;
  status: OrderStatus;
  createdAt: string;
  eta: number; // minutes
}

interface AppState {
  // Cart State
  cart: CartItem[];
  cartRestaurant: { id: string; name: string } | null;
  addToCart: (
    restaurant: { id: string; name: string },
    item: MenuItem,
    quantity: number,
    selectedOptions: { groupName: string; optionName: string; price: number }[],
    notes?: string
  ) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;

  // Favorites State
  favorites: string[]; // Restaurant IDs
  toggleFavorite: (restaurantId: string) => void;
  isFavorite: (restaurantId: string) => boolean;

  // Orders State
  orders: Order[];
  addOrder: (order: Order) => void;
  cancelOrder: (orderId: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

// Helper to generate unique cart item hash based on selections
const generateCartItemId = (
  menuItemId: string,
  selectedOptions: { groupName: string; optionName: string; price: number }[]
) => {
  const sortedOptions = [...selectedOptions].sort((a, b) =>
    `${a.groupName}-${a.optionName}`.localeCompare(`${b.groupName}-${b.optionName}`)
  );
  const optionsString = sortedOptions
    .map((o) => `${o.groupName}:${o.optionName}`)
    .join('|');
  return `${menuItemId}_${optionsString}`;
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Cart state
      cart: [],
      cartRestaurant: null,

      addToCart: (restaurant, item, quantity, selectedOptions, notes) => {
        const cartItemId = generateCartItemId(item.id, selectedOptions);
        const { cart, cartRestaurant } = get();

        // Calculate single item price including selected custom options
        const optionsCost = selectedOptions.reduce((acc, opt) => acc + opt.price, 0);
        const singleItemPrice = item.price + optionsCost;

        // Enforce single restaurant checkout
        if (cartRestaurant && cartRestaurant.id !== restaurant.id) {
          // Clear previous cart items and start new restaurant cart
          const newCartItem: CartItem = {
            id: cartItemId,
            menuItem: item,
            quantity,
            selectedOptions,
            notes,
            totalPrice: singleItemPrice,
          };
          set({
            cart: [newCartItem],
            cartRestaurant: restaurant,
          });
          return;
        }

        const existingItemIndex = cart.findIndex((i) => i.id === cartItemId);
        if (existingItemIndex > -1) {
          const updatedCart = [...cart];
          updatedCart[existingItemIndex].quantity += quantity;
          set({ cart: updatedCart, cartRestaurant: restaurant });
        } else {
          const newCartItem: CartItem = {
            id: cartItemId,
            menuItem: item,
            quantity,
            selectedOptions,
            notes,
            totalPrice: singleItemPrice,
          };
          set({
            cart: [...cart, newCartItem],
            cartRestaurant: restaurant,
          });
        }
      },

      removeFromCart: (cartItemId) => {
        const { cart } = get();
        const updatedCart = cart.filter((item) => item.id !== cartItemId);
        set({
          cart: updatedCart,
          cartRestaurant: updatedCart.length === 0 ? null : get().cartRestaurant,
        });
      },

      updateCartQuantity: (cartItemId, quantity) => {
        const { cart } = get();
        if (quantity <= 0) {
          get().removeFromCart(cartItemId);
          return;
        }
        const updatedCart = cart.map((item) =>
          item.id === cartItemId ? { ...item, quantity } : item
        );
        set({ cart: updatedCart });
      },

      clearCart: () => {
        set({ cart: [], cartRestaurant: null });
      },

      // Favorites state
      favorites: [],

      toggleFavorite: (restaurantId) => {
        const { favorites } = get();
        if (favorites.includes(restaurantId)) {
          set({ favorites: favorites.filter((id) => id !== restaurantId) });
        } else {
          set({ favorites: [...favorites, restaurantId] });
        }
      },

      isFavorite: (restaurantId) => {
        return get().favorites.includes(restaurantId);
      },

      // Orders state
      orders: [],

      addOrder: (order) => {
        set({ orders: [order, ...get().orders] });
      },

      cancelOrder: (orderId) => {
        const { orders } = get();
        set({
          orders: orders.map((o) =>
            o.id === orderId ? { ...o, status: 'cancelled' as const, eta: 0 } : o
          ),
        });
      },

      updateOrderStatus: (orderId, status) => {
        const { orders } = get();
        set({
          orders: orders.map((o) =>
            o.id === orderId
              ? { ...o, status, eta: status === 'delivered' ? 0 : Math.max(0, o.eta - 7) }
              : o
          ),
        });
      },
    }),
    {
      name: 'food-delivery-app-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        cart: state.cart,
        cartRestaurant: state.cartRestaurant,
        favorites: state.favorites,
        orders: state.orders,
      }),
    }
  )
);

// Utility helper to start order tracking status simulation
export const startOrderStatusSimulation = (orderId: string) => {
  const statuses: OrderStatus[] = ['preparing', 'out_for_delivery', 'delivered'];
  let currentIdx = 0;

  const intervalId = setInterval(() => {
    const store = useAppStore.getState();
    const order = store.orders.find((o) => o.id === orderId);

    if (!order || order.status === 'delivered' || order.status === 'cancelled') {
      clearInterval(intervalId);
      return;
    }

    const nextStatus = statuses[currentIdx];
    store.updateOrderStatus(orderId, nextStatus);
    currentIdx++;

    if (currentIdx >= statuses.length) {
      clearInterval(intervalId);
    }
  }, 15000); // Progress every 15 seconds for simulation demonstration

  return intervalId;
};
