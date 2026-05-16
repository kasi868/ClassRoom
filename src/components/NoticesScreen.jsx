import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  Platform,
  LayoutAnimation,
  UIManager,
} from "react-native";
import { 
  SafeAreaView, 
  useSafeAreaInsets 
} from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
  Ionicons,
  MaterialIcons,
  FontAwesome5,
  Feather,
} from "@expo/vector-icons";

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const categories = [
  {
    id: "all",
    title: "All Notices",
    icon: "notifications-outline",
  },
  {
    id: "academics",
    title: "Academics",
    icon: "document-text-outline",
  },
  {
    id: "events",
    title: "Events",
    icon: "calendar-outline",
  },
  {
    id: "fees",
    title: "Fees",
    icon: "wallet-outline",
  },
];

const noticesData = [
  {
    id: 1,
    title: "Exam Schedule Released",
    description:
      "Annual exams will begin from Jan 5, 2025.Check your timetable for details.",
    time: "2 hours ago",
    color: "#FF4D4F",
    bg: "#FFEDED",
    icon: "megaphone",
    category: "academics",
  },

  {
    id: 2,
    title: "Library Timing Update",
    description:
      "Library will remain open 24/7 during exam season starting Dec 20.",
    time: "1 day ago",
    color: "#3B82F6",
    bg: "#EEF4FF",
    icon: "information-circle",
    category: "academics",
  },

  {
    id: 3,
    title: "Tech Fest Registration",
    description:
      "Annual tech fest registrations are now open. Register before Dec 20.",
    time: "2 days ago",
    color: "#22C55E",
    bg: "#ECFFF2",
    icon: "trophy",
    category: "events",
  },

  {
    id: 4,
    title: "Zoom Meeting",
    description: "with principal",
    time: "21/02/2026, 09:30 AM",
    color: "#E0C300",
    bg: "#FFFCE7",
    icon: "videocam",
    category: "events",
  },

  {
    id: 5,
    title: "Annual Day",
    description:
      "We are happy to inform you that our Annual Day celebration will be held on 15 July 2025.",
    time: "4 days ago",
    color: "#FF4D4F",
    bg: "#FFEDED",
    icon: "newspaper",
    category: "fees",
  },
];

const NoticeCard = ({ item, isExpanded, onToggle }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onToggle}
      style={[
        styles.noticeCard, 
        { borderLeftColor: item.color },
        isExpanded && styles.noticeCardExpanded
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.bg }]}>
        <Ionicons name={item.icon} size={18} color={item.color} />
      </View>

      <View style={styles.noticeContent}>
        <View style={styles.noticeHeaderRow}>
          <Text style={styles.noticeTitle}>{item.title}</Text>
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={18} 
            color="#B0B0B0" 
          />
        </View>

        <Text style={styles.noticeDescription} numberOfLines={isExpanded ? undefined : 2}>
          {item.description}
        </Text>

        <Text style={styles.noticeTime}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );
};

const NoticesScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const filteredNotices = useMemo(() => {
    if (selectedCategory === "all") return noticesData;
    return noticesData.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  const handleToggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, 30),
        }}
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
          <Text style={styles.headerTitle}>Notices</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Summary Banner */}
          <View style={styles.summaryBanner}>
            <Text style={styles.summaryText}>
              You have <Text style={styles.highlight}>{noticesData.length}</Text> total notices this month
            </Text>
          </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
        >
          {categories.map((item) => {
            const isSelected = selectedCategory === item.id;

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                onPress={() => setSelectedCategory(item.id)}
                style={[
                  styles.categoryButton,
                  isSelected && styles.activeCategory,
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={14}
                  color={isSelected ? "#FFF" : "#3B82F6"}
                />

                <Text
                  style={[
                    styles.categoryText,
                    isSelected && styles.activeCategoryText,
                  ]}
                >
                  {item.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Notices */}
        <View style={styles.noticeWrapper}>
          {filteredNotices.map((item) => (
            <NoticeCard 
              key={item.id} 
              item={item} 
              isExpanded={expandedId === item.id}
              onToggle={() => handleToggleExpand(item.id)}
            />
          ))}
        </View>

        {/* Informational Footer */}
        <View style={styles.footerCard}>
          <View style={styles.footerIconContainer}>
            <Ionicons name="alert-circle" size={24} color="#15803D" />
          </View>

          <Text style={styles.footerText}>
            Stay updated with all important announcements and notifications.
          </Text>
        </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

export default NoticesScreen;

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
  summaryBanner: {
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#EEF2F7",
    alignItems: "center",
  },
  summaryText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  highlight: {
    color: "#2D7FF9",
    fontWeight: "800",
  },

  categoryContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },

  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F2F5",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 10,
  },

  activeCategory: {
    backgroundColor: "#2D7FF9",
  },

  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#3B82F6",
    marginLeft: 6,
  },

  activeCategoryText: {
    color: "#FFF",
  },

  noticeWrapper: {
    paddingHorizontal: 16,
  },

  noticeCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,

    elevation: 3,
  },
  noticeCardExpanded: {
    backgroundColor: "#FDFDFD",
    shadowOpacity: 0.1,
    elevation: 5,
  },
  noticeHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },

  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  noticeContent: {
    flex: 1,
  },

  noticeTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1A1A1A",
  },

  noticeDescription: {
    fontSize: 13,
    color: "#666",
    lineHeight: 20,
    marginBottom: 10,
  },

  noticeTime: {
    fontSize: 12,
    color: "#B0B0B0",
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    backgroundColor: "#FFF",
    borderRadius: 20,
    marginHorizontal: 4,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: "600",
  },

  footerCard: {
    marginTop: 18,
    marginHorizontal: 16,
    backgroundColor: "#EFF8F3",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: '#E6F6EE',
  },

  footerIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  footerText: {
    flex: 1,
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
    fontWeight: '600',
  },
});
