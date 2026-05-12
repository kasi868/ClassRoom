import React, { memo, useRef } from "react";
import { Animated, Image, Pressable, StyleSheet, Text, View } from "react-native";

const CategoryCard = memo(function CategoryCard({ item, width, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;

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
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <View style={[styles.iconWrap, { backgroundColor: item.backgroundColor }]}>
          <Image source={item.icon} style={styles.icon} resizeMode="contain" />
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    height: 116,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: "#EEF2F7",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  cardPressed: {
    opacity: 0.9,
  },
  iconWrap: {
    width: 62,
    height: 62,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.02)",
  },
  icon: {
    width: 42,
    height: 42,
  },
  title: {
    color: "#111827",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800",
    textAlign: "center",
  },
});

export default CategoryCard;
