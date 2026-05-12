import React, { useState, useMemo, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Platform,
  TextInput,
  Pressable,
  LayoutAnimation,
  UIManager,
  ActivityIndicator,
  Modal,
  Animated,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { BlurView } from "expo-blur";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  Ionicons,
  MaterialCommunityIcons,
  Feather,
  FontAwesome5,
} from "@expo/vector-icons";

import { ACADEMIC_RECORDS } from "./AcademicMarksScreen";
import { subjectCards } from "./SubjectsMaterialsScreen";

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const personalInfo = [
  {
    id: 1,
    icon: "calendar-outline",
    title: "Date of Birth",
    value: "March 15, 2008",
    color: "#6366F1",
    bg: "#EEF2FF",
  },
  {
    id: 2,
    icon: "mail-outline",
    title: "Email",
    value: "emily.johnson@school.edu",
    color: "#22C55E",
    bg: "#DCFCE7",
  },
  {
    id: 3,
    icon: "call-outline",
    title: "Phone",
    value: "+91 9898767654",
    color: "#A855F7",
    bg: "#F3E8FF",
  },
  {
    id: 4,
    icon: "location-outline",
    title: "Address",
    value: "123 Ganesh Street, Ananthpur, AP",
    color: "#F97316",
    bg: "#FFEDD5",
  },
];

const academicInfo = [
  {
    id: 1,
    icon: "school-outline",
    title: "Current Grade",
    value: "Grade 10",
    color: "#6366F1",
    bg: "#EEF2FF",
  },
  {
    id: 2,
    icon: "flask-outline",
    title: "Stream",
    value: "Science Stream",
    color: "#14B8A6",
    bg: "#CCFBF1",
  },
  {
    id: 3,
    icon: "calendar-outline",
    title: "Academic Year",
    value: "2024-2025",
    color: "#EAB308",
    bg: "#FEF9C3",
  },
  {
    id: 4,
    icon: "document-text-outline",
    title: "Roll Number",
    value: "204001",
    color: "#EF4444",
    bg: "#FEE2E2",
  },
  {
    id: 5,
    icon: "bookmark-outline",
    title: "Section",
    value: "Section A",
    color: "#EC4899",
    bg: "#FCE7F3",
  },
];

const guardians = [
  {
    id: 1,
    name: "Michael Johnson",
    relation: "Father",
    role: "Software Engineer",
    phone: "+1 (555) 987-6543",
    email: "michael.j@email.com",
    image:
      "https://randomuser.me/api/portraits/men/32.jpg",
    color: "#2563EB",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    relation: "Mother",
    role: "Marketing Manager",
    phone: "+1 (555) 456-7890",
    email: "sarah.j@email.com",
    image:
      "https://randomuser.me/api/portraits/women/44.jpg",
    color: "#EC4899",
  },
  {
    id: 3,
    name: "Jennifer Smith",
    relation: "Emergency Contact (Aunt)",
    role: "",
    phone: "+1 (555) 321-9876",
    email: "js.jennifer@email.com",
    image:
      "https://randomuser.me/api/portraits/women/68.jpg",
    color: "#22C55E",
  },
];

const InfoCard = ({ item }) => {
  return (
    <View style={styles.infoItem}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: item.bg },
        ]}
      >
        <Ionicons
          name={item.icon}
          size={18}
          color={item.color}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>
          {item.title}
        </Text>

        <Text style={styles.infoValue}>
          {item.value}
        </Text>
      </View>
    </View>
  );
};

const GuardianCard = ({ item, isExpanded, onToggle }) => {
  return (
    <View style={styles.guardianWrapper}>
      <View
        style={[
          styles.leftBorder,
          { backgroundColor: item.color },
        ]}
      />

      <TouchableOpacity 
        activeOpacity={0.7} 
        style={styles.guardianCard}
        onPress={onToggle}
      >
        <View style={styles.guardianHeader}>
          <Image
            source={{ uri: item.image }}
            style={styles.guardianImage}
          />

          <View style={{ flex: 1 }}>
            <Text style={styles.guardianName}>
              {item.name}
            </Text>
            <Text style={styles.guardianRelation}>
              {item.relation}
            </Text>
          </View>

          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#94A3B8" 
          />
        </View>

        {isExpanded && (
          <View style={styles.guardianDetails}>
            <View style={styles.guardianDivider} />
            {item.role ? (
              <View style={styles.guardianRow}>
                <Feather
                  name="briefcase"
                  size={12}
                  color="#777"
                />
                <Text style={styles.guardianText}>
                  {item.role}
                </Text>
              </View>
            ) : null}

            <View style={styles.guardianRow}>
              <Ionicons
                name="call-outline"
                size={12}
                color="#777"
              />
              <Text style={styles.guardianText}>
                {item.phone}
              </Text>
            </View>

            <View style={styles.guardianRow}>
              <Ionicons
                name="mail-outline"
                size={12}
                color="#777"
              />
              <Text style={styles.guardianText}>
                {item.email}
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const ProfileScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // Dynamic Attendance Logic (Synchronized with AttendanceScreen/HomeScreen)
  const attendancePercentage = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const normalizedToday = new Date(year, month, today.getDate());

    let present = 0;
    let absent = 0;

    for (let i = 1; i <= daysInMonth; i++) {
      const dateObj = new Date(year, month, i);
      if (dateObj > normalizedToday) break; // Ignore future dates
      if (dateObj.getDay() === 0) continue; // Sunday is Holiday
      
      if (i % 12 === 0) absent++;
      else present++;
    }
    const total = present + absent;
    return total > 0 ? Math.round((present / total) * 100) : 0;
  }, []);

  // Dynamic Grade Logic (Calculated from Academic Records)
  const averageGrade = useMemo(() => {
    const totalObtained = ACADEMIC_RECORDS.reduce((acc, curr) => acc + curr.marks, 0);
    const totalPossible = ACADEMIC_RECORDS.reduce((acc, curr) => acc + (curr.total || 100), 0);
    return totalPossible > 0 ? ((totalObtained / totalPossible) * 100).toFixed(1) : "0";
  }, []);

  // Dynamic Subject Count
  const subjectsCount = useMemo(() => {
    return subjectCards.length;
  }, []);

  // State management for edit mode and user fields
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  const [profileImage, setProfileImage] = useState("https://randomuser.me/api/portraits/men/46.jpg");
  const [email, setEmail] = useState("emily.johnson@school.edu");
  const [phone, setPhone] = useState("+91 9898767654");
  const [expandedGuardianId, setExpandedGuardianId] = useState(null);

  // Animation Values
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(-20)).current;
  const modalFade = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.9)).current;

  const showToast = useCallback(() => {
    setShowSuccessToast(true);
    Animated.parallel([
      Animated.timing(toastOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(toastTranslateY, { toValue: 0, friction: 8, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(toastOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(toastTranslateY, { toValue: -20, duration: 400, useNativeDriver: true }),
      ]).start(() => setShowSuccessToast(false));
    }, 3000);
  }, [toastOpacity, toastTranslateY]);

  const toggleLogoutModal = (visible) => {
    if (visible) {
      setIsLogoutModalVisible(true);
      Animated.parallel([
        Animated.timing(modalFade, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(modalScale, { toValue: 1, friction: 8, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.timing(modalFade, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
        setIsLogoutModalVisible(false);
        modalScale.setValue(0.9);
      });
    }
  };

  const toggleGuardian = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedGuardianId(expandedGuardianId === id ? null : id);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      // Fallback for permissions
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate professional API delay
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
      showToast();
    }, 1500);
  };

  const handleCancel = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsEditing(false);
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
          paddingBottom: Math.max(insets.bottom, 40),
        }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={isEditing ? handleCancel : () => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={isEditing ? "close-outline" : "chevron-back"} 
              size={28} 
              color="#111" 
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity 
            onPress={isEditing ? (isSaving ? null : handleSave) : () => setIsEditing(true)}
            style={styles.editHeaderButton}
            activeOpacity={0.7}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#2563EB" />
            ) : (
              <Ionicons 
                name={isEditing ? "checkmark-done-outline" : "create-outline"} 
                size={24} 
                color={isEditing ? "#16A34A" : "#2563EB"} 
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: profileImage }}
              style={styles.profileImage}
            />
            {isEditing && (
              <TouchableOpacity 
                style={styles.cameraIconContainer} 
                onPress={pickImage}
                activeOpacity={0.8}
              >
                <Ionicons name="camera" size={18} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.studentName}>
            Anandh Sharma
          </Text>

          <Text style={styles.studentClass}>
            Student ID: ST2024001
          </Text>

          <Text style={styles.studentStream}>
            Grade 08 - Science Stream
          </Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>
                Average Grade
              </Text>

              <Text style={styles.statValue}>
                {averageGrade}%
              </Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>
                Attendance
              </Text>

              <Text style={styles.statValue}>
                {attendancePercentage}%
              </Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>
                Subjects
              </Text>

              <Text style={styles.statValue}>
                {subjectsCount}
              </Text>
            </View>
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            Personal Information
          </Text>

          {personalInfo.map((item) => {
            const isEmail = item.title === "Email";
            const isPhone = item.title === "Phone";
            
            return (
              <View key={item.id} style={styles.infoItem}>
                <View style={[styles.iconContainer, { backgroundColor: item.bg }]}>
                  <Ionicons name={item.icon} size={18} color={item.color} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>{item.title}</Text>
                  
                  {isEditing && (isEmail || isPhone) ? (
                    <TextInput
                      style={styles.editableInput}
                      value={isEmail ? email : phone}
                      onChangeText={isEmail ? setEmail : setPhone}
                      keyboardType={isEmail ? "email-address" : "phone-pad"}
                      autoFocus={isEmail}
                      placeholder={`Enter ${item.title.toLowerCase()}`}
                      placeholderTextColor="#9CA3AF"
                    />
                  ) : (
                    <Text style={styles.infoValue}>
                      {isEmail ? email : isPhone ? phone : item.value}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Academic Information */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            Academic Information
          </Text>

          {academicInfo.map((item) => (
            <InfoCard
              key={item.id}
              item={item}
            />
          ))}
        </View>

        {/* Guardians */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            Parents & Guardians
          </Text>

          {guardians.map((item) => (
            <GuardianCard
              key={item.id}
              item={item}
              isExpanded={expandedGuardianId === item.id}
              onToggle={() => toggleGuardian(item.id)}
            />
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.logoutButton}
          onPress={() => toggleLogoutModal(true)}
        >
          <MaterialCommunityIcons
            name="logout"
            size={18}
            color="#EF4444"
          />

          <Text style={styles.logoutText}>
            Logout
          </Text>
        </TouchableOpacity>

        <Text style={styles.logoutSubText}>
          Sign out from your account
        </Text>
      </ScrollView>

      {/* Premium Success Toast */}
      {showSuccessToast && (
        <Animated.View style={[styles.toastContainer, { opacity: toastOpacity, transform: [{ translateY: toastTranslateY }] }]}>
          <View style={styles.toastContent}>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.toastText}>Profile updated successfully</Text>
          </View>
        </Animated.View>
      )}

      {/* Custom Premium Logout Modal */}
      <Modal transparent visible={isLogoutModalVisible} animationType="none">
        <View style={styles.modalOverlay}>
          <AnimatedBlurView 
            tint="dark" 
            intensity={30} 
            style={[StyleSheet.absoluteFill, { opacity: modalFade }]} 
          />
          <Pressable style={StyleSheet.absoluteFill} onPress={() => toggleLogoutModal(false)} />
          <Animated.View 
            style={[
              styles.modalContent, 
              { opacity: modalFade, transform: [{ scale: modalScale }] }
            ]}
          >
            <View style={styles.modalIconContainer}>
              <Ionicons name="log-out" size={32} color="#EF4444" />
            </View>
            <Text style={styles.modalTitle}>Confirm Logout</Text>
            <Text style={styles.modalDescription}>
              Are you sure you want to sign out? You will need to log in again to access your classes.
            </Text>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.modalBtnCancel]} 
                onPress={() => toggleLogoutModal(false)}
              >
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.modalBtnConfirm]} 
                onPress={() => {
                  toggleLogoutModal(false);
                  navigation.reset({ index: 0, routes: [{ name: "Login" }] });
                }}
              >
                <Text style={styles.modalBtnConfirmText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

export default ProfileScreen;

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

  editHeaderButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-end",
  },

  heroCard: {
    backgroundColor: "#2563EB",
    marginHorizontal: 14,
    borderRadius: 18,
    padding: 20,
    alignItems: "center",

    shadowColor: "#2563EB",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },

  profileImage: {
    width: 72,
    height: 72,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#fff",
  },

  imageWrapper: {
    position: "relative",
    marginBottom: 12,
  },

  cameraIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#2563EB",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },

  studentName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },

  studentClass: {
    color: "#DCE7FF",
    fontSize: 12,
    marginTop: 4,
  },

  studentStream: {
    color: "#DCE7FF",
    fontSize: 13,
    marginTop: 6,
    marginBottom: 18,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },

  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginHorizontal: 4,
  },

  statLabel: {
    color: "#DCE7FF",
    fontSize: 10,
    marginBottom: 8,
  },

  statValue: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },

  sectionCard: {
    backgroundColor: "#fff",
    marginHorizontal: 14,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,

    borderWidth: 1,
    borderColor: "#ECECEC",

    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 18,
  },

  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
  },

  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  infoLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    marginBottom: 4,
  },

  infoValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
    lineHeight: 20,
  },

  editableInput: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
    borderBottomWidth: 1,
    borderBottomColor: "#2563EB",
    paddingVertical: 2,
    marginTop: 2,
  },

  guardianWrapper: {
    flexDirection: "row",
    marginBottom: 18,
  },

  leftBorder: {
    width: 3,
    borderRadius: 10,
    marginRight: 10,
  },

  guardianCard: {
    flex: 1,
  },

  guardianHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  guardianImage: {
    width: 46,
    height: 46,
    borderRadius: 30,
    marginRight: 12,
  },

  guardianDetails: {
    marginTop: 5,
  },

  guardianDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 10,
  },

  guardianName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },

  guardianRelation: {
    fontSize: 12,
    color: "#2563EB",
    marginTop: 2,
    marginBottom: 6,
  },

  guardianRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },

  guardianText: {
    fontSize: 11,
    color: "#666",
    marginLeft: 6,
  },

  logoutButton: {
    marginHorizontal: 14,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF5F5",
  },

  logoutText: {
    color: "#EF4444",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 8,
  },

  logoutSubText: {
    textAlign: "center",
    marginTop: 8,
    fontSize: 11,
    color: "#9CA3AF",
  },

  // Toast Styles
  toastContainer: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    alignItems: "center",
    zIndex: 999,
  },
  toastContent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16A34A",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    gap: 10,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  toastText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
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
    backgroundColor: "#fff",
    borderRadius: 30,
    padding: 24,
    alignItems: "center",
    elevation: 20,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 10,
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
    width: "100%",
  },
  modalBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBtnCancel: { backgroundColor: "#F3F4F6" },
  modalBtnConfirm: { backgroundColor: "#EF4444" },
  modalBtnCancelText: { fontWeight: "700", color: "#4B5563" },
  modalBtnConfirmText: { fontWeight: "700", color: "#fff" },
});