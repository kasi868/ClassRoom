import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Animated,
  Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  Ionicons,
  MaterialIcons,
  FontAwesome5,
  MaterialCommunityIcons,
  Feather,
} from "@expo/vector-icons";
import { BlurView } from "expo-blur";

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const menuItems = [
  {
    title: "Profile",
    icon: <Ionicons name="person-outline" size={20} color="#2563EB" />,
    screen: "Profile",
  },
  {
    title: "Time Table",
    icon: <MaterialIcons name="event-note" size={20} color="#2563EB" />,
    screen: "TimeTable",
  },
  {
    title: "Subjects & Materials",
    icon: (
      <MaterialCommunityIcons
        name="book-education-outline"
        size={20}
        color="#2563EB"
      />
    ),
    screen: "Subjects",
  },
  {
    title: "Academic Marks",
    icon: <Feather name="file-text" size={20} color="#2563EB" />,
    screen: "Marks",
  },
  {
    title: "Transport",
    icon: <Ionicons name="bus-outline" size={20} color="#2563EB" />,
    screen: "Transport",
  },
  {
    title: "Assignments",
    icon: (
      <MaterialCommunityIcons
        name="clipboard-text-outline"
        size={20}
        color="#2563EB"
      />
    ),
    screen: "Assignments",
  },
  {
    title: "Live Classes",
    icon: <Feather name="video" size={20} color="#2563EB" />,
    screen: "LiveClasses",
  },
  {
    title: "Notices",
    icon: (
      <MaterialCommunityIcons
        name="bullhorn-outline"
        size={20}
        color="#2563EB"
      />
    ),
    screen: "Notices",
  },
  {
    title: "Calendar",
    icon: <Ionicons name="calendar-outline" size={20} color="#2563EB" />,
    screen: "Calendar",
  },
  {
    title: "Fee Details",
    icon: (
      <MaterialCommunityIcons
        name="credit-card-outline"
        size={20}
        color="#2563EB"
      />
    ),
    screen: "FeeDetails",
  },
  {
    title: "Exam Schedule",
    icon: (
      <MaterialCommunityIcons
        name="clipboard-outline"
        size={20}
        color="#2563EB"
      />
    ),
    screen: "ExamSchedule",
  },
];

const MenuBarScreen = ({ navigation, user = {
  name: "Anandh Sharma",
  className: "Class 7 - B",
  image: null
} }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [profileImage, setProfileImage] = useState(user.image);
  const insets = useSafeAreaInsets();
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const imageOpacity = useRef(new Animated.Value(0)).current;

  // Fetch the latest profile image from AsyncStorage whenever the menu renders
  useEffect(() => {
    const loadStoredImage = async () => {
      try {
        const savedImage = await AsyncStorage.getItem("@user_profile_image");
        if (savedImage) {
          setProfileImage(savedImage);
        }
      } catch (error) {
        console.error("MenuBarScreen: Failed to fetch profile image", error);
      }
    };
    loadStoredImage();
  }, []);

  useEffect(() => {
    if (profileImage) {
      Animated.timing(imageOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [profileImage]);

  const initials = useMemo(() => {
    if (!user.name) return "";
    return user.name.split(" ").filter(Boolean).slice(0, 2).map(n => n[0]).join("").toUpperCase();
  }, [user.name]);

  const toggleModal = (visible) => {
    if (visible) {
      setIsModalVisible(true);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => setIsModalVisible(false));
      scaleAnim.setValue(0.8);
    }
  };

  const handleLogout = () => {
    toggleModal(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.menuContainer}
      >
        {/* USER PROFILE HEADER SECTION */}
        <View style={[styles.profileHeader, { paddingTop: Math.max(insets.top, 16) + 8 }]}>
          <View style={styles.avatarWrapper}>
            {profileImage ? (
              <Animated.Image 
                source={typeof profileImage === 'string' ? { uri: profileImage } : profileImage} 
                style={[styles.avatar, { opacity: imageOpacity }]} 
              />
            ) : (
              <View style={styles.initialsAvatar}>
                <Text style={styles.initialsText}>{initials}</Text>
              </View>
            )}
            <View style={styles.onlineStatus} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName} numberOfLines={1}>{user.name}</Text>
            <Text style={styles.userClass} numberOfLines={1}>{user.className}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => navigation.navigate(item.screen)}
          >
            <View style={[
              styles.iconContainer, 
              { backgroundColor: '#F0F7FF', padding: 8, borderRadius: 10 }
            ]}>
              {item.icon}
            </View>
            <Text style={styles.menuText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={[styles.logoutSection, { paddingBottom: Math.max(insets.bottom, 16) + 12 }]}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="log-out-outline" size={22} color="#DC2626" />
          </View>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* CUSTOM PROFESSIONAL LOGOUT MODAL */}
      <Modal
        transparent
        visible={isModalVisible}
        animationType="none"
        onRequestClose={() => toggleModal(false)}
      >
        <View style={styles.modalOverlay}>
        <AnimatedBlurView
          tint="dark"
          intensity={30}
          style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}
        />
        <Pressable style={StyleSheet.absoluteFill} onPress={() => toggleModal(false)} />
          <Animated.View
            style={[
              styles.modalContent,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.warningIconContainer}>
              <Ionicons name="alert-circle" size={40} color="#DC2626" />
            </View>
            <Text style={styles.modalTitle}>Confirm Logout</Text>
            <Text style={styles.modalDescription}>
              Are you sure you want to sign out? You will need to enter your credentials again to access your account.
            </Text>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => toggleModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => {
                  toggleModal(false);
                  navigation.reset({ index: 0, routes: [{ name: "Login" }] });
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

export default MenuBarScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  menuContainer: {
    paddingVertical: 18,
    paddingHorizontal: 14,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingLeft: 20,
    marginBottom: 4,
  },

  iconContainer: {
    justifyContent: "center",
  },

  menuText: {
    fontSize: 15,
    color: "#111",
    marginLeft: 12,
    fontWeight: "500",
  },

  logoutSection: {
    padding: 16,
    paddingBottom: 24, // Extra breathing room for the bottom
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingLeft: 8,
  },

  logoutText: {
    fontSize: 16,
    color: "#DC2626",
    marginLeft: 12,
    fontWeight: "600",
  },

  // Profile Header Styles
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingBottom: 20,
    marginTop: 4,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F1F5F9",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  initialsAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  initialsText: {
    color: "#2563EB",
    fontSize: 18,
    fontWeight: "800",
  },
  onlineStatus: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#22C55E",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 2,
  },
  userClass: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginBottom: 10,
    opacity: 0.6,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
  },
  warningIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButtonRow: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
  },
  confirmButton: {
    backgroundColor: "#DC2626",
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4B5563",
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});