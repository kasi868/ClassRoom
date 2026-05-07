import React, { memo, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const NoticeCard = memo(function NoticeCard({ item }) {
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

const styles = StyleSheet.create({
  card: {
    minHeight: 92,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    marginBottom: 12,
    paddingVertical: 14,
    paddingLeft: 17,
    paddingRight: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderWidth: 1,
    borderColor: "#EEF2F7",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 3,
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
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  title: {
    color: "#111827",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
    marginBottom: 4,
  },
  description: {
    color: "#4B5563",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "500",
  },
  time: {
    color: "#9CA3AF",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 8,
  },
});

export default NoticeCard;
