export interface MenuOption {
  id: string;
  name: string;
  price: number;
}

export interface MenuOptionGroup {
  id: string;
  name: string;
  required: boolean;
  maxSelections: number;
  options: MenuOption[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  popular: boolean;
  optionGroups?: MenuOptionGroup[];
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  ratingCount: number;
  deliveryTime: number; // in minutes
  distance: number; // in km
  deliveryFee: number;
  coverImage: string;
  featured: boolean;
  categories: string[];
  menu: MenuItem[];
  latitude: number;
  longitude: number;
}

export const Cuisines = [
  'All',
  'Burgers',
  'Pizza',
  'Sushi',
  'Asian',
  'Desserts',
  'Healthy',
];

export const AddressPresets = [
  {
    id: 'addr-1',
    label: 'Home',
    address: '123 Main Street, Suite 4B, San Francisco, CA 94105',
    latitude: 37.7749,
    longitude: -122.4194,
  },
  {
    id: 'addr-2',
    label: 'Office',
    address: '500 Howard Street, Floor 12, San Francisco, CA 94105',
    latitude: 37.7877,
    longitude: -122.3968,
  },
];

export const MockRestaurants: Restaurant[] = [
  {
    id: 'rest-1',
    name: 'Burger Craft & Co',
    cuisine: 'Burgers',
    rating: 4.8,
    ratingCount: 320,
    deliveryTime: 20,
    distance: 1.2,
    deliveryFee: 1.99,
    coverImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    featured: true,
    categories: ['Popular', 'Burgers', 'Sides', 'Beverages'],
    latitude: 37.7793,
    longitude: -122.4114,
    menu: [
      {
        id: 'menu-1-1',
        name: 'The Truffle Bacon Burger',
        description: 'Prime double beef patty, white truffle aioli, applewood smoked bacon, caramelized onions, Swiss cheese on a toasted brioche bun.',
        price: 15.99,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80',
        category: 'Burgers',
        popular: true,
        optionGroups: [
          {
            id: 'burger-size',
            name: 'Patty Options',
            required: true,
            maxSelections: 1,
            options: [
              { id: 'opt-single', name: 'Single Patty', price: 0 },
              { id: 'opt-double', name: 'Double Patty (+ $3.00)', price: 3.0 },
              { id: 'opt-triple', name: 'Triple Patty (+ $5.00)', price: 5.0 },
            ],
          },
          {
            id: 'burger-addons',
            name: 'Extra Toppings',
            required: false,
            maxSelections: 3,
            options: [
              { id: 'add-cheese', name: 'Extra Cheddar', price: 1.0 },
              { id: 'add-egg', name: 'Fried Egg', price: 1.50 },
              { id: 'add-avocado', name: 'Fresh Avocado', price: 2.0 },
            ],
          },
        ],
      },
      {
        id: 'menu-1-2',
        name: 'Classic Smash Cheeseburger',
        description: 'Crispy smash patty, American cheese, house pickles, shredded lettuce, smash sauce.',
        price: 11.99,
        image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&auto=format&fit=crop&q=80',
        category: 'Burgers',
        popular: true,
      },
      {
        id: 'menu-1-3',
        name: 'Truffle Parmesan Fries',
        description: 'Golden fries tossed in white truffle oil, grated parmesan, and fresh parsley, served with garlic aioli.',
        price: 6.99,
        image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&auto=format&fit=crop&q=80',
        category: 'Sides',
        popular: false,
      },
      {
        id: 'menu-1-4',
        name: 'Crispy Onion Rings',
        description: 'Beer-battered jumbo onion rings with smoky BBQ dipping sauce.',
        price: 5.99,
        image: 'https://images.unsplash.com/photo-1639024471283-2bc7b3c6a267?w=400&auto=format&fit=crop&q=80',
        category: 'Sides',
        popular: false,
      },
      {
        id: 'menu-1-5',
        name: 'Craft Strawberry Lemonade',
        description: 'House-made fresh strawberry puree mixed with organic freshly squeezed lemon juice.',
        price: 3.99,
        image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&auto=format&fit=crop&q=80',
        category: 'Beverages',
        popular: false,
      },
    ],
  },
  {
    id: 'rest-2',
    name: 'Pizzeria Bella Italia',
    cuisine: 'Pizza',
    rating: 4.7,
    ratingCount: 198,
    deliveryTime: 25,
    distance: 2.5,
    deliveryFee: 2.99,
    coverImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
    featured: false,
    categories: ['Popular', 'Pizzas', 'Starters', 'Drinks'],
    latitude: 37.7699,
    longitude: -122.4228,
    menu: [
      {
        id: 'menu-2-1',
        name: 'Diablo Honey Pizza',
        description: 'Spicy calabrian salami, fresh mozzarella, tomato sauce, finished with organic hot honey and fresh basil.',
        price: 18.99,
        image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=400&auto=format&fit=crop&q=80',
        category: 'Pizzas',
        popular: true,
        optionGroups: [
          {
            id: 'pizza-crust',
            name: 'Crust Style',
            required: true,
            maxSelections: 1,
            options: [
              { id: 'crust-thin', name: 'Neapolitan (Thin)', price: 0 },
              { id: 'crust-thick', name: 'Pan Pizza (+ $2.00)', price: 2.0 },
              { id: 'crust-gf', name: 'Gluten-Free (+ $3.50)', price: 3.5 },
            ],
          },
        ],
      },
      {
        id: 'menu-2-2',
        name: 'Margherita DOC',
        description: 'San marzano tomatoes, fresh buffalo mozzarella, extra virgin olive oil, fresh basil.',
        price: 15.99,
        image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400&auto=format&fit=crop&q=80',
        category: 'Pizzas',
        popular: true,
      },
      {
        id: 'menu-2-3',
        name: 'Wood-Fired Garlic Knots',
        description: 'Tossed in extra virgin olive oil, fresh garlic, parsley, and romano cheese, served with warm marinara.',
        price: 7.99,
        image: 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=400&auto=format&fit=crop&q=80',
        category: 'Starters',
        popular: false,
      },
    ],
  },
  {
    id: 'rest-3',
    name: 'Sakura Sushi Bar',
    cuisine: 'Sushi',
    rating: 4.9,
    ratingCount: 412,
    deliveryTime: 30,
    distance: 0.8,
    deliveryFee: 0.00,
    coverImage: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop&q=80',
    featured: true,
    categories: ['Popular', 'Signature Rolls', 'Nigiri & Sashimi', 'Appetizers'],
    latitude: 37.7719,
    longitude: -122.4084,
    menu: [
      {
        id: 'menu-3-1',
        name: 'The Dragon Premium Roll',
        description: 'Eel and cucumber inside, wrapped in sweet avocado and premium unagi sauce, topped with tobiko.',
        price: 19.99,
        image: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400&auto=format&fit=crop&q=80',
        category: 'Signature Rolls',
        popular: true,
      },
      {
        id: 'menu-3-2',
        name: 'Omakase Nigiri Set (8pcs)',
        description: 'Chefs handpicked selection of fresh daily catch nigiri, served with house-aged soy sauce.',
        price: 34.99,
        image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&auto=format&fit=crop&q=80',
        category: 'Nigiri & Sashimi',
        popular: true,
      },
      {
        id: 'menu-3-3',
        name: 'Crispy Garlic Edamame',
        description: 'Steamed edamame pods tossed in wok-fried chili garlic crunch and sea salt.',
        price: 6.99,
        image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&auto=format&fit=crop&q=80',
        category: 'Appetizers',
        popular: false,
      },
    ],
  },
  {
    id: 'rest-4',
    name: 'Lotus Garden',
    cuisine: 'Asian',
    rating: 4.6,
    ratingCount: 155,
    deliveryTime: 28,
    distance: 3.1,
    deliveryFee: 3.49,
    coverImage: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600&auto=format&fit=crop&q=80',
    featured: false,
    categories: ['Popular', 'Rice & Noodles', 'Dim Sum'],
    latitude: 37.7850,
    longitude: -122.4300,
    menu: [
      {
        id: 'menu-4-1',
        name: 'Special House Pad Thai',
        description: 'Rice noodles, prawns, chicken, tofu, wok-fried with sweet tamarind, egg, and crushed peanuts.',
        price: 14.99,
        image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400&auto=format&fit=crop&q=80',
        category: 'Rice & Noodles',
        popular: true,
      },
      {
        id: 'menu-4-2',
        name: 'Steamed Pork Xiao Long Bao (6pcs)',
        description: 'Traditional soup dumplings with savory pork broth filling, ginger vinegar dipping sauce.',
        price: 9.99,
        image: 'https://images.unsplash.com/photo-1496116278089-6e3025255bc6?w=400&auto=format&fit=crop&q=80',
        category: 'Dim Sum',
        popular: true,
      },
    ],
  },
  {
    id: 'rest-5',
    name: 'Sweet Lab Desserts',
    cuisine: 'Desserts',
    rating: 4.8,
    ratingCount: 280,
    deliveryTime: 15,
    distance: 1.5,
    deliveryFee: 1.99,
    coverImage: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&auto=format&fit=crop&q=80',
    featured: false,
    categories: ['Desserts', 'Beverages'],
    latitude: 37.7760,
    longitude: -122.4000,
    menu: [
      {
        id: 'menu-5-1',
        name: 'Matcha Lava Cake',
        description: 'Warm matcha green tea cake with a liquid white chocolate matcha center, served with vanilla bean ice cream.',
        price: 9.99,
        image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&auto=format&fit=crop&q=80',
        category: 'Desserts',
        popular: true,
      },
      {
        id: 'menu-5-2',
        name: 'Double Chocolate Fudge Waffle',
        description: 'Belgian waffle topped with rich dark chocolate sauce, white chocolate curls, and organic strawberries.',
        price: 11.99,
        image: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400&auto=format&fit=crop&q=80',
        category: 'Desserts',
        popular: true,
      },
    ],
  },
];
