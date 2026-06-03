import { MockRestaurants, Restaurant, AddressPresets } from './mocks/data';

const SIMULATED_LATENCY = 600; // ms

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const ApiClient = {
  getRestaurants: async (filters?: {
    query?: string;
    cuisine?: string;
  }): Promise<Restaurant[]> => {
    await delay(SIMULATED_LATENCY);

    let result = [...MockRestaurants];

    if (filters?.cuisine && filters.cuisine !== 'All') {
      result = result.filter(
        (r) => r.cuisine.toLowerCase() === filters.cuisine!.toLowerCase()
      );
    }

    if (filters?.query) {
      const q = filters.query.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.cuisine.toLowerCase().includes(q) ||
          r.menu.some((item) => item.name.toLowerCase().includes(q))
      );
    }

    return result;
  },

  getRestaurantById: async (id: string): Promise<Restaurant | null> => {
    await delay(SIMULATED_LATENCY);
    const restaurant = MockRestaurants.find((r) => r.id === id);
    return restaurant ? { ...restaurant } : null;
  },

  getAddressPresets: async () => {
    await delay(200);
    return [...AddressPresets];
  },

  createOrder: async (orderData: {
    restaurantId: string;
    restaurantName: string;
    items: any[];
    total: number;
    address: string;
    paymentMethod: string;
  }) => {
    await delay(1200); // Higher latency for order creation processing
    return {
      id: `ord-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'placed',
      createdAt: new Date().toISOString(),
      eta: 25, // 25 minutes
      ...orderData,
    };
  },
};
export default ApiClient;
