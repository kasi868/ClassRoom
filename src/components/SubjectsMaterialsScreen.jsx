﻿import React, { useState, useCallback, useMemo, useRef, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  LayoutAnimation,
  UIManager,
  FlatList,
  Pressable,
} from "react-native";
import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
  Ionicons,
  MaterialCommunityIcons,
  Feather,
} from "@expo/vector-icons";

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const tabs = [
  {
    id: "notes",
    title: "Subject Notes",
    icon: "book-outline",
  },
  {
    id: "resources",
    title: "Other Resources",
    icon: "briefcase-outline",
  },
];

export const subjectCards = [
  {
    id: 1,
    title: "Mathematics",
    subtitle: "6 chapters of concept notes",
    icon: "calculator",
    color: "#3B82F6",
    bg: "#EAF2FF",
  },
  {
    id: 2,
    title: "Science",
    subtitle: "8 chapters of experiments and theory",
    icon: "flask",
    color: "#A855F7",
    bg: "#F3E8FF",
  },
  {
    id: 3,
    title: "Social Studies",
    subtitle: "6 chapters of history and geography",
    icon: "earth",
    color: "#EF4444",
    bg: "#FFECEC",
  },
  {
    id: 4,
    title: "Computer",
    subtitle: "5 chapters of programming fundamentals",
    icon: "monitor",
    color: "#22C55E",
    bg: "#E9FFF1",
  },
  {
    id: 5,
    title: "English",
    subtitle: "6 chapters of grammar and prose",
    icon: "translate",
    color: "#D4A017",
    bg: "#FFF6DA",
  },
];

const resourceCards = [
  {
    id: 1,
    title: "Previous Mathematics Question Papers",
    subtitle: "Term 1, Term 2, Quarterly, Halfyearly",
    meta: "PDF · 67 MB",
    icon: "file-pdf-box",
    color: "#F40F02", // Adobe Acrobat Red
    bg: "#FFF1F0",
  },
  {
    id: 2,
    title: "Previous Science Question Papers",
    subtitle: "Term 1, Term 2, Quarterly, Halfyearly",
    meta: "PDF · 67 MB",
    icon: "file-pdf-box",
    color: "#F40F02",
    bg: "#FFF1F0",
  },
  {
    id: 3,
    title: "Previous Telugu Question Papers",
    subtitle: "Term 1, Term 2, Quarterly, Halfyearly",
    meta: "PDF · 67 MB",
    icon: "file-pdf-box",
    color: "#F40F02",
    bg: "#FFF1F0",
  },
  {
    id: 4,
    title: "Previous Social Question Papers",
    subtitle: "Term 1, Term 2, Quarterly, Halfyearly",
    meta: "PDF · 67 MB",
    icon: "file-pdf-box",
    color: "#F40F02",
    bg: "#FFF1F0",
  },
  {
    id: 5,
    title: "Previous Hindi Question Papers",
    subtitle: "Term 1, Term 2, Quarterly, Halfyearly",
    meta: "PDF · 67 MB",
    icon: "file-pdf-box",
    color: "#F40F02",
    bg: "#FFF1F0",
  },
];

const recentFiles = [
  {
    id: 1,
    title: "Mathematics - Chapter 5",
    subtitle: "Understanding Algebraic Expressions",
    meta: "18 May 2025 · PDF · 12 MB",
    icon: "file-pdf-box",
    color: "#F40F02",
    bg: "#FFF1F0",
  },
  {
    id: 2,
    title: "Science - Chapter 3",
    subtitle: "Cell Structure and Functions",
    meta: "18 May 2025 · PDF · 12 MB",
    icon: "file-pdf-box",
    color: "#F40F02",
    bg: "#FFF1F0",
  },
];

const TabCard = ({ item, isActive, onPress }) => (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={onPress}
    style={[styles.tabButton, isActive && styles.activeTab]}
  >
    <Ionicons
      name={item.icon}
      size={15}
      color={isActive ? "#FFF" : "#666"}
    />
    <Text style={[styles.tabText, isActive && styles.activeTabText]}>
      {item.title}
    </Text>
  </TouchableOpacity>
);

const CardItem = memo(({ item, isResource }) => (
  <Pressable
    onPress={() => {}}
    style={({ pressed }) => [styles.cardItem, pressed && styles.cardPressed]}
  >
    <View style={styles.cardLeft}>
      <View
        style={[
          styles.cardIconContainer,
          { backgroundColor: item.bg || "#F1F5F9" },
        ]}
      >
        <MaterialCommunityIcons name={item.icon} size={26} color={item.color} />
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
        {isResource && <Text style={styles.cardMeta}>{item.meta}</Text>}
      </View>
    </View>
    <Feather name={isResource ? "download" : "chevron-right"} size={20} color="#444" />
  </Pressable>
));

const SubjectsMaterialsScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("notes");

  const data = useMemo(
    () => (activeTab === "notes" ? subjectCards : resourceCards),
    [activeTab]
  );

  const handleTabChange = useCallback((id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveTab(id);
  }, []);

  const infoText =
    activeTab === "notes"
      ? "Browse subject notes by chapter. Tap on any note to view or download."
      : "Find the latest resources, question papers and reference materials for every subject.";

  const sectionTitle = activeTab === "notes" ? "Subjects" : "Resources";

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}> 
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={Platform.OS === 'android'}
        initialNumToRender={6}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 30) }}
        ListHeaderComponent={
          <>
            <View style={styles.headerContainer}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-back" size={28} color="#111" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Subjects & Materials</Text>
              <View style={styles.headerPlaceholder} />
            </View>

            <View style={styles.tabContainer}>
              {tabs.map((tab) => (
                <TabCard
                  key={tab.id}
                  item={tab}
                  isActive={activeTab === tab.id}
                  onPress={() => handleTabChange(tab.id)}
                />
              ))}
            </View>

            <View style={styles.sectionHeader}>
              <View style={styles.sectionIndicator} />
              <Text style={styles.sectionTitle}>{sectionTitle}</Text>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.contentGrid}>
            <CardItem
              item={item}
              isResource={activeTab === "resources"}
            />
          </View>
        )}
        ListFooterComponent={
          <>
            <View style={styles.infoCard}>
              <View style={styles.infoTop}>
                <Ionicons name="information-circle-outline" size={18} color="#3B82F6" />
                <Text style={styles.infoTitle}>How it works</Text>
              </View>
              <Text style={styles.infoDescription}>{infoText}</Text>
            </View>

            <View style={styles.recentHeader}>
              <View style={styles.recentLeft}>
                <View style={styles.sectionIndicator} />
                <Text style={styles.sectionTitle}>Recently Viewed</Text>
              </View>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.filesContainer}>
              {recentFiles.map((item) => (
                <CardItem key={item.id} item={item} isResource />
              ))}
            </View>
          </>
        }
      />
    </View>
  );
};

export default SubjectsMaterialsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FB",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 15,
    marginBottom: 25,
  },
  headerTitle: {
    fontSize: 20,
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
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginBottom: 24,
  },
  tabButton: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F2F5",
    paddingVertical: 14,
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: "#2D7FF9",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginLeft: 8,
  },
  activeTabText: {
    color: "#FFF",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 18,
  },
  sectionIndicator: {
    width: 4,
    height: 20,
    backgroundColor: "#2D7FF9",
    borderRadius: 10,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#111",
  },
  contentGrid: {
    marginHorizontal: 16,
  },
  cardItem: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.9,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  cardIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
  },
  cardMeta: {
    fontSize: 11,
    color: "#A0A0A0",
    fontWeight: "500",
  },
  infoCard: {
    backgroundColor: "#EEF4FF",
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
    marginBottom: 28,
  },
  infoTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#3B82F6",
    marginLeft: 8,
  },
  infoDescription: {
    fontSize: 12,
    color: "#666",
    lineHeight: 18,
    fontWeight: "500",
  },
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 18,
  },
  recentLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2D7FF9",
  },
  filesContainer: {
    marginHorizontal: 16,
  },
});
