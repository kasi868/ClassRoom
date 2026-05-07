import React, { memo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";

const RADIUS = 22;
const STROKE = 6;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const InitialsAvatar = memo(function InitialsAvatar({ name, image }) {
  if (image) {
    return <Image source={image} style={styles.avatarImage} resizeMode="cover" />;
  }

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <View style={styles.initialsAvatar}>
      <Text style={styles.initialsText}>{initials}</Text>
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
  return (
    <LinearGradient
      colors={["#B8DAFF", "#EFF7FF"]}
      start={{ x: 0.351, y: 0.5 }}
      end={{ x: 0.8654, y: 0.5 }}
      style={styles.outerCard}
    >
      <View style={styles.profileSection}>
        <InitialsAvatar name={student.name} image={student.image} />
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
    marginRight: 26, // Moves the card slightly left from the right edge
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
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#EAF2FF",
  },
  initialsAvatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DCEAFE",
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
