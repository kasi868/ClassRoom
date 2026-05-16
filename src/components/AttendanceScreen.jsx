import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
  StatusBar,
  Animated,
  Easing,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";

const CIRCLE_RADIUS = 30;
const CIRCLE_STROKE = 6;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const details = [
  {
    date: "27 Feb 2024",
    day: "Saturday",
    status: "Present",
    color: "#22C55E",
  },
  {
    date: "28 Feb 2024",
    day: "Sunday",
    status: "Holiday",
    color: "#3B82F6",
  },
  {
    date: "29 Feb 2024",
    day: "Monday",
    status: "Present",
    color: "#22C55E",
  },
  {
    date: "30 Feb 2024",
    day: "Tuesday",
    status: "Present",
    color: "#22C55E",
  },
];

const AttendanceScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isMonthPickerVisible, setIsMonthPickerVisible] = useState(false);

  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];
    const today = new Date();
    // Normalize today for accurate comparison (midnight)
    const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Previous month padding
    for (let i = firstDayIndex; i > 0; i--) {
      days.push({ 
        day: "", 
        status: "inactive", 
        isCurrentMonth: false 
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      let status = "none";
      const dateObj = new Date(year, month, i);
      const isToday = dateObj.toDateString() === today.toDateString();

      // Comparison logic: Only process if date is not in the future
      const isFutureDate = dateObj > normalizedToday;

      if (!isFutureDate) {
        // Professional mock logic: applies only to past or current dates
        if (dateObj.getDay() === 0) {
          status = "holiday";
        } else if (i % 12 === 0) {
          status = "absent";
        } else {
          status = "present";
        }
      }

      days.push({
        day: i,
        status,
        isCurrentMonth: true,
        isToday
      });
    }

    // Next month padding to fill a 6x7 grid (42 cells)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: "", status: "inactive", isCurrentMonth: false });
    }
    return days;
  }, [currentDate]);

  const animatedProgress = useRef(new Animated.Value(0)).current;
  const [displayPercentage, setDisplayPercentage] = useState(0);
  const textScale = useRef(new Animated.Value(1)).current;

  // Calculate dynamic stats based on the generated calendar data
  const stats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let holiday = 0;

    calendarData.forEach((item) => {
      if (item.isCurrentMonth) {
        if (item.status === "present") present++;
        else if (item.status === "absent") absent++;
        else if (item.status === "holiday") holiday++;
      }
    });

    const total = present + absent;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return { present, absent, holiday, percentage };
  }, [calendarData]);

  const attendancePercentage = stats.percentage;

  // Determine the final color based on the attendance percentage
  const targetColor = useMemo(() => {
    if (attendancePercentage >= 80) return "#16A34A"; // Green
    if (attendancePercentage >= 50) return "#F59E0B"; // Orange/Yellow
    return "#DC2626"; // Red
  }, [attendancePercentage]);

  useEffect(() => {
    animatedProgress.setValue(0); // Reset animation for the new month
    textScale.setValue(1); // Reset scale
    // Add a listener to update the text state as the animation progresses
    const listenerId = animatedProgress.addListener(({ value }) => {
      setDisplayPercentage(Math.floor(value * attendancePercentage));
    });

    Animated.timing(animatedProgress, {
      toValue: 1,
      duration: 1500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // SVG props don't support native driver in standard Animated
    }).start(({ finished }) => {
      if (finished) {
        // Trigger a subtle spring bounce when the count-up completes
        Animated.sequence([
          Animated.spring(textScale, {
            toValue: 1.15,
            friction: 4,
            // Changed to false to match the JS-driven color animation on the same component
            useNativeDriver: false, 
          }),
          Animated.spring(textScale, {
            toValue: 1,
            friction: 4,
            // Changed to false to match the JS-driven color animation on the same component
            useNativeDriver: false,
          }),
        ]).start();
      }
    });

    // Cleanup listener on unmount
    return () => animatedProgress.removeListener(listenerId);
  }, [attendancePercentage, currentDate]); // Re-run when percentage or month changes

  const strokeDashoffset = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCLE_CIRCUMFERENCE, CIRCLE_CIRCUMFERENCE - (attendancePercentage / 100) * CIRCLE_CIRCUMFERENCE],
  });

  // Interpolate the color from Red to the target status color
  const dynamicColor = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["#EF4444", targetColor],
  });

  const getBackgroundColor = (status) => {
    switch (status) {
      case "present":
        return "#DDF7E4";
      case "absent":
        return "#FFE3E3";
      case "holiday":
        return "#DDE7FF";
      default:
        return "transparent";
    }
  };

  const handleMonthSelect = (monthIndex) => {
    setCurrentDate(new Date(currentDate.getFullYear(), monthIndex, 1));
    setIsMonthPickerVisible(false);
  };

  const getTextColor = (status) => {
    switch (status) {
      case "present":
        return "#15803D";
      case "absent":
        return "#DC2626";
      case "holiday":
        return "#2563EB";
      default:
        return "#B0B0B0";
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 30) }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={28} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Attendance</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* Month Selector */}
        <View style={styles.monthContainer}>
          <TouchableOpacity 
            onPress={() => setIsMonthPickerVisible(true)}
            activeOpacity={0.6}
          >
            <Text style={styles.selectMonth}>Select Month</Text>
          </TouchableOpacity>

          <View style={styles.monthRight}>
            <TouchableOpacity 
              onPress={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
              hitSlop={10}
            >
              <Ionicons
                name="chevron-back"
                size={20}
                color="#3B82F6"
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsMonthPickerVisible(true)}>
              <Text style={styles.monthText}>
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
              hitSlop={10}
            >
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#3B82F6"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {/* Circle */}
          <View style={styles.circleCard}>
            <View style={styles.circle}>
              <Svg width={72} height={72} viewBox="0 0 72 72" style={styles.circleSvg}>
                {/* Background Track */}
                <Circle
                  cx="36"
                  cy="36"
                  r={CIRCLE_RADIUS}
                  stroke="#DDF7E4"
                  strokeWidth={CIRCLE_STROKE}
                  fill="transparent"
                />
                {/* Progress Arc */}
                <AnimatedCircle
                  cx="36"
                  cy="36"
                  r={CIRCLE_RADIUS}
                  stroke={dynamicColor}
                  strokeWidth={CIRCLE_STROKE}
                  fill="transparent"
                  strokeDasharray={CIRCLE_CIRCUMFERENCE}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  rotation="-90"
                  origin="36, 36"
                />
              </Svg>
              <Animated.Text style={[styles.circlePercent, { color: dynamicColor, transform: [{ scale: textScale }] }]}>
                {displayPercentage}%
              </Animated.Text>
              <Text style={styles.circleText}>Attendance</Text>
            </View>
          </View>

          {/* Present */}
          <View style={[styles.statCard, { backgroundColor: "#E7F8EC" }]}>
            <Text style={[styles.statNumber, { color: "#16A34A" }]}>
              {stats.present}
            </Text>

            <Text style={[styles.statLabel, { color: "#16A34A" }]}>
              {stats.present === 1 ? "Present" : "Presents"}
            </Text>

            <View
              style={[styles.iconCircle, { backgroundColor: "#22C55E" }]}
            >
              <Ionicons name="checkmark" size={12} color="#fff" />
            </View>
          </View>

          {/* Absent */}
          <View style={[styles.statCard, { backgroundColor: "#FDEDED" }]}>
            <Text style={[styles.statNumber, { color: "#DC2626" }]}>
              {stats.absent}
            </Text>

            <Text style={[styles.statLabel, { color: "#DC2626" }]}>
              {stats.absent === 1 ? "Absent" : "Absents"}
            </Text>

            <View
              style={[styles.iconCircle, { backgroundColor: "#EF4444" }]}
            >
              <Ionicons name="close" size={12} color="#fff" />
            </View>
          </View>

          {/* Holiday */}
          <View style={[styles.statCard, { backgroundColor: "#EEF4FF" }]}>
            <Text style={[styles.statNumber, { color: "#2563EB" }]}>
              {stats.holiday}
            </Text>

            <Text style={[styles.statLabel, { color: "#2563EB" }]}>
              {stats.holiday === 1 ? "Holiday" : "Holidays"}
            </Text>

            <Ionicons
              name="calendar"
              size={18}
              color="#2563EB"
              style={{ marginTop: 10 }}
            />
          </View>
        </View>

        {/* Calendar */}
        <View style={styles.calendarCard}>
          <Text style={styles.monthHeading}>{MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}</Text>

          {/* Week Days */}
          <View style={styles.weekRow}>
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((item, index) => (
              <View key={index} style={styles.calendarCell}>
                <Text style={styles.weekDay}>{item}</Text>
              </View>
            ))}
          </View>

          {/* Dates */}
          <View style={styles.calendarGrid}>
            {calendarData.map((item, index) => (
              <View key={index} style={styles.calendarCell}>
                <View
                  style={[
                    styles.dateBox,
                    {
                      backgroundColor: getBackgroundColor(item.status),
                    },
                    item.isToday && styles.todayBox
                  ]}
                >
                <Text
                  style={[
                    styles.dateText,
                    {
                      color: item.isToday && item.status === "none" ? "#2563EB" : getTextColor(item.status),
                    },
                    item.isToday && { fontWeight: "800" }
                  ]}
                >
                  {item.day}
                </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Legend */}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#16A34A" }]} />
              <Text style={styles.legendText}>Present</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#DC2626" }]} />
              <Text style={styles.legendText}>Absent</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#2563EB" }]} />
              <Text style={styles.legendText}>Holiday</Text>
            </View>
          </View>
        </View>

        {/* Attendance Details */}
        <View style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <Text style={styles.detailsTitle}>
              Attendance Details
            </Text>

            <TouchableOpacity>
              <Text style={styles.viewMore}>View More</Text>
            </TouchableOpacity>
          </View>

          {details.map((item, index) => (
            <View key={index} style={styles.detailRow}>
              <Text style={styles.detailText}>{item.date}</Text>

              <Text style={styles.detailText}>{item.day}</Text>

              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: item.color },
                  ]}
                />

                <Text style={styles.detailText}>{item.status}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footerBox}>
          <MaterialCommunityIcons
            name="file-document-outline"
            size={18}
            color="#166534"
          />

          <Text style={styles.footerText}>
            Attendance is calculated based on the total working days.
          </Text>
        </View>
      </ScrollView>

      {/* Month Selection Dropdown Modal */}
      <Modal
        visible={isMonthPickerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsMonthPickerVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setIsMonthPickerVisible(false)}
        >
          <View style={styles.dropdownContainer}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>Select Month</Text>
            </View>
            <FlatList
              data={MONTHS}
              keyExtractor={(item) => item}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={[
                    styles.monthOption,
                    index === currentDate.getMonth() && styles.activeMonthOption
                  ]}
                  onPress={() => handleMonthSelect(index)}
                >
                  <Text style={[styles.monthOptionText, index === currentDate.getMonth() && styles.activeMonthOptionText]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default AttendanceScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 15,
    marginBottom: 20,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
    flex: 1,
    textAlign: "center",
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },

  headerPlaceholder: {
    width: 40,
  },

  monthContainer: {
    backgroundColor: "#F1F1F1",
    marginHorizontal: 16,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  selectMonth: {
    color: "#333",
    fontSize: 15,
  },

  monthRight: {
    flexDirection: "row",
    alignItems: "center",
  },

  monthText: {
    marginHorizontal: 8,
    color: "#2563EB",
    fontWeight: "600",
  },

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 20,
  },

  circleCard: {
    width: "24%",
    alignItems: "center",
    justifyContent: "center",
  },

  circle: {
    width: 72,
    height: 72,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  circleSvg: {
    position: "absolute",
  },

  circlePercent: {
    fontSize: 18,
    fontWeight: "700",
  },

  circleText: {
    fontSize: 9,
    color: "#444",
  },

  statCard: {
    width: "23%",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },

  statNumber: {
    fontSize: 28,
    fontWeight: "700",
  },

  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },

  iconCircle: {
    width: 18,
    height: 18,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  calendarCard: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: "#E8EDF3",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#BFD2EA",
  },

  monthHeading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 18,
  },

  weekRow: {
    flexDirection: "row",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148, 163, 184, 0.1)",
    paddingBottom: 8,
  },

  weekDay: {
    textAlign: "center",
    color: "#64748B",
    fontWeight: "800",
    fontSize: 10,
  },

  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  calendarCell: {
    width: "14.28%", // Perfect 7-column alignment
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  dateBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  todayBox: {
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#2563EB",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  skeletonBox: {
    backgroundColor: "#CBD5E1",
    borderWidth: 0,
  },

  dateText: {
    fontWeight: "600",
  },

  detailsCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 22,
    borderRadius: 16,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },

  detailsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: "#EEE",
  },

  detailsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
  },

  viewMore: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "600",
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },

  detailText: {
    fontSize: 13,
    color: "#222",
    flex: 1,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 10,
    marginRight: 8,
  },

  footerBox: {
    backgroundColor: "#EAF5EE",
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 10,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  footerText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#166534",
    marginLeft: 10,
    flex: 1,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    width: '80%',
    maxHeight: '60%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  dropdownHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'center',
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  monthOption: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  activeMonthOption: {
    backgroundColor: '#EFF6FF',
  },
  monthOptionText: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
  },
  activeMonthOptionText: {
    color: '#2563EB',
    fontWeight: '700',
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(148, 163, 184, 0.1)",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "700",
  },
});