import React, { memo, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAdaptiveLayout } from "../utils/layout";

const NoticeCard = memo(function NoticeCard({ item }) {
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
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={item.onPress}
        onPressIn={() => animateTo(0.985)}
        onPressOut={() => animateTo(1)}
        android_ripple={{ color: "rgba(15,23,42,0.04)" }}
        accessibilityRole="button"
        accessibilityLabel={`${item.title}. ${item.description}. ${item.time}`}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <View style={[styles.sideRail, { backgroundColor: item.color }]} />
        <View style={[styles.iconWrap, { backgroundColor: item.backgroundColor }]}>
          <Ionicons name={item.icon} size={18} color={item.color} />
        </View>
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
});

const getStyles = ({ spacing, typography, card, shadow, isSmallDevice }) => StyleSheet.create({
  card: {
    minHeight: isSmallDevice ? 86 : 92,
    backgroundColor: "#FFFFFF",
    borderRadius: card.radius,
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: "#EEF2F7",
    ...shadow("sm"),
    overflow: "hidden",
  },
  cardPressed: {
    opacity: 0.92,
  },
  sideRail: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  iconWrap: {
    width: isSmallDevice ? 34 : 38,
    height: isSmallDevice ? 34 : 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: "#111827",
    ...typography.bodySmall,
    fontWeight: "900",
    marginBottom: spacing.xxs,
  },
  description: {
    color: "#4B5563",
    ...typography.label,
    fontWeight: "500",
  },
  time: {
    color: "#9CA3AF",
    ...typography.caption,
    fontWeight: "700",
    marginTop: spacing.xs,
  },
});

export default NoticeCard;
