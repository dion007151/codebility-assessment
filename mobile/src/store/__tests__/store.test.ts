import { useAppStore } from '../index';
import { MenuItem } from '../../api/mocks/data';

const mockMenuItem: MenuItem = {
  id: 'menu-test-1',
  name: 'Test Burger',
  description: 'Juicy test burger.',
  price: 9.99,
  image: '',
  category: 'Burgers',
  popular: false,
};

const mockRestaurant = {
  id: 'rest-test-1',
  name: 'Test Burger Joint',
};

describe('Zustand State Store', () => {
  beforeEach(() => {
    // Reset state before each test
    useAppStore.getState().clearCart();
    useAppStore.setState({ favorites: [], orders: [] });
  });

  it('should initialize with an empty cart', () => {
    const state = useAppStore.getState();
    expect(state.cart).toEqual([]);
    expect(state.cartRestaurant).toBeNull();
  });

  it('should add an item to the cart', () => {
    const store = useAppStore.getState();
    store.addToCart(mockRestaurant, mockMenuItem, 2, []);

    const updatedState = useAppStore.getState();
    expect(updatedState.cart.length).toBe(1);
    expect(updatedState.cart[0].menuItem.id).toBe('menu-test-1');
    expect(updatedState.cart[0].quantity).toBe(2);
    expect(updatedState.cartRestaurant?.id).toBe('rest-test-1');
  });

  it('should update quantity if the same item is added again', () => {
    const store = useAppStore.getState();
    store.addToCart(mockRestaurant, mockMenuItem, 1, []);
    store.addToCart(mockRestaurant, mockMenuItem, 2, []);

    const updatedState = useAppStore.getState();
    expect(updatedState.cart.length).toBe(1);
    expect(updatedState.cart[0].quantity).toBe(3);
  });

  it('should clear existing cart and set new restaurant when adding items from a different restaurant', () => {
    const store = useAppStore.getState();
    // Add item from restaurant A
    store.addToCart(mockRestaurant, mockMenuItem, 1, []);

    const anotherRestaurant = { id: 'rest-test-2', name: 'Another Joint' };
    const anotherItem: MenuItem = { ...mockMenuItem, id: 'menu-test-2' };

    // Add item from restaurant B
    store.addToCart(anotherRestaurant, anotherItem, 1, []);

    const updatedState = useAppStore.getState();
    expect(updatedState.cart.length).toBe(1);
    expect(updatedState.cart[0].menuItem.id).toBe('menu-test-2');
    expect(updatedState.cartRestaurant?.id).toBe('rest-test-2');
  });

  it('should remove items and decrement quantity correctly', () => {
    const store = useAppStore.getState();
    store.addToCart(mockRestaurant, mockMenuItem, 2, []);

    const cartItem = useAppStore.getState().cart[0];
    useAppStore.getState().updateCartQuantity(cartItem.id, 1);

    expect(useAppStore.getState().cart[0].quantity).toBe(1);

    useAppStore.getState().removeFromCart(cartItem.id);
    expect(useAppStore.getState().cart).toEqual([]);
    expect(useAppStore.getState().cartRestaurant).toBeNull();
  });

  it('should toggle favorites list correctly', () => {
    const store = useAppStore.getState();
    expect(store.isFavorite('rest-test-1')).toBe(false);

    store.toggleFavorite('rest-test-1');
    expect(useAppStore.getState().isFavorite('rest-test-1')).toBe(true);

    useAppStore.getState().toggleFavorite('rest-test-1');
    expect(useAppStore.getState().isFavorite('rest-test-1')).toBe(false);
  });
});
