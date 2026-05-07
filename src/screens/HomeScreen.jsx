import React, { useCallback, useEffect, useMemo, useRef } from "react";
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

import CategoryCard from "../components/CategoryCard";
import DashboardCard from "../components/DashboardCard";
import NoticeCard from "../components/NoticeCard";
import ProfileCard from "../components/ProfileCard";
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

const attendance = {
  percentage: 92,
  period: "This Month",
};

const dashboardStats = [
  {
    id: "attendance",
    title: "Attendance",
    value: "18/20",
    subtitle: "Days present",
    icon: "checkmark-done-outline",
    iconColor: "#16A34A",
    iconBackground: "#D8F3D8",
    backgroundColor: theme.colors.green,
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
  },
];

const categoryItems = [
  { id: "time-table", title: "Time table", icon: IMAGES.Time_Table, backgroundColor: "#FEF2F2" },
  { id: "attendance", title: "Attendance", icon: IMAGES.Attendance, backgroundColor: "#ECFDF5" },
  { id: "exam-schedule", title: "Exam schedule", icon: IMAGES.Calender, backgroundColor: "#EFF6FF" },
  { id: "fee-details", title: "Fee Details", icon: IMAGES.Fee_Details, backgroundColor: "#FFF7ED" },
  { id: "transport", title: "Transport", icon: IMAGES.Transport, backgroundColor: "#FEFCE8" },
  { id: "notices", title: "Notices", icon: IMAGES.Notices, backgroundColor: "#FDF2F8" },
  { id: "calendar", title: "Calendar", icon: IMAGES.Calender, backgroundColor: "#F0F9FF" },
  { id: "subjects", title: "Subjects", icon: IMAGES.Subjects, backgroundColor: "#F5F3FF" },
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

function Header({ topInset }) {
  return (
    <View style={[styles.header, { paddingTop: Math.max(topInset, 10) + 8 }]}>
      <Pressable
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
        style={({ pressed }) => [styles.notificationButton, pressed && styles.pressed]}
        android_ripple={{ color: "rgba(37,99,235,0.08)", borderless: true }}
        accessibilityRole="button"
        accessibilityLabel="View notifications, 3 unread"
      >
        <Ionicons name="notifications-outline" size={22} color={theme.colors.primary} />
        <View style={styles.badge} />
      </Pressable>

      <View style={styles.headerAvatar} accessible accessibilityLabel="Student avatar">
        <Text style={styles.headerAvatarText}>AS</Text>
      </View>
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
  const { width } = useWindowDimensions();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 520,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const categoryCardWidth = useMemo(() => {
    const horizontalPadding = theme.spacing.page * 2;
    const columnGap = 10 * 3;
    return Math.floor((width - horizontalPadding - columnGap) / 4);
  }, [width]);

  const renderDashboardCard = useCallback(
    (item) => <DashboardCard key={item.id} item={item} />,
    []
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
        <CategoryCard item={item} width={categoryCardWidth} />
      </View>
    ),
    [categoryCardWidth]
  );

  const renderNotice = useCallback((item) => <NoticeCard key={item.id} item={item} />, []);

  const ListHeader = useMemo(
    () => (
      <Animated.View style={[styles.body, { opacity: fadeAnim }]}>
        <ProfileCard student={student} attendance={attendance} />

        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>{dashboardStats.slice(0, 2).map(renderDashboardCard)}</View>
          <View style={styles.statsRow}>{dashboardStats.slice(2, 4).map(renderDashboardCard)}</View>
        </View>

        <SectionHeader title="Categories" />
      </Animated.View>
    ),
    [fadeAnim, renderDashboardCard]
  );

  const ListFooter = useMemo(
    () => (
      <Animated.View style={[styles.body, styles.footerBody, { opacity: fadeAnim }]}>
        <SectionHeader title="Recent Notices" actionLabel="View All" />
        <View style={styles.noticeList}>{recentNotices.map(renderNotice)}</View>
      </Animated.View>
    ),
    [fadeAnim, renderNotice]
  );

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <LinearGradient
        colors={["#EAF2FF", "#F5F7FB", "#F5F7FB"]}
        locations={[0, 0.38, 1]}
        style={StyleSheet.absoluteFill}
      />

      <Header topInset={insets.top} />

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
    marginBottom: 10,
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
});
