import React, { memo, useEffect, useRef } from "react";
import { Image, StyleSheet, Text, View, Animated } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useAdaptiveLayout } from "../utils/layout";

const RADIUS = 22;
const STROKE = 6;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const InitialsAvatar = memo(function InitialsAvatar({ name, image, styles }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (image) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [image]);

  if (image) {
    // Dynamically resolve source: handle URI strings vs local image requirements
    const source = typeof image === 'string' ? { uri: image } : image;
    return (
      <View style={styles.avatarContainer}>
        <Animated.Image source={source} style={[styles.avatarImage, { opacity }]} resizeMode="cover" />
        <View style={styles.avatarBorder} />
      </View>
    );
  }

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <View style={styles.avatarContainer}>
      <View style={styles.initialsAvatar}>
        <Text style={styles.initialsText}>{initials}</Text>
      </View>
      <View style={styles.avatarBorder} />
    </View>
  );
});

const AttendanceCircle = memo(function AttendanceCircle({ percentage, styles }) {
  const progress = Math.min(100, Math.max(0, percentage));
  const offset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;

  return (
    <View style={styles.progressWrap} accessible accessibilityLabel={`Attendance ${progress} percent this month`}>
      <Svg width={62} height={62} viewBox="0 0 62 62">
        <Circle
          cx="31"
          cy="31"
          r={RADIUS}
          stroke="#DCFCE7"
          strokeWidth={STROKE}
          fill="transparent"
        />
        <Circle
          cx="31"
          cy="31"
          r={RADIUS}
          stroke="#16A34A"
          strokeWidth={STROKE}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          strokeDashoffset={offset}
          rotation="-90"
          origin="31, 31"
        />
      </Svg>
      <Text style={styles.progressText}>{progress}%</Text>
    </View>
  );
});

const ProfileCard = memo(function ProfileCard({ student, attendance }) {
  const layout = useAdaptiveLayout();
  const styles = getStyles(layout);
  // Trust the dynamic image passed from parent state (HomeScreen)
  // This ensures the component is clean, flexible, and reacts instantly to prop changes
  const displayImage = student.image;

  return (
    <LinearGradient
      colors={["#B8DAFF", "#EFF7FF"]}
      start={{ x: 0.351, y: 0.5 }}
      end={{ x: 0.8654, y: 0.5 }}
      style={styles.outerCard}
    >
      <View style={styles.profileSection}>
        <InitialsAvatar name={student.name} image={displayImage} styles={styles} />
        <View style={styles.profileTextWrap}>
          <Text style={styles.studentName} numberOfLines={1}>
            {student.name || "Student Name"}
          </Text>
          <Text style={styles.studentMeta} numberOfLines={1}>
            {student.className || student.grade} {student.section ? `• ${student.section}` : ''}
          </Text>
          <Text style={styles.studentMeta} numberOfLines={1}>
            ID: {student.id} {student.rollNumber ? `• Roll No: ${student.rollNumber}` : ''}
          </Text>
        </View>
      </View>

      <View style={styles.attendanceInnerCard}>
        <View style={styles.attendanceInfo}>
          <Text style={styles.attendanceLabel}>Attendance</Text>
          <Text style={styles.attendanceSubLabel}>{attendance.period}</Text>
        </View>
        <View style={styles.attendanceVisual}>
          <AttendanceCircle percentage={attendance.percentage} styles={styles} />
        </View>
      </View>
    </LinearGradient>
  );
});

const getStyles = ({ width, spacing, typography, card, shadow, isSmallDevice, isTablet }) => StyleSheet.create({
  outerCard: {
    flexDirection: width < 370 ? "column" : "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: card.largeRadius,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
    ...shadow("lg"),
    padding: card.padding,
    marginBottom: spacing.lg,
    gap: spacing.sm,
    minHeight: isSmallDevice ? 118 : 128,
  },
  profileSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingLeft: spacing.xxs,
    minWidth: 0,
  },
  attendanceInnerCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: card.radius,
    padding: spacing.xs,
    paddingRight: spacing.xs,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    maxWidth: width < 370 ? "100%" : isTablet ? "42%" : "50%",
    alignSelf: width < 370 ? "stretch" : "auto",
    marginRight: 0, // Moves the card slightly left from the right edge
  },
  attendanceInfo: {
    marginRight: 0,
  },
  attendanceVisual: {
    transform: [{ scale: 0.85 }],
    width: isSmallDevice ? 72 : 84,
    height: isSmallDevice ? 58 : 64,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarContainer: {
    position: 'relative',
    width: isSmallDevice ? 54 : 60,
    height: isSmallDevice ? 54 : 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: isSmallDevice ? 52 : 58,
    height: isSmallDevice ? 52 : 58,
    borderRadius: isSmallDevice ? 26 : 29,
    backgroundColor: "#FFFFFF",
  },
  avatarBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1,
  },
  initialsAvatar: {
    width: isSmallDevice ? 52 : 58,
    height: isSmallDevice ? 52 : 58,
    borderRadius: isSmallDevice ? 26 : 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFF6FF",
  },
  initialsText: {
    color: "#2563EB",
    ...typography.titleSmall,
    fontWeight: "900",
  },
  profileTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  studentName: {
    color: "#111827",
    ...typography.body,
    fontWeight: "800",
    marginBottom: spacing.xxs,
  },
  studentMeta: {
    color: "#6B7280",
    ...typography.caption,
    fontWeight: "700",
  },
  attendanceLabel: {
    color: "#111827",
    ...typography.caption,
    fontWeight: "900",
  },
  attendanceSubLabel: {
    color: "#9CA3AF",
    fontSize: Math.max(9, typography.caption.fontSize - 2),
    fontWeight: "800",
    marginTop: 1,
    marginBottom: spacing.xxs,
    textTransform: "uppercase",
  },
  progressWrap: {
    width: 62,
    height: 62,
    alignItems: "center",
    justifyContent: "center",
  },
  progressText: {
    position: "absolute",
    color: "#16A34A",
    ...typography.body,
    fontWeight: "900",
  },
});

export default ProfileCard;
