import React, { memo, useRef } from "react";
import { Animated, Image, Pressable, StyleSheet, Text, View } from "react-native";

const CategoryCard = memo(function CategoryCard({ item, width }) {
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
        onPress={item.onPress}
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
    height: 104,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: "#EEF2F7",
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.9,
  },
  iconWrap: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  icon: {
    width: 34,
    height: 34,
  },
  title: {
    color: "#111827",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
    textAlign: "center",
  },
});

export default CategoryCard;
