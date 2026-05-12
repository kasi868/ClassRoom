import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  TextInput,
  ActivityIndicator,
  Keyboard,
  Modal,
  Pressable,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const TIMETABLE_DATA = {
  Mon: [
    {
    id: 1,
    type: "class",
    period: "1",
    time: "09:30 AM\n10:15 AM",
    subject: "English",
    teacher: "Neha verma",
    room: "201",
    color: "#DDEBFF",
    textColor: "#2563EB",
  },
  {
    id: 2,
    type: "class",
    period: "2",
    time: "10:15 AM\n11:00 AM",
    subject: "Science",
    teacher: "Ravi kumar",
    room: "201",
    color: "#DDF7E4",
    textColor: "#16A34A",
  },
  {
    id: 3,
    type: "break",
    label: "11:00 AM - 11:30 AM",
    title: "Short Break",
    bg: "#F8F5ED",
    color: "#9A6B16",
  },
  {
    id: 4,
    type: "class",
    period: "3",
    time: "11:30 AM\n12:15 AM",
    subject: "Mathematics",
    teacher: "Anandh",
    room: "201",
    color: "#EEE7FF",
    textColor: "#8B5CF6",
  },
  {
    id: 5,
    type: "break",
    label: "12:15 PM - 01:15 AM",
    title: "Lunch Break",
    bg: "#EAF7EE",
    color: "#15803D",
  },
  {
    id: 6,
    type: "class",
    period: "4",
    time: "01:15 PM\n02:00 PM",
    subject: "Social Studies",
    teacher: "Subhadhra",
    room: "201",
    color: "#FFF2DF",
    textColor: "#F59E0B",
  },
  {
    id: 7,
    type: "class",
    period: "5",
    time: "02:00 AM\n02:45 AM",
    subject: "Computer",
    teacher: "Anjali Sherma",
    room: "201",
    color: "#FFE2F5",
    textColor: "#EC4899",
  },
  {
    id: 8,
    type: "break",
    label: "02:45 AM - 03:30 AM",
    title: "Short Break",
    bg: "#EEE8FF",
    color: "#7C3AED",
  },
  {
    id: 9,
    type: "class",
    period: "6",
    time: "03:30 AM\n04:15 AM",
    subject: "Music",
    teacher: "Rithu",
    room: "201",
    color: "#EEE7FF",
    textColor: "#8B5CF6",
  },
  {
    id: 10,
    type: "class",
    period: "7",
    time: "04:15 AM\n05:00 AM",
    subject: "Games",
    teacher: "Athreya",
    room: "201",
    color: "#FFF2DF",
    textColor: "#F59E0B",
    },
  ],
  Tue: [
    { id: 101, type: "class", period: "1", time: "09:30 AM\n10:15 AM", subject: "History", teacher: "Subhadhra", room: "201", color: "#FFF2DF", textColor: "#F59E0B" },
    { id: 102, type: "class", period: "2", time: "10:15 AM\n11:00 AM", subject: "Mathematics", teacher: "Anandh", room: "201", color: "#EEE7FF", textColor: "#8B5CF6" },
    { id: 103, type: "break", label: "11:00 AM - 11:30 AM", title: "Short Break", bg: "#F8F5ED", color: "#9A6B16" },
    { id: 104, type: "class", period: "3", time: "11:30 AM\n12:15 AM", subject: "Physics", teacher: "Ravi kumar", room: "Lab 1", color: "#DDF7E4", textColor: "#16A34A" },
    { id: 105, type: "break", label: "12:15 PM - 01:15 AM", title: "Lunch Break", bg: "#EAF7EE", color: "#15803D" },
    { id: 106, type: "class", period: "4", time: "01:15 PM\n02:00 PM", subject: "English", teacher: "Neha verma", room: "201", color: "#DDEBFF", textColor: "#2563EB" },
    { id: 107, type: "class", period: "5", time: "02:00 AM\n02:45 AM", subject: "Library", teacher: "Librarian", room: "Library", color: "#FFE2F5", textColor: "#EC4899" },
    { id: 108, type: "break", label: "02:45 AM - 03:30 AM", title: "Short Break", bg: "#EEE8FF", color: "#7C3AED" },
    { id: 109, type: "class", period: "6", time: "03:30 AM\n04:15 AM", subject: "Geography", teacher: "Subhadhra", room: "201", color: "#FFF2DF", textColor: "#F59E0B" },
    { id: 110, type: "class", period: "7", time: "04:15 AM\n05:00 AM", subject: "Self Study", teacher: "Proctor", room: "Hall A", color: "#DDEBFF", textColor: "#2563EB" },
  ],
  Wed: [
    { id: 201, type: "class", period: "1", time: "09:30 AM\n10:15 AM", subject: "Chemistry", teacher: "Ravi kumar", room: "Lab 2", color: "#DDF7E4", textColor: "#16A34A" },
    { id: 202, type: "class", period: "2", time: "10:15 AM\n11:00 AM", subject: "English", teacher: "Neha verma", room: "201", color: "#DDEBFF", textColor: "#2563EB" },
    { id: 203, type: "break", label: "11:00 AM - 11:30 AM", title: "Short Break", bg: "#F8F5ED", color: "#9A6B16" },
    { id: 204, type: "class", period: "3", time: "11:30 AM\n12:15 AM", subject: "Mathematics", teacher: "Anandh", room: "201", color: "#EEE7FF", textColor: "#8B5CF6" },
    { id: 205, type: "break", label: "12:15 PM - 01:15 AM", title: "Lunch Break", bg: "#EAF7EE", color: "#15803D" },
    { id: 206, type: "class", period: "4", time: "01:15 PM\n02:00 PM", subject: "Art", teacher: "Rithu", room: "Studio", color: "#FFE2F5", textColor: "#EC4899" },
    { id: 207, type: "class", period: "5", time: "02:00 AM\n02:45 AM", subject: "Social Studies", teacher: "Subhadhra", room: "201", color: "#FFF2DF", textColor: "#F59E0B" },
    { id: 208, type: "break", label: "02:45 AM - 03:30 AM", title: "Short Break", bg: "#EEE8FF", color: "#7C3AED" },
    { id: 209, type: "class", period: "6", time: "03:30 AM\n04:15 AM", subject: "Computer", teacher: "Anjali Sherma", room: "201", color: "#FFE2F5", textColor: "#EC4899" },
    { id: 210, type: "class", period: "7", time: "04:15 AM\n05:00 AM", subject: "Physical Ed", teacher: "Athreya", room: "Ground", color: "#DDF7E4", textColor: "#16A34A" },
  ],
  // Mock data for Saturday (Half Day)
  Sat: [
    { id: 601, type: "class", period: "1", time: "09:30 AM\n10:15 AM", subject: "Physical Ed", teacher: "Athreya", room: "Ground", color: "#DDF7E4", textColor: "#16A34A" },
    { id: 602, type: "class", period: "2", time: "10:15 AM\n11:00 AM", subject: "Art", teacher: "Rithu", room: "Studio", color: "#FFE2F5", textColor: "#EC4899" },
    { id: 603, type: "break", label: "11:00 AM - 12:00 PM", title: "Activity Hour", bg: "#EAF7EE", color: "#15803D" },
  ]
};

const TEACHER_DETAILS = {
  name: "Mrs. Neha Verma",
  email: "neha.verma@school.in",
  phone: "9898767654",
  role: "Class Teacher",
  avatar: "https://randomuser.me/api/portraits/women/44.jpg"
};

const TimeTableScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [selectedDay, setSelectedDay] = useState("Mon");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Message Teacher States
  const [isMessageModalVisible, setIsMessageModalVisible] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messageScale = useRef(new Animated.Value(0.8)).current;

  // Calendar Logic for the Modal
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Previous month padding
    for (let i = firstDayIndex; i > 0; i--) {
      days.push({ day: "", isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        isToday: i === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear(),
        isSelected: i === currentDate.getDate()
      });
    }

    // Fill grid to 42 cells
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: "", isCurrentMonth: false });
    }
    return days;
  }, [currentDate]);

  const formattedDate = useMemo(() => {
    return {
      day: `${String(currentDate.getDate()).padStart(2, '0')} ${MONTHS[currentDate.getMonth()]}`,
      year: currentDate.getFullYear().toString(),
    };
  }, [currentDate]);

  // Professional transition effect when switching days
  const handleDayPress = (day) => {
    if (day === selectedDay) return;
    
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      setSelectedDay(day);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
  };

  const filteredData = useMemo(() => {
    return TIMETABLE_DATA[selectedDay] || TIMETABLE_DATA["Mon"];
  }, [selectedDay]);

  const handleDateSelect = (day) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    setIsDatePickerVisible(false);
  };

  const handleOpenMessage = () => {
    setIsMessageModalVisible(true);
    Animated.spring(messageScale, {
      toValue: 1,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    
    setIsSending(true);
    Keyboard.dismiss();

    // Simulate premium API call
    setTimeout(() => {
      setIsSending(false);
      setIsMessageModalVisible(false);
      setMessageText("");
    }, 2000);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
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
          <Text style={styles.headerTitle}>Time Table</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* Teacher Card */}
        <View style={styles.teacherCard}>
          <View style={styles.teacherLeft}>
            <Image
              source={{
                uri: TEACHER_DETAILS.avatar,
              }}
              style={styles.teacherImage}
            />

            <View>
              <Text style={styles.teacherRole}>
                {TEACHER_DETAILS.role}
              </Text>

              <Text style={styles.teacherName}>
                {TEACHER_DETAILS.name}
              </Text>

              <View style={styles.contactRow}>
                <Text style={styles.contactText}>{TEACHER_DETAILS.email}</Text>
                <View style={styles.separator} />
                <Ionicons name="call-outline" size={12} color="#666" />
                <Text style={styles.contactText}>{TEACHER_DETAILS.phone}</Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.messageButton} 
            activeOpacity={0.7}
            onPress={handleOpenMessage}
          >
             <MaterialCommunityIcons name="message-text-outline" size={20} color="#2563EB" />
          </TouchableOpacity>
        </View>

        {/* Table Card */}
        <View style={styles.tableCard}>
          {/* Days */}
          <View style={styles.daysContainer}>
            <View style={styles.daysLeft}>
              {DAYS.map((day) => (
                <TouchableOpacity
                  key={day}
                  activeOpacity={0.7}
                  onPress={() => handleDayPress(day)}
                  style={styles.dayButton}
                >
                  <Text
                    style={[
                      styles.dayText,
                      selectedDay === day &&
                        styles.activeDayText,
                    ]}
                  >
                    {day}
                  </Text>

                  {selectedDay === day && (
                    <View style={styles.activeLine} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Date */}
            <TouchableOpacity 
              style={styles.dateCard}
              onPress={() => setIsDatePickerVisible(true)}
              activeOpacity={0.7}
            >
              <Ionicons
                name="calendar-outline"
                size={16}
                color="#2563EB"
              />

              <View style={{ marginLeft: 6 }}>
                <Text style={styles.dateText}>
                  {formattedDate.day}
                </Text>

                <Text style={styles.yearText}>
                  {formattedDate.year}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Header Row */}
          <View style={styles.headerRow}>
            <Text style={[styles.headerCell, { flex: 0.8 }]}>
              Period
            </Text>

            <Text style={[styles.headerCell, { flex: 1.3 }]}>
              Time
            </Text>

            <Text style={[styles.headerCell, { flex: 1.4 }]}>
              Subject
            </Text>

            <Text style={[styles.headerCell, { flex: 1.2 }]}>
              Teacher
            </Text>

            <Text style={[styles.headerCell, { flex: 0.7 }]}>
              Room
            </Text>
          </View>

          {/* Rows */}
          <Animated.View style={{ opacity: fadeAnim }}>
          {filteredData.map((item) => {
            if (item.type === "break") {
              return (
                <View
                  key={item.id}
                  style={[
                    styles.breakRow,
                    { backgroundColor: item.bg },
                  ]}
                >
                  <Text
                    style={[
                      styles.breakTime,
                      { color: item.color },
                    ]}
                  >
                    {item.label}
                  </Text>

                  <Text
                    style={[
                      styles.breakTitle,
                      { color: item.color },
                    ]}
                  >
                    {item.title}
                  </Text>
                </View>
              );
            }

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                style={styles.row}
              >
                {/* Period */}
                <View
                  style={[
                    styles.periodCircle,
                    {
                      backgroundColor: item.color,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.periodText,
                      { color: item.textColor },
                    ]}
                  >
                    {item.period}
                  </Text>
                </View>

                {/* Time */}
                <Text
                  style={[styles.rowText, { flex: 1.3 }]}
                >
                  {item.time}
                </Text>

                {/* Subject */}
                <Text
                  style={[styles.subjectText, { flex: 1.4 }]}
                >
                  {item.subject}
                </Text>

                {/* Teacher */}
                <Text
                  style={[styles.rowText, { flex: 1.2 }]}
                >
                  {item.teacher}
                </Text>

                {/* Room */}
                <Text
                  style={[styles.roomText, { flex: 0.7 }]}
                >
                  {item.room}
                </Text>
              </TouchableOpacity>
            );
          })}
          </Animated.View>
        </View>

        {/* Note */}
        <View style={styles.noteCard}>
          <View style={styles.noteIcon}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={22}
              color="#16A34A"
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.noteTitle}>Note</Text>

            <Text style={styles.noteText}>
              This timetable is effective from May 20 2025.
            </Text>

            <Text style={styles.noteText}>
              Timings may change on special occasions.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Professional Calendar Modal */}
      <Modal
        visible={isDatePickerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDatePickerVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setIsDatePickerVisible(false)}
        >
          <View style={styles.calendarModal}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity 
                onPress={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
              >
                <Ionicons name="chevron-back" size={24} color="#2563EB" />
              </TouchableOpacity>
              
              <Text style={styles.calendarTitle}>
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </Text>

              <TouchableOpacity 
                onPress={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
              >
                <Ionicons name="chevron-forward" size={24} color="#2563EB" />
              </TouchableOpacity>
            </View>

            <View style={styles.weekRow}>
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <Text key={i} style={styles.weekDayText}>{d}</Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {calendarData.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.calendarDay,
                    item.isSelected && styles.selectedDay,
                    item.isToday && styles.todayCircle
                  ]}
                  disabled={!item.isCurrentMonth}
                  onPress={() => handleDateSelect(item.day)}
                >
                  <Text style={[
                    styles.calendarDayText,
                    !item.isCurrentMonth && { color: '#E2E8F0' },
                    item.isSelected && { color: '#FFF' },
                    item.isToday && !item.isSelected && { color: '#2563EB' }
                  ]}>
                    {item.day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setIsDatePickerVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Premium Message Modal */}
      <Modal
        visible={isMessageModalVisible}
        transparent
        animationType="none"
        onRequestClose={() => setIsMessageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => !isSending && setIsMessageModalVisible(false)} />
          <Animated.View style={[styles.messageModal, { transform: [{ scale: messageScale }] }]}>
            <View style={styles.messageHeader}>
              <View style={styles.teacherIconBox}>
                <Ionicons name="chatbubble-ellipses" size={24} color="#2563EB" />
              </View>
              <View>
                <Text style={styles.messageTitle}>Message Teacher</Text>
                <Text style={styles.messageSubtitle}>{TEACHER_DETAILS.name}</Text>
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.messageInput}
                placeholder="Type your message here..."
                placeholderTextColor="#94A3B8"
                multiline
                maxLength={250}
                value={messageText}
                onChangeText={setMessageText}
                editable={!isSending}
              />
              <Text style={styles.charCount}>{messageText.length}/250</Text>
            </View>

            <View style={styles.messageFooter}>
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={() => setIsMessageModalVisible(false)}
                disabled={isSending}
              >
                <Text style={styles.cancelBtnText}>Discard</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.sendBtn, 
                  (!messageText.trim() || isSending) && styles.sendBtnDisabled
                ]}
                onPress={handleSendMessage}
                disabled={!messageText.trim() || isSending}
              >
                {isSending ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Text style={styles.sendBtnText}>Send Message</Text>
                    <Ionicons name="send" size={16} color="#FFF" style={{ marginLeft: 8 }} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

export default TimeTableScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7FB",
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

  teacherCard: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 14,
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,

    // Premium Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  teacherLeft: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
  },

  teacherImage: {
    width: 54,
    height: 54,
    borderRadius: 30,
    marginRight: 14,
  },

  messageButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EAF2FF",
    justifyContent: "center",
    alignItems: "center",

    // Subtle border
    borderWidth: 1,
    borderColor: "#DCEAFE",
    shadowColor: "#2563EB",
    shadowOpacity: 0.1,
    elevation: 2,
  },

  teacherRole: {
    color: "#2563EB",
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 2,
  },

  teacherName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },

  contactRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  contactText: {
    fontSize: 12,
    color: "#666",
  },

  separator: {
    width: 1,
    height: 10,
    backgroundColor: "#D1D5DB",
    marginHorizontal: 8,
  },

  tableCard: {
    backgroundColor: "#fff",
    marginHorizontal: 14,
    borderRadius: 16,
    overflow: "hidden",

    borderWidth: 1,
    borderColor: "#E5E7EB",

    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },

  daysContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 14,
  },

  daysLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  dayButton: {
    marginRight: 22,
    alignItems: "center",
  },

  dayText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },

  activeDayText: {
    color: "#2563EB",
    fontWeight: "700",
  },

  activeLine: {
    width: 36,
    height: 2,
    backgroundColor: "#2563EB",
    marginTop: 6,
    borderRadius: 10,
  },

  dateCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F5F7",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },

  dateText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#111",
  },

  yearText: {
    fontSize: 10,
    color: "#666",
  },

  headerRow: {
    flexDirection: "row",
    backgroundColor: "#EAF1FB",
    paddingVertical: 14,
    paddingHorizontal: 10,
  },

  headerCell: {
    fontSize: 11,
    fontWeight: "700",
    color: "#334155",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: "#F3F4F6",
  },

  periodCircle: {
    width: 30,
    height: 30,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  periodText: {
    fontWeight: "700",
    fontSize: 13,
  },

  rowText: {
    fontSize: 11,
    color: "#555",
    lineHeight: 18,
  },

  subjectText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#222",
  },

  roomText: {
    fontSize: 12,
    color: "#444",
    fontWeight: "600",
    textAlign: "center",
  },

  breakRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 10,
  },

  breakTime: {
    fontSize: 11,
    fontWeight: "700",
  },

  breakTitle: {
    fontSize: 12,
    fontWeight: "700",
  },

  noteCard: {
    backgroundColor: "#EEF8F1",
    marginHorizontal: 14,
    marginTop: 20,
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  noteIcon: {
    width: 36,
    height: 36,
    borderRadius: 20,
    backgroundColor: "#DDF7E4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  noteTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2563EB",
    marginBottom: 4,
  },

  noteText: {
    fontSize: 12,
    color: "#555",
    lineHeight: 18,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  calendarModal: {
    width: "85%",
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 20,
    elevation: 10,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  weekDayText: {
    width: "14.28%",
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calendarDay: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  selectedDay: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
  },
  todayCircle: {
    borderWidth: 1,
    borderColor: "#2563EB",
    borderRadius: 12,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#F1F5F9",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#475569",
    fontWeight: "700",
    fontSize: 14,
  },

  // Message Modal Styles
  messageModal: {
    width: "90%",
    backgroundColor: "#FFF",
    borderRadius: 28,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 20,
  },
  messageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  teacherIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  messageTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E293B",
  },
  messageSubtitle: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  inputWrapper: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 12,
    marginBottom: 20,
  },
  messageInput: {
    height: 120,
    fontSize: 15,
    color: "#334155",
    textAlignVertical: "top",
  },
  charCount: {
    alignSelf: "flex-end",
    fontSize: 10,
    fontWeight: "700",
    color: "#94A3B8",
    marginTop: 4,
  },
  messageFooter: {
    flexDirection: "row",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#64748B",
  },
  sendBtn: {
    flex: 2,
    height: 52,
    backgroundColor: "#2563EB",
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtnDisabled: {
    backgroundColor: "#93C5FD",
    opacity: 0.8,
  },
  sendBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFF",
  },
});