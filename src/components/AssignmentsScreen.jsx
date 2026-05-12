import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  Ionicons,
  MaterialCommunityIcons,
  Feather,
} from "@expo/vector-icons";

const liveAssignments = [
  {
    id: 1,
    subject: "Mathematics",
    topic: "Algebraic Expressions",
    description:
      "Choose the correct answers for the given questions",
    assigned: "Today, 09:00 AM",
    due: "Jul 15 2024, 11:59 PM",
    badge: "Today",
    badgeColor: "#FFE9D5",
    badgeTextColor: "#F97316",
    icon: "calculator",
    iconColor: "#2563EB",
    iconBg: "#E8F0FF",
  },
];

const upcomingAssignments = [
  {
    id: 2,
    subject: "Social Studies",
    topic: "Nationalism in India",
    description:
      "Choose the correct answers for the given questions",
    due: "Jul 15 2024, 11:59 PM",
    badge: "Tomorrow",
    badgeColor: "#FFE9D5",
    badgeTextColor: "#F97316",
    icon: "earth",
    iconColor: "#3B82F6",
    iconBg: "#E8F0FF",
  },
  {
    id: 3,
    subject: "Science",
    topic: "Chemical Reactions",
    description:
      "Choose the correct answers for the given questions",
    due: "Jul 15 2024, 11:59 PM",
    badge: "5 Days Left",
    badgeColor: "#FFE9D5",
    badgeTextColor: "#F97316",
    icon: "flask",
    iconColor: "#2563EB",
    iconBg: "#EEF2FF",
  },
  {
    id: 4,
    subject: "Mathematics",
    topic: "Algebraic Expressions",
    description:
      "Choose the correct answers for the given questions",
    due: "Jul 15 2024, 11:59 PM",
    badge: "8 Days Left",
    badgeColor: "#FFE9D5",
    badgeTextColor: "#F97316",
    icon: "calculator",
    iconColor: "#2563EB",
    iconBg: "#E8F0FF",
  },
];

const completedAssignments = [
  {
    id: 5,
    subject: "Mathematics",
    topic: "Algebraic Expressions",
    description:
      "Choose the correct answers for the given questions",
    assigned: "Jul 09 2024, 09:00 AM",
    result: "Obtained Marks : 25/30",
    resultColor: "#16A34A",
    icon: "calculator",
    iconColor: "#2563EB",
    iconBg: "#E8F0FF",
  },
  {
    id: 6,
    subject: "Science",
    topic: "Force and Friction",
    description:
      "Choose the correct answers for the given questions",
    assigned: "Jul 10 2024, 09:00 AM",
    result: "Evaluation Pending",
    resultColor: "#F97316",
    icon: "flask",
    iconColor: "#2563EB",
    iconBg: "#EEF2FF",
  },
];

const AssignmentCard = ({
  item,
  live,
  completed,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.card}
    >
      {/* Top */}
      <View style={styles.topRow}>
        <View style={styles.leftRow}>
          <View
            style={[
              styles.iconBox,
              { backgroundColor: item.iconBg },
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

            <Text style={styles.topic}>
              {item.topic}
            </Text>
          </View>
        </View>

        {!completed ? (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: item.badgeColor,
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                {
                  color: item.badgeTextColor,
                },
              ]}
            >
              {item.badge}
            </Text>
          </View>
        ) : (
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>
              Completed
            </Text>
          </View>
        )}
      </View>

      {/* Description */}
      <Text style={styles.description}>
        {item.description}
      </Text>

      {/* Info */}
      {!completed ? (
        <View style={styles.infoRow}>
          {live ? (
            <View style={styles.infoItem}>
              <Ionicons
                name="time-outline"
                size={13}
                color="#2563EB"
              />

              <Text style={styles.infoText}>
                Assigned Today, 09:00 AM
              </Text>
            </View>
          ) : (
            <View style={styles.infoItem}>
              <Ionicons
                name="calendar-outline"
                size={13}
                color="#2563EB"
              />

              <Text style={styles.infoText}>
                Due Jul 15 2024, 11:59 PM
              </Text>
            </View>
          )}

          {live && (
            <View style={styles.infoItem}>
              <Ionicons
                name="calendar-outline"
                size={13}
                color="#2563EB"
              />

              <Text style={styles.infoText}>
                Due Jul 15 2024, 11:59 PM
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.completedBottom}>
          <View style={styles.infoItem}>
            <Ionicons
              name="time-outline"
              size={13}
              color="#8C8C8C"
            />

            <Text style={styles.completedInfoText}>
              Assigned Jul 09 2024, 09:00 AM
            </Text>
          </View>

          <Text
            style={[
              styles.resultText,
              { color: item.resultColor },
            ]}
          >
            {item.result}
          </Text>
        </View>
      )}

      {/* Button */}
      {live && (
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.button}
        >
          <Text style={styles.buttonText}>
            Open Assignment
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const AssignmentsScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState(
    "upcoming"
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
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
          <Text style={styles.headerTitle}>Assignments</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab("upcoming")}
            style={[
              styles.tab,
              activeTab === "upcoming" &&
                styles.activeTab,
            ]}
          >
            <Feather
              name="edit"
              size={14}
              color={
                activeTab === "upcoming"
                  ? "#fff"
                  : "#666"
              }
            />

            <Text
              style={[
                styles.tabText,
                activeTab === "upcoming" &&
                  styles.activeTabText,
              ]}
            >
              Upcoming Assignments
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab("completed")}
            style={[
              styles.tab,
              activeTab === "completed" &&
                styles.activeTab,
            ]}
          >
            <Ionicons
              name="document-text-outline"
              size={14}
              color={
                activeTab === "completed"
                  ? "#fff"
                  : "#666"
              }
            />

            <Text
              style={[
                styles.tabText,
                activeTab === "completed" &&
                  styles.activeTabText,
              ]}
            >
              Completed Assignments
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "upcoming" ? (
          <>
            {/* Live Assignments */}
            <View style={styles.sectionHeader}>
              <View style={styles.line} />

              <Text style={styles.sectionTitle}>
                Live Assignments
              </Text>
            </View>

            {liveAssignments.map((item) => (
              <AssignmentCard
                key={item.id}
                item={item}
                live
              />
            ))}

            {/* Upcoming */}
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionLeft}>
                <View style={styles.line} />

                <Text style={styles.sectionTitle}>
                  Upcoming Assignments
                </Text>
              </View>

              <TouchableOpacity>
                <Text style={styles.viewAll}>
                  View All
                </Text>
              </TouchableOpacity>
            </View>

            {upcomingAssignments.map((item) => (
              <AssignmentCard
                key={item.id}
                item={item}
              />
            ))}
          </>
        ) : (
          <>
            {/* Completed */}
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionLeft}>
                <View style={styles.line} />

                <Text style={styles.sectionTitle}>
                  Completed Assignments
                </Text>
              </View>

              <TouchableOpacity>
                <Text style={styles.viewAll}>
                  View All
                </Text>
              </TouchableOpacity>
            </View>

            {completedAssignments.map((item) => (
              <AssignmentCard
                key={item.id}
                item={item}
                completed
              />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default AssignmentsScreen;

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

  tabsContainer: {
    flexDirection: "row",
    marginHorizontal: 14,
    marginBottom: 24,
  },

  tab: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginRight: 8,
  },

  activeTab: {
    backgroundColor: "#2563EB",
  },

  tabText: {
    marginLeft: 6,
    fontSize: 11,
    color: "#666",
    fontWeight: "600",
  },

  activeTabText: {
    color: "#fff",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 14,
    marginBottom: 14,
  },

  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 14,
    marginTop: 10,
    marginBottom: 14,
  },

  sectionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  line: {
    width: 3,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#2563EB",
    marginRight: 8,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },

  viewAll: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 14,
    marginBottom: 16,
    borderRadius: 18,
    padding: 14,

    borderWidth: 1,
    borderColor: "#ECECEC",

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 3,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  leftRow: {
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
    color: "#2563EB",
  },

  topic: {
    fontSize: 12,
    color: "#374151",
    marginTop: 2,
  },

  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },

  completedBadge: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },

  completedText: {
    fontSize: 11,
    color: "#444",
    fontWeight: "600",
  },

  description: {
    marginTop: 12,
    fontSize: 11,
    color: "#8C8C8C",
    lineHeight: 18,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },

  infoItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  infoText: {
    fontSize: 10,
    color: "#666",
    marginLeft: 5,
  },

  completedBottom: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  completedInfoText: {
    fontSize: 10,
    color: "#8C8C8C",
    marginLeft: 5,
  },

  resultText: {
    fontSize: 11,
    fontWeight: "700",
  },

  button: {
    alignSelf: "center",
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#3B82F6",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 22,
  },

  buttonText: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "600",
  },
});