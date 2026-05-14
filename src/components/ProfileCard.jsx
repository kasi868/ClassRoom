import React, { memo, useState, useEffect, useRef } from "react";
import { Image, StyleSheet, Text, View, Animated } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";

const RADIUS = 22;
const STROKE = 6;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const InitialsAvatar = memo(function InitialsAvatar({ name, image }) {
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

const AttendanceCircle = memo(function AttendanceCircle({ percentage }) {
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
  const [displayImage, setDisplayImage] = useState(student.image);
  const isFocused = useIsFocused();

  // Fetch latest image from AsyncStorage whenever the screen is focused
  useEffect(() => {
    const syncProfileImage = async () => {
      try {
        const storedImage = await AsyncStorage.getItem("@user_profile_image");
        if (storedImage) {
          setDisplayImage(storedImage);
        }
      } catch (error) {
        console.error("ProfileCard: Failed to load stored image", error);
      }
    };

    if (isFocused) syncProfileImage();
  }, [isFocused]);

  return (
    <LinearGradient
      colors={["#B8DAFF", "#EFF7FF"]}
      start={{ x: 0.351, y: 0.5 }}
      end={{ x: 0.8654, y: 0.5 }}
      style={styles.outerCard}
    >
      <View style={styles.profileSection}>
        <InitialsAvatar name={student.name} image={displayImage} />
        <View style={styles.profileTextWrap}>
          <Text style={styles.studentName} numberOfLines={1}>
            {student.name}
          </Text>
          <Text style={styles.studentMeta} numberOfLines={1}>
            {student.className} • No. {student.rollNumber}
          </Text>
          <Text style={styles.studentMeta} numberOfLines={1}>
            {student.academicYear}
          </Text>
        </View>
      </View>

      <View style={styles.attendanceInnerCard}>
        <View style={styles.attendanceInfo}>
          <Text style={styles.attendanceLabel}>Attendance</Text>
          <Text style={styles.attendanceSubLabel}>{attendance.period}</Text>
        </View>
        <View style={styles.attendanceVisual}>
          <AttendanceCircle percentage={attendance.percentage} />
        </View>
      </View>
    </LinearGradient>
  );
});

const styles = StyleSheet.create({
  outerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 6,
    padding: 16,
    marginBottom: 20,
    gap: 10,
    minHeight: 128,
  },
  profileSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingLeft: 4,
  },
  attendanceInnerCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 20,
    padding: 10,
    paddingRight: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    maxWidth: "48%",
    marginRight: 6, // Moves the card slightly left from the right edge
  },
  attendanceInfo: {
    marginRight: 4,
  },
  attendanceVisual: {
    transform: [{ scale: 0.85 }],
    width: 84,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarContainer: {
    position: 'relative',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 58,
    height: 58,
    borderRadius: 29,
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
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFF6FF",
  },
  initialsText: {
    color: "#2563EB",
    fontSize: 17,
    fontWeight: "900",
  },
  profileTextWrap: {
    flex: 1,
  },
  studentName: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 4,
  },
  studentMeta: {
    color: "#6B7280",
    fontSize: 10.5,
    lineHeight: 15,
    fontWeight: "700",
  },
  attendanceLabel: {
    color: "#111827",
    fontSize: 11,
    fontWeight: "900",
  },
  attendanceSubLabel: {
    color: "#9CA3AF",
    fontSize: 9,
    fontWeight: "800",
    marginTop: 1,
    marginBottom: 5,
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
    fontSize: 14,
    fontWeight: "900",
  },
});

export default ProfileCard;
