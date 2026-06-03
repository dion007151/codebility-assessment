import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ApiClient } from '../../api/client';
import { Restaurant, MenuItem, MenuOptionGroup, MenuOption } from '../../api/mocks/data';
import { useAppStore } from '../../store';
import { Colors, Spacing, Typography } from '../../theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import Skeleton from '../../components/common/Skeleton';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_MAX_HEIGHT = 240;
const HEADER_MIN_HEIGHT = 100;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

export const DetailsScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Store actions
  const { addToCart, cart, toggleFavorite, isFavorite } = useAppStore();

  // Component states
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<{
    [groupId: string]: MenuOption[];
  }>({});
  const [notes, setNotes] = useState('');
  const [activeCategory, setActiveCategory] = useState('');

  // Scroll animations and refs
  const scrollY = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const categoryScrollRef = useRef<ScrollView>(null);
  const itemPositions = useRef<{ [key: string]: number }>({});

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      try {
        const data = await ApiClient.getRestaurantById(id);
        if (data) {
          setRestaurant(data);
          if (data.categories && data.categories.length > 0) {
            setActiveCategory(data.categories[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load restaurant details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  // Handle category menu scroll action
  const handleCategoryPress = (category: string) => {
    setActiveCategory(category);
    const position = itemPositions.current[category];
    if (position !== undefined && flatListRef.current) {
      flatListRef.current.scrollToOffset({
        offset: position - 150, // offset below the sticky category header
        animated: true,
      });
    }
  };

  // Open item customization modal
  const handleOpenItem = (item: MenuItem) => {
    setSelectedItem(item);
    setQuantity(1);
    setNotes('');

    // Pre-populate default required options
    const defaults: { [groupId: string]: MenuOption[] } = {};
    if (item.optionGroups) {
      item.optionGroups.forEach((group) => {
        if (group.required && group.options.length > 0) {
          defaults[group.id] = [group.options[0]];
        } else {
          defaults[group.id] = [];
        }
      });
    }
    setSelectedOptions(defaults);
    setModalVisible(true);
  };

  // Handle option select/toggle in modal
  const handleToggleOption = (group: MenuOptionGroup, option: MenuOption) => {
    const currentSelected = selectedOptions[group.id] || [];

    if (group.maxSelections === 1) {
      // Single selection (Radio button behavior)
      setSelectedOptions({
        ...selectedOptions,
        [group.id]: [option],
      });
    } else {
      // Multi selection (Checkbox behavior)
      const exists = currentSelected.some((o) => o.id === option.id);
      let updated: MenuOption[];
      if (exists) {
        updated = currentSelected.filter((o) => o.id !== option.id);
      } else {
        if (currentSelected.length < group.maxSelections) {
          updated = [...currentSelected, option];
        } else {
          // Reached limit, replace last
          updated = [...currentSelected.slice(1), option];
        }
      }
      setSelectedOptions({
        ...selectedOptions,
        [group.id]: updated,
      });
    }
  };

  // Calculate current item modal total price
  const calculateModalItemTotal = () => {
    if (!selectedItem) return 0;
    let price = selectedItem.price;

    Object.values(selectedOptions).forEach((optionsList) => {
      optionsList.forEach((opt) => {
        price += opt.price;
      });
    });

    return price * quantity;
  };

  // Confirm item add to cart
  const handleConfirmAddToCart = () => {
    if (!restaurant || !selectedItem) return;

    // Flatten selected options list for Zustand store
    const flattened: { groupName: string; optionName: string; price: number }[] = [];
    Object.entries(selectedOptions).forEach(([groupId, list]) => {
      const group = selectedItem.optionGroups?.find((g) => g.id === groupId);
      if (group) {
        list.forEach((opt) => {
          flattened.push({
            groupName: group.name,
            optionName: opt.name,
            price: opt.price,
          });
        });
      }
    });

    addToCart(
      { id: restaurant.id, name: restaurant.name },
      selectedItem,
      quantity,
      flattened,
      notes
    );

    setModalVisible(false);
  };

  // Total cart item counts
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Parallax Header Animations
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -10],
    extrapolate: 'clamp',
  });

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingHeader}>
          <Skeleton width="100%" height={200} borderRadius={0} />
        </View>
        <View style={{ padding: Spacing.md }}>
          <Skeleton width={200} height={28} borderRadius={4} />
          <Skeleton width={120} height={16} borderRadius={4} style={{ marginTop: 8 }} />
          <View style={{ flexDirection: 'row', marginTop: 16 }}>
            <Skeleton width={80} height={20} borderRadius={4} style={{ marginRight: 8 }} />
            <Skeleton width={80} height={20} borderRadius={4} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!restaurant) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Restaurant not found.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={{ color: colors.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Pre-process and group menu items by category to render
  const flatMenuData: (MenuItem | { isHeader: boolean; title: string })[] = [];
  const processedCategories: string[] = [];

  // Group by category based on restaurant menu items
  restaurant.menu.forEach((item) => {
    if (!processedCategories.includes(item.category)) {
      processedCategories.push(item.category);
      flatMenuData.push({ isHeader: true, title: item.category });
    }
    flatMenuData.push(item);
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Floating Header Overlay for controls */}
      <View style={styles.topNavigation}>
        <TouchableOpacity
          style={[styles.circularBtn, { backgroundColor: 'rgba(255,255,255,0.9)' }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color="#000000" />
        </TouchableOpacity>

        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            style={[styles.circularBtn, { backgroundColor: 'rgba(255,255,255,0.9)', marginRight: 12 }]}
            onPress={() => toggleFavorite(restaurant.id)}
          >
            <Ionicons
              name={isFavorite(restaurant.id) ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavorite(restaurant.id) ? colors.primary : '#000000'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.circularBtn, { backgroundColor: 'rgba(255,255,255,0.9)' }]}
            onPress={() => router.push('/cart')}
          >
            <Ionicons name="cart-outline" size={22} color="#000000" />
            {totalCartCount > 0 && (
              <View style={[styles.cartBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.cartBadgeText}>{totalCartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Animated Cover Image Header */}
      <Animated.View
        style={[
          styles.animatedHeader,
          {
            height: headerHeight,
            transform: [{ translateY: headerTranslateY }],
            backgroundColor: colors.surface,
          },
        ]}
      >
        <Animated.Image
          source={{ uri: restaurant.coverImage }}
          style={[styles.coverImage, { opacity: imageOpacity }]}
        />
        <View style={[styles.headerOverlay, { backgroundColor: 'rgba(0,0,0,0.2)' }]} />
      </Animated.View>

      {/* Primary Scrollable List of Menu */}
      <Animated.FlatList
        ref={flatListRef}
        data={flatMenuData}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        keyExtractor={(item, index) => ('isHeader' in item ? `hdr-${item.title}` : `item-${item.id}`)}
        contentContainerStyle={[styles.scrollContainer, { paddingTop: HEADER_SCROLL_DISTANCE + 100 }]}
        ListHeaderComponent={
          <View style={[styles.restaurantDetails, { backgroundColor: colors.background }]}>
            <Text style={[styles.nameText, { color: colors.text }]}>{restaurant.name}</Text>
            <Text style={[styles.cuisineInfo, { color: colors.textSecondary }]}>
              {restaurant.cuisine} • {restaurant.distance} km • {restaurant.deliveryTime} mins
            </Text>

            <View style={styles.ratingRow}>
              <Ionicons name="star" size={18} color={colors.secondary} />
              <Text style={[styles.ratingVal, { color: colors.text }]}>
                {restaurant.rating}
              </Text>
              <Text style={[styles.ratingCountText, { color: colors.textMuted }]}>
                ({restaurant.ratingCount}+ ratings)
              </Text>
            </View>

            {/* Sub-header horizontal navigation for categories (Sticky container) */}
            <View style={[styles.stickyCategoryBar, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <ScrollView
                ref={categoryScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryScroll}
              >
                {restaurant.categories.map((cat) => {
                  const isCatActive = activeCategory === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryTab,
                        isCatActive && { borderBottomColor: colors.primary },
                      ]}
                      onPress={() => handleCategoryPress(cat)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.categoryTabText,
                          {
                            color: isCatActive ? colors.primary : colors.textSecondary,
                            fontWeight: isCatActive ? '700' : '500',
                          },
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        }
        renderItem={({ item, index }) => {
          if ('isHeader' in item) {
            // Category header
            return (
              <View
                style={[styles.sectionHeader, { backgroundColor: colors.background }]}
                onLayout={(e) => {
                  // Capture layout position for sticky tapping
                  itemPositions.current[item.title] = e.nativeEvent.layout.y;
                }}
              >
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{item.title}</Text>
              </View>
            );
          }

          // Menu item card
          return (
            <TouchableOpacity
              style={[styles.menuItemCard, { borderBottomColor: colors.border }]}
              onPress={() => handleOpenItem(item)}
              activeOpacity={0.8}
            >
              <View style={styles.menuItemDetails}>
                <Text style={[styles.menuItemName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.menuItemDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                  {item.description}
                </Text>
                <Text style={[styles.menuItemPrice, { color: colors.primary }]}>
                  ${item.price.toFixed(2)}
                </Text>
              </View>
              {item.image && (
                <Image source={{ uri: item.image }} style={styles.menuItemImage} />
              )}
            </TouchableOpacity>
          );
        }}
      />

      {/* Item Detail / Customization Modal */}
      {selectedItem && (
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              {/* Modal Drag/Indicator Bar */}
              <View style={[styles.dragBar, { backgroundColor: colors.border }]} />

              <View style={styles.modalHeader}>
                <Text style={[styles.modalItemTitle, { color: colors.text }]}>
                  {selectedItem.name}
                </Text>
                <TouchableOpacity
                  style={[styles.closeBtn, { backgroundColor: colors.surfaceVariant }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Ionicons name="close" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                {selectedItem.image && (
                  <Image source={{ uri: selectedItem.image }} style={styles.modalItemImage} />
                )}
                <Text style={[styles.modalItemDesc, { color: colors.textSecondary }]}>
                  {selectedItem.description}
                </Text>

                {/* Customizations Option Groups */}
                {selectedItem.optionGroups?.map((group) => (
                  <View key={group.id} style={styles.optionGroupContainer}>
                    <View style={styles.optionGroupHeader}>
                      <Text style={[styles.optionGroupName, { color: colors.text }]}>
                        {group.name}
                      </Text>
                      {group.required ? (
                        <View style={[styles.requiredBadge, { backgroundColor: colors.primaryLight }]}>
                          <Text style={[styles.requiredBadgeText, { color: colors.primary }]}>
                            REQUIRED
                          </Text>
                        </View>
                      ) : (
                        <Text style={[styles.optionalText, { color: colors.textMuted }]}>Optional</Text>
                      )}
                    </View>

                    {group.options.map((opt) => {
                      const isSelected = (selectedOptions[group.id] || []).some(
                        (o) => o.id === opt.id
                      );
                      return (
                        <TouchableOpacity
                          key={opt.id}
                          style={[styles.optionRow, { borderBottomColor: colors.border }]}
                          onPress={() => handleToggleOption(group, opt)}
                          activeOpacity={0.7}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons
                              name={
                                group.maxSelections === 1
                                  ? isSelected
                                    ? 'radio-button-on'
                                    : 'radio-button-off'
                                  : isSelected
                                  ? 'checkbox'
                                  : 'square-outline'
                              }
                              size={22}
                              color={isSelected ? colors.primary : colors.textSecondary}
                            />
                            <Text style={[styles.optionTextLabel, { color: colors.text }]}>
                              {opt.name}
                            </Text>
                          </View>
                          {opt.price > 0 && (
                            <Text style={[styles.optionPriceText, { color: colors.textSecondary }]}>
                              +${opt.price.toFixed(2)}
                            </Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}

                {/* Notes Input Section */}
                <View style={{ marginVertical: Spacing.md }}>
                  <Text style={[styles.optionGroupName, { color: colors.text, marginBottom: 8 }]}>
                    Special Instructions
                  </Text>
                  <View style={[styles.notesContainer, { backgroundColor: colors.surfaceVariant }]}>
                    <Text style={{ display: 'none' }} />
                    <ScrollView style={{ height: 60 }}>
                      <Text
                        style={[styles.notesPlaceholder, { color: colors.textMuted }]}
                        onPress={() => {
                          const inputNotes = prompt('Add special instructions (allergies, packaging, etc.):');
                          if (inputNotes !== null) setNotes(inputNotes);
                        }}
                      >
                        {notes || 'Add instructions here (e.g. no onions, sauce on the side)...'}
                      </Text>
                    </ScrollView>
                  </View>
                </View>
              </ScrollView>

              {/* Bottom Sticky Action Panel */}
              <View style={[styles.modalActions, { borderTopColor: colors.border }]}>
                <View style={[styles.qtyController, { backgroundColor: colors.surfaceVariant }]}>
                  <TouchableOpacity
                    onPress={() => setQuantity(Math.max(1, quantity - 1))}
                    style={styles.qtyBtn}
                  >
                    <Ionicons name="remove" size={20} color={colors.text} />
                  </TouchableOpacity>
                  <Text style={[styles.qtyText, { color: colors.text }]}>{quantity}</Text>
                  <TouchableOpacity onPress={() => setQuantity(quantity + 1)} style={styles.qtyBtn}>
                    <Ionicons name="add" size={20} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.addToCartBtn, { backgroundColor: colors.primary }]}
                  onPress={handleConfirmAddToCart}
                >
                  <Text style={styles.addToCartText}>
                    Add - ${calculateModalItemTotal().toFixed(2)}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    zIndex: 10,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingHeader: {
    height: 200,
    width: '100%',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtn: {
    marginTop: 16,
    padding: 10,
  },
  topNavigation: {
    position: 'absolute',
    top: 48,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 100,
  },
  circularBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  scrollContainer: {
    paddingBottom: Spacing.xl,
  },
  restaurantDetails: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  nameText: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: '700',
  },
  cuisineInfo: {
    fontSize: Typography.fontSize.sm,
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
  ratingVal: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    marginLeft: 4,
  },
  ratingCountText: {
    fontSize: Typography.fontSize.xs,
    marginLeft: 4,
  },
  stickyCategoryBar: {
    marginTop: Spacing.md,
    borderBottomWidth: 1,
  },
  categoryScroll: {
    paddingBottom: 4,
  },
  categoryTab: {
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  categoryTabText: {
    fontSize: Typography.fontSize.sm,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: '700',
    marginTop: 8,
  },
  menuItemCard: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  menuItemDetails: {
    flex: 1,
    paddingRight: 8,
  },
  menuItemName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
  },
  menuItemDesc: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  menuItemPrice: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    marginTop: 8,
  },
  menuItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.85,
    paddingBottom: Spacing.xl,
  },
  dragBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  modalItemTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScroll: {
    paddingHorizontal: Spacing.md,
  },
  modalItemImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginVertical: Spacing.sm,
  },
  modalItemDesc: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  optionGroupContainer: {
    marginVertical: Spacing.sm,
  },
  optionGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  optionGroupName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
  },
  requiredBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  requiredBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  optionalText: {
    fontSize: Typography.fontSize.xs,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  optionTextLabel: {
    fontSize: Typography.fontSize.sm,
    marginLeft: 8,
  },
  optionPriceText: {
    fontSize: Typography.fontSize.sm,
  },
  notesContainer: {
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
  },
  notesPlaceholder: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  qtyController: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: 4,
    height: 48,
  },
  qtyBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: Typography.fontSize.md,
    fontWeight: '700',
    paddingHorizontal: 12,
  },
  addToCartBtn: {
    flex: 1,
    marginLeft: Spacing.md,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.md,
    fontWeight: '700',
  },
});

export default DetailsScreen;
