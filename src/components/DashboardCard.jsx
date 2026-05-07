import React, { memo, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const DashboardCard = memo(function DashboardCard({ item }) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value) => {
    Animated.spring(scale, {
      toValue: value,
      speed: 32,
      bounciness: 5,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[styles.animatedWrap, { transform: [{ scale }] }]}>
      <Pressable
        onPress={item.onPress}
        onPressIn={() => animateTo(0.975)}
        onPressOut={() => animateTo(1)}
        android_ripple={{ color: "rgba(37,99,235,0.08)" }}
        accessibilityRole="button"
        accessibilityLabel={`${item.title}, ${item.value}, ${item.subtitle}`}
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: item.backgroundColor },
          pressed && styles.cardPressed,
        ]}
      >
        <View style={[styles.iconBox, { backgroundColor: item.iconBackground }]}>
          <Ionicons name={item.icon} size={20} color={item.iconColor} />
        </View>

        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>

        <View style={styles.valueRow}>
          <Text style={[styles.value, { color: item.valueColor || "#111827" }]} numberOfLines={1}>
            {item.value}
          </Text>
          {item.trend ? (
            <Ionicons
              name={item.trend === "up" ? "trending-up" : "trending-down"}
              size={15}
              color={item.trend === "up" ? "#16A34A" : "#DC2626"}
            />
          ) : null}
        </View>

        <View style={styles.footer}>
          <Text style={styles.subtitle} numberOfLines={1}>
            {item.subtitle}
          </Text>
          <Ionicons name="chevron-forward" size={13} color="#6B7280" />
        </View>
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  animatedWrap: {
    flex: 1,
  },
  card: {
    minHeight: 126,
    borderRadius: 18,
    padding: 14,
    overflow: "hidden",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 4,
  },
  cardPressed: {
    opacity: 0.92,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 7,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  value: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "900",
    letterSpacing: 0,
  },
  footer: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  subtitle: {
    flex: 1,
    color: "#374151",
    fontSize: 11,
    fontWeight: "600",
  },
});

export default DashboardCard;
