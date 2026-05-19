import React, { memo, useRef } from "react";
import { Animated, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useAdaptiveLayout } from "../utils/layout";

const CategoryCard = memo(function CategoryCard({ item, width, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;
  const layout = useAdaptiveLayout();
  const styles = getStyles(layout);

  const animateTo = (value) => {
    Animated.spring(scale, {
      toValue: value,
      speed: 34,
      bounciness: 5,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ width, transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={() => animateTo(0.94)}
        onPressOut={() => animateTo(1)}
        android_ripple={{ color: "rgba(37,99,235,0.06)", borderless: false }}
        accessibilityRole="button"
        accessibilityLabel={item.title}
        style={({ pressed }) => [styles.card, { aspectRatio: layout.card.categoryAspectRatio }, pressed && styles.cardPressed]}
      >
        <Image source={item.icon} style={styles.icon} resizeMode="contain" />
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
      </Pressable>
    </Animated.View>
  );
});

const getStyles = ({ spacing, typography, card, shadow, isSmallDevice, responsiveWidth }) => StyleSheet.create({
  card: {
    minHeight: isSmallDevice ? 98 : 112,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: card.radius,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: "#EEF2F7",
    ...shadow("sm"),
  },
  cardPressed: {
    opacity: 0.9,
  },
  icon: {
    width: Math.min(responsiveWidth(58), 70),
    height: Math.min(responsiveWidth(48), 60),
    marginBottom: spacing.xs,
  },
  title: {
    color: "#111827",
    ...typography.caption,
    fontWeight: "800",
    textAlign: "center",
  },
});

export default CategoryCard;
