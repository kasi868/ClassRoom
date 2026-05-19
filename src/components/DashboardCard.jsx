import React, { memo, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAdaptiveLayout } from "../utils/layout";

const DashboardCard = memo(function DashboardCard({ item, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;
  const layout = useAdaptiveLayout();
  const styles = getStyles(layout);

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
        onPress={onPress}
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
          <Text
            style={[styles.value, { color: item.valueColor || "#111827" }]}
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.78}
          >
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

const getStyles = ({ spacing, typography, card, shadow, isSmallDevice }) => StyleSheet.create({
  animatedWrap: {
    flex: 1,
    minWidth: 0,
  },
  card: {
    minHeight: card.dashboardMinHeight,
    borderRadius: card.radius,
    padding: card.compactPadding,
    overflow: "hidden",
    ...shadow("md"),
  },
  cardPressed: {
    opacity: 0.92,
  },
  iconBox: {
    width: isSmallDevice ? 34 : 38,
    height: isSmallDevice ? 34 : 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  title: {
    color: "#111827",
    ...typography.label,
    fontWeight: "800",
    marginBottom: spacing.xs,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  value: {
    ...typography.headline,
    fontWeight: "900",
    letterSpacing: 0,
    flexShrink: 1,
  },
  footer: {
    marginTop: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.xs,
  },
  subtitle: {
    flex: 1,
    color: "#374151",
    ...typography.caption,
    fontWeight: "600",
  },
});

export default DashboardCard;
