import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";

const upcomingExams = [
  {
    id: 1,
    subject: "Mathematics",
    examType: "Term Exam",
    date: "Dec 15, 2024",
    time: "9:00 AM - 12:00 PM",
    location: "Room 301, Building A",
    reminder: "Tomorrow",
    color: "#EAF1FF",
    iconColor: "#2563EB",
    badgeColor: "#FFE8CC",
    badgeTextColor: "#F97316",
    icon: "calculator",
  },
  {
    id: 2,
    subject: "Science",
    examType: "Term Exam",
    date: "Dec 17, 2024",
    time: "1:00 PM - 3:30 PM",
    location: "Lab 102, Science Block",
    reminder: "3 days",
    color: "#F3E8FF",
    iconColor: "#9333EA",
    badgeColor: "#DBEAFE",
    badgeTextColor: "#2563EB",
    icon: "flask",
  },
  {
    id: 3,
    subject: "Telugu",
    examType: "Term Exam",
    date: "Dec 19, 2024",
    time: "10:00 AM - 1:00 PM",
    location: "Room 205, Building B",
    reminder: "5 days",
    color: "#DCFCE7",
    iconColor: "#16A34A",
    badgeColor: "#DBEAFE",
    badgeTextColor: "#2563EB",
    icon: "leaf",
  },
  {
    id: 4,
    subject: "English Literature",
    examType: "Term Exam",
    date: "Dec 24, 2024",
    time: "2:00 PM - 4:30 PM",
    location: "Room 108, Building C",
    reminder: "",
    color: "#FEF3C7",
    iconColor: "#CA8A04",
    badgeColor: "#DBEAFE",
    badgeTextColor: "#2563EB",
    icon: "translate", // Fixed MaterialCommunityIcon name
  },
];

const laterExams = [
  {
    id: 5,
    subject: "Physics",
    examType: "Final Exam",
    date: "Jan 22, 2025",
    time: "9:00 AM - 12:00 PM",
    location: "Room 401, Building A",
    color: "#FEE2E2",
    iconColor: "#DC2626",
    icon: "atom",
  },
];

const ExamCard = ({ item }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.card}
    >
      {/* Top */}
      <View style={styles.topRow}>
        <View style={styles.leftSection}>
          <View
            style={[
              styles.iconBox,
              { backgroundColor: item.color },
            ]}
          >
            <MaterialCommunityIcons
              name={item.icon}
              size={20}
              color={item.iconColor}
            />
          </View>

          <View>
            <Text style={styles.subject}>
              {item.subject}
            </Text>

            <Text style={styles.examType}>
              {item.examType}
            </Text>
          </View>
        </View>

        {item.reminder ? (
          <View
            style={[
              styles.badge,
              { backgroundColor: item.badgeColor },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: item.badgeTextColor },
              ]}
            >
              {item.reminder}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Date & Time */}
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons
            name="calendar-outline"
            size={14}
            color="#2563EB"
          />

          <Text style={styles.infoText}>
            {item.date}
          </Text>
        </View>

        <View style={styles.infoItem}>
          <Ionicons
            name="time-outline"
            size={14}
            color="#2563EB"
          />

          <Text style={styles.infoText}>
            {item.time}
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Bottom */}
      <View style={styles.bottomRow}>
        <Text style={styles.location}>
          {item.location}
        </Text>

        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.reminderText}>
            Set Reminder
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const ExamScheduleScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const totalExams = useMemo(() => {
    return upcomingExams.length + laterExams.length;
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

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
          <Text style={styles.headerTitle}>Exam Schedule</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* Upcoming */}
        <View style={styles.sectionHeader}>
          <View style={styles.blueLine} />

          <Text style={styles.sectionTitle}>
            Upcoming Exams
          </Text>
        </View>

        {upcomingExams.map((item) => (
          <ExamCard key={item.id} item={item} />
        ))}

        {/* Later This Month */}
        <View
          style={[
            styles.sectionHeader,
            { marginTop: 18 },
          ]}
        >
          <View
            style={[
              styles.blueLine,
              { backgroundColor: "#9CA3AF" },
            ]}
          />

          <Text style={styles.sectionTitle}>
            Later This Month
          </Text>
        </View>

        {laterExams.map((item) => (
          <ExamCard key={item.id} item={item} />
        ))}

        {/* Preparation Card */}
        <View style={styles.tipCard}>
          <View style={styles.tipTop}>
            <View style={styles.tipIcon}>
              <FontAwesome5
                name="lightbulb"
                size={14}
                color="#fff"
              />
            </View>

            <Text style={styles.tipTitle}>
              Exam Preparation Tips
            </Text>
          </View>

          <Text style={styles.tipDescription}>
            Start preparing early and create a
            study schedule for better results
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.materialButton}
            onPress={() => navigation.navigate("Subjects")}
          >
            <Text style={styles.materialButtonText}>
              View Study Materials
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default ExamScheduleScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
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

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 14,
    marginBottom: 14,
  },

  blueLine: {
    width: 3,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#2563EB",
    marginRight: 8,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 14,
    marginBottom: 14,
    borderRadius: 18,
    padding: 14,

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 3,

    borderWidth: 1,
    borderColor: "#ECECEC",
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  subject: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },

  examType: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },

  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 18,
  },

  infoText: {
    fontSize: 12,
    color: "#4B5563",
    marginLeft: 6,
    fontWeight: "500",
  },

  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 14,
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  location: {
    fontSize: 11,
    color: "#6B7280",
    flex: 1,
  },

  reminderText: {
    fontSize: 12,
    color: "#4F46E5",
    fontWeight: "600",
  },

  tipCard: {
    marginHorizontal: 14,
    marginTop: 12,
    borderRadius: 18,
    padding: 18,
    backgroundColor: "#4338CA",
  },

  tipTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  tipIcon: {
    width: 26,
    height: 26,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  tipTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  tipDescription: {
    color: "#E0E7FF",
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 18,
  },

  materialButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },

  materialButtonText: {
    color: "#4F46E5",
    fontSize: 14,
    fontWeight: "700",
  },
});