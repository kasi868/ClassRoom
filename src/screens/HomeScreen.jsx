import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Pressable,
  SafeAreaView,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import CategoryCard from "../components/CategoryCard";
import DashboardCard from "../components/DashboardCard";
import NoticeCard from "../components/NoticeCard";
import ProfileCard from "../components/ProfileCard";
import MenuBarScreen from "../components/MenuBarScreen";
import IMAGES from "../constants/images";
import { useResponsive } from "../constants/useResponsive";

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

const STORAGE_KEYS = {
  STUDENT_IMAGE: "@student_profile_image",
  PARENT_IMAGE: "@parent_profile_image",
  PARENT_PREFS: "@parent_preferences",
  GUARDIAN_PREFIX: "@guardian_image_",
  STUDENT_DATA: "@student_data",
  GUARDIAN_DATA_PREFIX: "@guardian_data_",
};

const student = {
  name: "Anandh Sharma",
  displayName: "Anandh Sharma",
  className: "Class 7 - B",
  rollNumber: "03",
  academicYear: "2025 - 2026",
  image: "https://randomuser.me/api/portraits/men/12.jpg", // Student-appropriate portrait
};

const GUARDIANS = [
  {
    id: 1,
    name: "Michael Johnson",
    relation: "Father",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    color: "#2563EB",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    relation: "Mother",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    color: "#EC4899",
  },
  {
    id: 3,
    name: "Jennifer Smith",
    relation: "Emergency Contact",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    color: "#22C55E",
  },
];

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

function Header({ topInset, onMenuPress, onNotificationPress, onProfilePress, parent }) {
  const layout = useResponsive();
  const styles = useMemo(() => createStyles(layout), [layout]);

  const titlePrefix = useMemo(() => {
    const relation = (parent?.relation || "").toLowerCase();
    if (relation.includes("father") || relation.includes("uncle")) return "Mr. ";
    if (relation.includes("mother")) return "Mrs. ";
    if (relation.includes("aunt")) return "Ms. ";
    return "";
  }, [parent?.relation]);

  const timeGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 21) return "Good Evening";
    return "Good Night";
  }, []);

  const initials = (parent?.name || "User")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

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
        <Text style={styles.greeting}>{timeGreeting}</Text>
        <Text style={styles.headerName} numberOfLines={1}>
          {titlePrefix}{parent?.name}
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
        {parent?.image ? (
          <Image source={{ uri: parent.image }} style={styles.headerAvatarImage} />
        ) : (
          <Text style={styles.headerAvatarText}>{initials}</Text>
        )}
      </Pressable>
    </View>
  );
}

function SectionHeader({ title, actionLabel, onActionPress }) {
  const layout = useResponsive();
  const styles = useMemo(() => createStyles(layout), [layout]);

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
  const layout = useResponsive();
  const { width, isTablet, spacing, gridColumns, gridItemWidth } = layout;
  const styles = useMemo(() => createStyles(layout), [layout]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const containerMaxWidth = 1200;

  // Drawer Logic
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuAnim = useRef(new Animated.Value(0)).current; // 0 = closed, 1 = open
  const drawerWidth = Math.min(width * (isTablet ? 0.42 : 0.78), 420);

  const [userProfileImage, setUserProfileImage] = useState(student.image);
  const [dynamicStudent, setDynamicStudent] = useState({
    name: student.name,
    className: student.className,
    rollNumber: "03",
    academicYear: student.academicYear,
    section: "Section B",
    id: "ST2024001",
  });
  const [dynamicParent, setDynamicParent] = useState(null);

  // Dynamic Guardian Priority Logic: Father > Mother > Emergency Contact
  const defaultGuardian = useMemo(() => {
    const father = GUARDIANS.find(g => g.relation === "Father");
    if (father) return father;
    
    const mother = GUARDIANS.find(g => g.relation === "Mother");
    if (mother) return mother;

    return GUARDIANS.find(g => g.relation.includes("Emergency")) || GUARDIANS[0];
  }, []);

  const primaryGuardian = useMemo(() => {
    return dynamicParent || defaultGuardian;
  }, [defaultGuardian, dynamicParent]);

  const loadStoredData = useCallback(async () => {
    try {
      // Fetch Student Data & Image
      const [savedStudentImg, savedStudentData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.STUDENT_IMAGE),
        AsyncStorage.getItem(STORAGE_KEYS.STUDENT_DATA),
      ]);

      if (savedStudentImg) setUserProfileImage(savedStudentImg);
      
      try {
        if (savedStudentData) {
          const parsed = JSON.parse(savedStudentData);
          if (parsed && typeof parsed === 'object') {
            setDynamicStudent(prev => ({ 
              ...prev, 
              ...parsed,
              // Mapping 'grade' from Profile Screen to 'className' for internal consistency
              className: parsed.grade || parsed.className || prev.className,
            }));
          }
        }
      } catch (parseError) {
        console.error("HomeScreen: Student data parse error", parseError);
        // Fallback handled by keeping initial state
      }

      // Fetch Primary Guardian (Priority: Father ID 1)
      const gId = 1; 
      const [gImg, gData] = await Promise.all([
        AsyncStorage.getItem(`${STORAGE_KEYS.GUARDIAN_PREFIX}${gId}`),
        AsyncStorage.getItem(`${STORAGE_KEYS.GUARDIAN_DATA_PREFIX}${gId}`),
      ]);

      if (gImg || gData) {
        const parsedData = gData ? JSON.parse(gData) : {};
        const baseGuardian = GUARDIANS.find(g => g.id === gId) || GUARDIANS[0];
        
        setDynamicParent({
          ...baseGuardian,
          ...parsedData,
          image: gImg || baseGuardian.image,
        });
      }
      
    } catch (e) {
      console.error("Failed to load stored preferences", e);
    }
  }, []);

  useEffect(() => {
    loadStoredData();
    // Refresh data when returning to screen to reflect updates from ProfileScreen
    return navigation.addListener('focus', loadStoredData);
  }, [navigation, loadStoredData]);

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

  const categoryColumns = gridColumns("category");
  const dashboardColumns = gridColumns("dashboard");

  const categoryCardWidth = useMemo(
    () => gridItemWidth(categoryColumns, spacing.page, spacing.gap, containerMaxWidth),
    [categoryColumns, gridItemWidth, spacing.gap, spacing.page]
  );

  const dashboardRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < dashboardStats.length; i += dashboardColumns) {
      rows.push(dashboardStats.slice(i, i + dashboardColumns));
    }
    return rows;
  }, [dashboardColumns, dashboardStats]);

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
          index % categoryColumns === 0 && styles.categoryItemFirst,
          (index + 1) % categoryColumns === 0 && styles.categoryItemLast,
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
    [categoryCardWidth, categoryColumns, navigation, styles] // Add navigation to dependencies
  );

  const renderNotice = useCallback((item) => <NoticeCard key={item.id} item={item} />, []);

  const ListHeader = useMemo(
    () => (
      <Animated.View style={[styles.body, { opacity: fadeAnim }]}>
        <ProfileCard student={{ ...dynamicStudent, image: userProfileImage }} attendance={attendanceStats} />

        <View style={styles.statsGrid}>
          {dashboardRows.map((row, index) => (
            <View key={`dashboard-row-${index}`} style={styles.statsRow}>
              {row.map(renderDashboardCard)}
              {row.length < dashboardColumns
                ? Array.from({ length: dashboardColumns - row.length }).map((_, fillerIndex) => (
                    <View key={`dashboard-filler-${fillerIndex}`} style={styles.statsFiller} />
                  ))
                : null}
            </View>
          ))}
        </View>

        <SectionHeader title="Categories" />
      </Animated.View>
    ), [attendanceStats, dashboardColumns, dashboardRows, fadeAnim, renderDashboardCard, styles, userProfileImage]);

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
        parent={primaryGuardian}
      />

      <FlatList
        data={categoryItems}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        numColumns={categoryColumns}
        key={`categories-${categoryColumns}`}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews
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

const createStyles = ({ spacing, typography, card, shadow, isSmallDevice, contentWidth }) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.page,
    paddingBottom: spacing.sm,
    backgroundColor: "rgba(245,247,251,0.96)",
    maxWidth: contentWidth,
    alignSelf: 'center',
    borderBottomWidth: 1,
    borderBottomColor: "rgba(229,231,235,0.72)",
    ...shadow("md"),
    zIndex: 5,
    width: "100%",
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleWrap: {
    flex: 1,
    marginLeft: spacing.xs,
    marginRight: spacing.xs,
    minWidth: 0,
  },
  greeting: {
    color: theme.colors.textSecondary,
    ...typography.caption,
    fontWeight: "700",
    marginBottom: spacing.xxs,
  },
  headerName: {
    color: theme.colors.textPrimary,
    ...typography.titleSmall,
    fontWeight: "900",
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEF2F7",
    marginRight: spacing.xs,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DCEAFE",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    overflow: "hidden",
  },
  headerAvatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 22,
    backgroundColor: "#DCEAFE",
  },
  headerAvatarText: {
    color: theme.colors.primary,
    ...typography.bodySmall,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.72,
  },
  scrollContent: {
    paddingTop: spacing.md,
    alignSelf: "center",
    width: "100%",
    maxWidth: contentWidth,
  },
  body: {
    paddingHorizontal: spacing.page,
  },
  footerBody: {
    marginTop: spacing.xs,
  },
  statsGrid: {
    marginBottom: spacing.section,
  },
  statsGridTablet: {
    flexDirection: 'row',
    gap: 12,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.gap,
    marginBottom: spacing.gap,
  },
  statsFiller: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    ...typography.bodyLarge,
    fontWeight: "900",
    flexShrink: 1,
  },
  sectionAction: {
    color: theme.colors.primary,
    ...typography.label,
    fontWeight: "900",
  },
  categoryItem: {
    marginRight: spacing.gap,
    marginBottom: spacing.sm,
  },
  categoryItemFirst: {
    marginLeft: spacing.page,
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
    borderTopRightRadius: card.largeRadius,
    borderBottomRightRadius: card.largeRadius,
    overflow: "hidden",
    ...shadow("lg"),
  },
});
