import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import CategoryCard from "../components/CategoryCard";
import DashboardCard from "../components/DashboardCard";
import NoticeCard from "../components/NoticeCard";
import ProfileCard from "../components/ProfileCard";
import MenuBarScreen from "../components/MenuBarScreen";
import IMAGES from "../constants/images";

const theme = {
  colors: {
    primary: "#2563EB",
    background: "#F5F7FB",
    card: "#FFFFFF",
    textPrimary: "#111827",
    textSecondary: "#6B7280",
    border: "#E5E7EB",
    green: "#E8F7E8",
    orange: "#FFF2E5",
    blue: "#EAF2FF",
    pink: "#FFECEF",
  },
  spacing: {
    page: 18,
    section: 22,
    gap: 12,
  },
};

const student = {
  name: "Anandh Sharma",
  displayName: "Mr. Rajesh Sharma",
  className: "Class 7 - B",
  rollNumber: "03",
  academicYear: "2025 - 2026",
  image: null,
};

const ACADEMIC_RECORDS = [
  { id: 1, subject: "English", marks: 98, total: 100, grade: "A+", remarks: "Outstanding" },
  { id: 2, subject: "Mathematics", marks: 99, total: 100, grade: "A+", remarks: "Outstanding" },
  { id: 3, subject: "Hindi", marks: 95, total: 100, grade: "A+", remarks: "Outstanding" },
  { id: 4, subject: "Telugu", marks: 98, total: 100, grade: "A+", remarks: "Outstanding" },
  { id: 5, subject: "Science", marks: 97, total: 100, grade: "A+", remarks: "Outstanding" },
  { id: 6, subject: "Social", marks: 96, total: 100, grade: "A+", remarks: "Outstanding" },
];

const FEE_RECORDS = [
  { id: "1", title: "Admission Fee", amount: 10000, date: "01 Jun 2025", status: "Paid" },
  { id: "2", title: "1st Term Fee", amount: 15000, date: "01 Aug 2025", status: "Paid" },
  { id: "3", title: "2nd Term Fee", amount: 15000, date: "01 Nov 2025", status: "Paid" },
  { id: "4", title: "3rd Term Fee", amount: 15000, date: "01 Feb 2026", status: "Pending" },
  { id: "5", title: "4th Term Fee", amount: 20000, date: "-", status: "Pending" },
];

const INITIAL_DASHBOARD_STATS = [
  {
    id: "attendance",
    title: "Attendance",
    value: "18/20",
    subtitle: "Days present",
    icon: "checkmark-done-outline",
    iconColor: "#16A34A",
    iconBackground: "#D8F3D8",
    backgroundColor: theme.colors.green,
    onPressScreen: "Attendance", // Add target screen for navigation
    trend: "up",
  },
  {
    id: "marks-average",
    title: "Marks Average",
    value: "80%",
    subtitle: "Average",
    icon: "document-text-outline",
    iconColor: "#EA580C",
    iconBackground: "#FFE3C2",
    backgroundColor: theme.colors.orange,
    valueColor: "#C2410C",
    onPressScreen: "Marks",
  },
  {
    id: "fee-due",
    title: "Fee Due",
    value: "12,500",
    subtitle: "Due on 5 Jun",
    icon: "card-outline",
    iconColor: "#2563EB",
    iconBackground: "#DCEAFE",
    backgroundColor: theme.colors.blue,
    valueColor: "#1D4ED8",
    onPressScreen: "FeeDetails",
  },
  {
    id: "new-notices",
    title: "New Notices",
    value: "5",
    subtitle: "New notices",
    icon: "megaphone-outline",
    iconColor: "#E11D48",
    iconBackground: "#FFE0E9",
    backgroundColor: theme.colors.pink,
    valueColor: "#DC2626",
    onPressScreen: "Notices",
  },
];

const categoryItems = [
  { id: "time-table", title: "Time table", icon: IMAGES.Time_Table, backgroundColor: "#FEF2F2", onPressScreen: "TimeTable" }, // Added for consistency
  { id: "attendance", title: "Attendance", icon: IMAGES.Attendance, backgroundColor: "#ECFDF5", onPressScreen: "Attendance" },
  { id: "exam-schedule", title: "Exam schedule", icon: IMAGES.Calender, backgroundColor: "#EFF6FF", onPressScreen: "ExamSchedule" },
  { id: "fee-details", title: "Fee Details", icon: IMAGES.Fee_Details, backgroundColor: "#FFF7ED", onPressScreen: "FeeDetails" },
  { id: "transport", title: "Transport", icon: IMAGES.Transport, backgroundColor: "#FEFCE8", onPressScreen: "Transport" },
  { id: "notices", title: "Notices", icon: IMAGES.Notices, backgroundColor: "#FDF2F8", onPressScreen: "Notices" },
  { id: "calendar", title: "Calendar", icon: IMAGES.Calender, backgroundColor: "#F0F9FF", onPressScreen: "Calendar" },
  { id: "subjects", title: "Subjects", icon: IMAGES.Subjects, backgroundColor: "#F5F3FF", onPressScreen: "Subjects" },
];

const recentNotices = [
  {
    id: "exam-schedule",
    title: "Exam Schedule Released",
    description: "Annual exams will begin from Jan 5, 2026. Check your timetable for details.",
    time: "2 hours ago",
    icon: "megaphone-outline",
    color: "#EF4444",
    backgroundColor: "#FEE2E2",
  },
  {
    id: "library",
    title: "Library Timing Update",
    description: "Library will remain open 24/7 during exam season starting Dec 20.",
    time: "1 day ago",
    icon: "book-outline",
    color: "#3B82F6",
    backgroundColor: "#DBEAFE",
  },
  {
    id: "tech-fest",
    title: "Tech Fest Registration",
    description: "Annual tech fest registrations are now open. Register before Dec 20.",
    time: "2 days ago",
    icon: "trophy-outline",
    color: "#22C55E",
    backgroundColor: "#DCFCE7",
  },
  {
    id: "zoom",
    title: "Zoom Meeting",
    description: "PTM scheduled with principal at 09:30 AM.",
    time: "21/02/2026, 09:30 AM",
    icon: "videocam-outline",
    color: "#EAB308",
    backgroundColor: "#FEF9C3",
  },
];

function Header({ topInset, onMenuPress, onNotificationPress, onProfilePress }) {
  return (
    <View style={[styles.header, { paddingTop: Math.max(topInset, 10) + 8 }]}>
      <Pressable
        onPress={onMenuPress}
        style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
        android_ripple={{ color: "rgba(37,99,235,0.08)", borderless: true }}
        accessibilityRole="button"
        accessibilityLabel="Open menu"
      >
        <Ionicons name="menu" size={24} color={theme.colors.textPrimary} />
      </Pressable>

      <View style={styles.headerTitleWrap}>
        <Text style={styles.greeting}>Good Morning</Text>
        <Text style={styles.headerName} numberOfLines={1}>
          {student.displayName}
        </Text>
      </View>

      <Pressable
        onPress={onNotificationPress}
        style={({ pressed }) => [styles.notificationButton, pressed && styles.pressed]}
        android_ripple={{ color: "rgba(37,99,235,0.08)", borderless: true }}
        accessibilityRole="button"
        accessibilityLabel="View notifications, 3 unread"
      >
        <Ionicons name="notifications-outline" size={22} color={theme.colors.primary} />
        <View style={styles.badge} />
      </Pressable>

      <Pressable 
        onPress={onProfilePress}
        style={({ pressed }) => [styles.headerAvatar, pressed && styles.pressed]}
        android_ripple={{ color: "rgba(37,99,235,0.08)", borderless: true }}
        accessible 
        accessibilityLabel="View profile"
      >
        <Text style={styles.headerAvatarText}>AS</Text>
      </Pressable>
    </View>
  );
}

function SectionHeader({ title, actionLabel, onActionPress }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel ? (
        <Pressable
          onPress={onActionPress}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Text style={styles.sectionAction}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Drawer Logic
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuAnim = useRef(new Animated.Value(0)).current; // 0 = closed, 1 = open
  const drawerWidth = width * 0.62; // Reduced width for a cleaner look

  // Dynamic Attendance Calculation Logic (Synchronized with AttendanceScreen)
  const attendanceStats = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const normalizedToday = new Date(year, month, today.getDate());

    let present = 0;
    let absent = 0;

    // Calculate stats based on actual days passed in the current month
    for (let i = 1; i <= daysInMonth; i++) {
      const dateObj = new Date(year, month, i);
      if (dateObj > normalizedToday) break; // Ignore future dates

      if (dateObj.getDay() === 0) {
        // Sunday is counted as a Holiday in AttendanceScreen logic
        continue;
      } else if (i % 12 === 0) {
        absent++;
      } else {
        present++;
      }
    }

    const totalWorkingDays = present + absent;
    const percentage = totalWorkingDays > 0 ? Math.round((present / totalWorkingDays) * 100) : 0;

    return {
      percentage,
      displayValue: `${present}/${totalWorkingDays}`,
      period: "This Month",
    };
  }, []);

  // Dynamic Marks Average Calculation Logic
  const academicStats = useMemo(() => {
    const totalObtained = ACADEMIC_RECORDS.reduce((acc, curr) => acc + curr.marks, 0);
    const totalPossible = ACADEMIC_RECORDS.reduce((acc, curr) => acc + (curr.total || 100), 0);
    const numericPercentage = (totalObtained / totalPossible) * 100;
    
    return {
      value: `${numericPercentage.toFixed(1)}%`,
      isTopPerformer: numericPercentage > 95,
    };
  }, []);

  // Dynamic Fee Due Calculation Logic
  const feeStats = useMemo(() => {
    const totalPending = FEE_RECORDS.reduce(
      (acc, item) => (item.status !== "Paid" ? acc + item.amount : acc),
      0
    );
    const nextDueItem = FEE_RECORDS.find((item) => item.status !== "Paid" && item.date !== "-");

    return {
      value: totalPending.toLocaleString("en-IN"),
      subtitle: nextDueItem ? `Due on ${nextDueItem.date.split(" ").slice(0, 2).join(" ")}` : "No upcoming dues",
    };
  }, []);

  // Memoized dashboard stats that merges dynamic academic data
  const dashboardStats = useMemo(() => {
    return INITIAL_DASHBOARD_STATS.map((stat) => {
      if (stat.id === "attendance") {
        return {
          ...stat,
          value: attendanceStats.displayValue,
          subtitle: `${attendanceStats.percentage}% attendance`,
        };
      }
      if (stat.id === "marks-average") {
        return {
          ...stat,
          value: academicStats.value,
          icon: academicStats.isTopPerformer ? "trophy-outline" : stat.icon,
          subtitle: academicStats.isTopPerformer ? "Top Performer" : "Average",
        };
      }
      if (stat.id === "fee-due") {
        return {
          ...stat,
          value: feeStats.value,
          subtitle: feeStats.subtitle,
        };
      }
      return stat;
    });
  }, [academicStats, attendanceStats, feeStats]);

  const toggleMenu = useCallback((open) => {
    if (open) setIsMenuOpen(true);
    
    Animated.spring(menuAnim, {
      toValue: open ? 1 : 0,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start(() => {
      if (!open) setIsMenuOpen(false);
    });
  }, [menuAnim]);

  const menuTranslateX = menuAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-drawerWidth, 0],
  });

  const backdropOpacity = menuAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 520,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const categoryCardWidth = useMemo(() => {
    const horizontalPadding = theme.spacing.page * 2; // Left and right padding
    const columnGap = 10 * 3;
    return Math.floor((width - horizontalPadding - columnGap) / 4);
  }, [width]);

  const renderDashboardCard = useCallback(
    (item) => (
      <DashboardCard
        key={item.id}
        item={item}
        // Dynamically navigate if onPressScreen is defined
        onPress={item.onPressScreen ? () => navigation.navigate(item.onPressScreen) : undefined}
      />
    ),
    [navigation] // Add navigation to dependencies
  );

  const renderCategory = useCallback(
    ({ item, index }) => (
      <View
        style={[
          styles.categoryItem,
          index % 4 === 0 && styles.categoryItemFirst,
          (index + 1) % 4 === 0 && styles.categoryItemLast,
        ]}
      >
        <CategoryCard
          item={item}
          width={categoryCardWidth}
          // Dynamically navigate if onPressScreen is defined
          onPress={item.onPressScreen ? () => navigation.navigate(item.onPressScreen) : undefined}
        />
      </View>
    ),
    [categoryCardWidth, navigation] // Add navigation to dependencies
  );

  const renderNotice = useCallback((item) => <NoticeCard key={item.id} item={item} />, []);

  const ListHeader = useMemo(
    () => (
      <Animated.View style={[styles.body, { opacity: fadeAnim }]}>
        <ProfileCard student={student} attendance={attendanceStats} />

        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>{dashboardStats.slice(0, 2).map(renderDashboardCard)}</View>
          <View style={styles.statsRow}>{dashboardStats.slice(2, 4).map(renderDashboardCard)}</View>
        </View>

        <SectionHeader title="Categories" />
      </Animated.View>
    ),
    [fadeAnim, renderDashboardCard, dashboardStats]
  );

  const ListFooter = useMemo(
    () => (
      <Animated.View style={[styles.body, styles.footerBody, { opacity: fadeAnim }]}>
        <SectionHeader 
          title="Recent Notices" 
          actionLabel="View All" 
          onActionPress={() => navigation.navigate("Notices")} 
        />
        <View style={styles.noticeList}>{recentNotices.map(renderNotice)}</View>
      </Animated.View>
    ),
    [fadeAnim, renderNotice, navigation]
  );

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <LinearGradient
        colors={["#EAF2FF", "#F5F7FB", "#F5F7FB"]}
        locations={[0, 0.38, 1]}
        style={StyleSheet.absoluteFill}
      />

      <Header
        topInset={insets.top}
        onMenuPress={() => toggleMenu(true)}
        onNotificationPress={() => navigation.navigate("Notices")}
        onProfilePress={() => navigation.navigate("Profile")}
      />

      <FlatList
        data={categoryItems}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        numColumns={4}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: Math.max(insets.bottom, 18) + 18,
          },
        ]}
      />

      {/* CUSTOM SIDE DRAWER SYSTEM */}
      {isMenuOpen && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {/* Overlay Backdrop */}
          <Animated.View 
            style={[
              styles.backdrop, 
              { opacity: backdropOpacity }
            ]}
          >
            <Pressable 
              style={styles.flex} 
              onPress={() => toggleMenu(false)} 
            />
          </Animated.View>

          {/* Sliding Menu Container */}
          <Animated.View
            style={[
              styles.drawerContainer,
              {
                width: drawerWidth,
                transform: [{ translateX: menuTranslateX }],
              },
            ]}
          >
            <MenuBarScreen navigation={navigation} user={student} />
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.page,
    paddingBottom: 12,
    backgroundColor: "rgba(245,247,251,0.96)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(229,231,235,0.72)",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 5,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleWrap: {
    flex: 1,
    marginLeft: 6,
    marginRight: 10,
  },
  greeting: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 2,
  },
  headerName: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "900",
  },
  notificationButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEF2F7",
    marginRight: 10,
  },
  badge: {
    position: "absolute",
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DCEAFE",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    overflow: "hidden",
  },
  headerAvatarText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.72,
  },
  scrollContent: {
    paddingTop: 16,
  },
  body: {
    paddingHorizontal: theme.spacing.page,
  },
  footerBody: {
    marginTop: 10,
  },
  statsGrid: {
    marginBottom: theme.spacing.section,
  },
  statsRow: {
    flexDirection: "row",
    gap: theme.spacing.gap,
    marginBottom: theme.spacing.gap,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "900",
  },
  sectionAction: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  categoryItem: {
    marginRight: 10,
    marginBottom: 14,
  },
  categoryItemFirst: {
    marginLeft: theme.spacing.page,
  },
  categoryItemLast: {
    marginRight: 0,
  },
  noticeList: {
    paddingBottom: 4,
  },
  flex: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    zIndex: 10,
  },
  drawerContainer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    zIndex: 11,
    borderTopRightRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 16,
  },
});
