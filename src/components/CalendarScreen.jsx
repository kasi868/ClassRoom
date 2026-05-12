import React, { useRef, useEffect, useState, useMemo, useCallback, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  Platform,
  Alert,
  Linking,
  Modal,
  Pressable,
  ActivityIndicator,
  LayoutAnimation,
  UIManager,
  Dimensions,
  RefreshControl,
} from "react-native";
import * as Calendar from "expo-calendar";
import { 
  SafeAreaView,
  useSafeAreaInsets 
} from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS_HEADER = ["S", "M", "T", "W", "T", "F", "S"];

// Holiday Data Structure - Scalable for API Integration
const CATEGORIES = {
  NATIONAL: { color: "#F59E0B", bg: "#FFFBEB", icon: "flag-outline" },
  FESTIVAL: { color: "#8B5CF6", bg: "#F5F3FF", icon: "sparkles-outline" },
  OBSERVANCE: { color: "#10B981", bg: "#ECFDF5", icon: "eye-outline" },
  PUBLIC: { color: "#EF4444", bg: "#FEE2E2", icon: "people-outline" },
};

const MOCK_API_HOLIDAYS = [
  { id: 10, title: "Makar Sankranti", month: 0, day: 14, category: "FESTIVAL" },
  { id: 11, title: "Pongal", month: 0, day: 15, category: "FESTIVAL" },
  { id: 1, title: "Republic Day", month: 0, day: 26, category: "NATIONAL" },
  { id: 2, title: "Maha Shivaratri", month: 1, day: 26, category: "FESTIVAL" },
  { id: 3, title: "Holi Festival", month: 2, day: 14, category: "FESTIVAL" },
  { id: 4, title: "Eid-ul-Fitr", month: 2, day: 31, category: "FESTIVAL" },
  { id: 5, title: "Good Friday", month: 3, day: 18, category: "OBSERVANCE" },
  { id: 6, title: "Independence Day", month: 7, day: 15, category: "NATIONAL" },
  { id: 7, title: "Janmashtami", month: 7, day: 26, category: "FESTIVAL" },
  { id: 12, title: "Milad-un-Nabi", month: 8, day: 16, category: "FESTIVAL" },
  { id: 7, title: "Gandhi Jayanti", month: 9, day: 2, category: "NATIONAL" },
  { id: 8, title: "Diwali", month: 9, day: 20, category: "FESTIVAL" },
  { id: 9, title: "Christmas", month: 11, day: 25, category: "PUBLIC" },
];

// --- Utility Functions ---
const getFormattedHoliday = (h, viewYear) => {
  const cat = CATEGORIES[h.category] || CATEGORIES.OBSERVANCE;
  const date = new Date(viewYear, h.month, h.day);
  return { ...h, ...cat, dateObj: date, dateStr: date.toISOString().split('T')[0] };
};

const getCountdownInfo = (targetDate) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const target = new Date(targetDate); target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return { text: "Today", isPast: false };
  if (diffDays === 1) return { text: "Tomorrow", isPast: false };
  if (diffDays > 1) return { text: `In ${diffDays} days`, isPast: false };
  return { text: diffDays === -1 ? "Yesterday" : "Passed", isPast: true };
};

// --- Reusable Components ---
const HolidayCard = memo(({ item, onPress }) => {
  const { text, isPast } = getCountdownInfo(item.dateObj);
  const weekday = item.dateObj.toLocaleDateString("en-US", { weekday: "long" });

  return (
    <TouchableOpacity 
      activeOpacity={0.7} 
      onPress={() => onPress(item)}
      style={[styles.holidayCard, { borderLeftColor: item.color, opacity: isPast ? 0.6 : 1 }]}
    >
      <View style={[styles.dateBlock, { backgroundColor: item.bg }]}>
        <Text style={[styles.dateBlockMonth, { color: item.color }]}>
          {MONTHS[item.month].slice(0, 3).toUpperCase()}
        </Text>
        <Text style={[styles.dateBlockDay, { color: item.color }]}>{item.day}</Text>
      </View>

      <View style={styles.holidayContent}>
        <Text style={styles.holidayTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.holidaySubRow}>
          <Ionicons name={item.icon} size={12} color="#94A3B8" />
          <Text style={styles.holidaySubtitle}>{weekday}</Text>
        </View>
      </View>

      <View style={[styles.statusBadge, { backgroundColor: item.bg }]}>
        <Text style={[styles.statusBadgeText, { color: item.color }]}>{text}</Text>
      </View>
    </TouchableOpacity>
  );
});

const CalendarCell = memo(({ item, holiday, isToday, onPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={holiday ? 0.6 : 1}
      onPress={() => holiday && onPress(holiday)}
      style={styles.dateCell}
    >
      <View style={[
        styles.dateCircle,
        holiday && { backgroundColor: holiday.bg },
        isToday && styles.todayDate,
      ]}>
        <Text style={[
          styles.dateText,
          holiday && { color: holiday.color, fontWeight: '700' },
          !item.isCurrentMonth && styles.inactiveDate,
          isToday && styles.todayText,
        ]}>
          {item.day}
        </Text>
      </View>
      
      {holiday && (
        <View style={[styles.holidayDot, { backgroundColor: holiday.color }]} />
      )}
    </TouchableOpacity>
  );
});

const HolidayModal = memo(({ visible, holiday, onClose }) => {
  if (!holiday) return null;
  const weekday = holiday.dateObj.toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalContent}>
          <View style={[styles.modalHeader, { backgroundColor: holiday.bg }]}>
            <Ionicons name="calendar-outline" size={40} color={holiday.color} />
            <TouchableOpacity style={styles.closeModalButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            <Text style={styles.modalHolidayTitle}>{holiday.title}</Text>
            <Text style={styles.modalDateText}>{weekday}</Text>
            <View style={styles.modalDivider} />
            <Text style={styles.modalDescription}>School and administrative offices will be closed for {holiday.title}.</Text>
            <TouchableOpacity style={[styles.modalActionBtn, { backgroundColor: holiday.color }]} onPress={onClose}>
              <Text style={styles.modalActionBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
});

const CalendarScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [holidays, setHolidays] = useState([]);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [isHolidayModalVisible, setIsHolidayModalVisible] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // --- Data Fetching Logic ---
  const fetchHolidaysData = useCallback(async () => {
    try {
      // In production, replace this with your API call: axios.get('/api/holidays')
      const data = await new Promise((resolve) => {
        setTimeout(() => resolve(MOCK_API_HOLIDAYS), 800);
      });
      setHolidays(data);
    } catch (error) {
      Alert.alert("Connection Error", "Could not fetch updated holidays.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHolidaysData();
  }, [fetchHolidaysData]);

  // Logic: Dynamic Monthly Holiday Filter (Year Agnostic)
  const visibleMonthHolidays = useMemo(() => {
    const currentMonth = currentDate.getMonth();
    const year = currentDate.getFullYear();
    return holidays.filter(h => h.month === currentMonth).map(h => getFormattedHoliday(h, year));
  }, [currentDate, holidays]);

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [currentDate]);

  const changeMonth = useCallback((offset) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  }, [currentDate]);

  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const daysArr = [];
    // Previous month padding
    for (let i = firstDayIndex; i > 0; i--) {
      daysArr.push({ day: daysInPrevMonth - i + 1, isCurrentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const hMatch = visibleMonthHolidays.find(h => h.day === i);
      const isToday = i === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
      daysArr.push({ day: i, isCurrentMonth: true, isToday, holiday: hMatch });
    }
    const remaining = 42 - daysArr.length;
    for (let i = 1; i <= remaining; i++) daysArr.push({ day: i, isCurrentMonth: false });
    return daysArr;
  }, [currentDate, visibleMonthHolidays]);
  
  const syncVisibleMonthHolidays = useCallback(async () => {
    try {
      setIsSyncing(true);
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "We need calendar access to sync holidays.");
        return;
      }

      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      let calendarId = calendars.find(cal => cal.title === "ClassRoom App")?.id;

      if (!calendarId) {
        const defaultCalendarSource = Platform.OS === "ios"
          ? await Calendar.getDefaultCalendarSourceAsync()
          : { isLocalAccount: true, name: "ClassRoom App", type: Calendar.SourceType.LOCAL };
        calendarId = await Calendar.createCalendarAsync({
          title: "ClassRoom App",
          color: "#2D7FF9",
          entityType: Calendar.EntityTypes.EVENT,
          sourceId: defaultCalendarSource.id,
          source: defaultCalendarSource,
          name: "internalCalendarName",
          ownerAccount: "personal",
          accessLevel: Calendar.CalendarAccessLevel.OWNER,
        });
      }

      const syncPromises = visibleMonthHolidays.map(holiday => {
        return Calendar.createEventAsync(calendarId, {
          title: holiday.title,
          startDate: holiday.dateObj,
          endDate: new Date(holiday.dateObj.getTime() + 86400000),
          allDay: true,
          notes: "Synced from ClassRoom App",
          location: "School",
        });
      });

      await Promise.all(syncPromises);
      Alert.alert(
        "Sync Complete",
        `${visibleMonthHolidays.length} holidays for ${MONTHS[currentDate.getMonth()]} synced to your calendar.`
      );
    } catch (error) {
      Alert.alert("Sync Failed", "An error occurred while syncing your calendar.");
    } finally {
      setIsSyncing(false);
    }
  }, [visibleMonthHolidays, currentDate]);

  const handleHolidayPress = useCallback((holiday) => {
    setSelectedHoliday(holiday);
    setIsHolidayModalVisible(true);
  }, []);

  const onRefresh = useCallback(() => {
    fetchHolidaysData();
  }, [fetchHolidaysData]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, 30),
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#2D7FF9"]}
          />
        }
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
          <Text style={styles.headerTitle}>Calendar</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <Animated.View style={{ opacity: fadeAnim }}>

        {/* Month Selector */}
        <View style={styles.monthCard}>
          <TouchableOpacity activeOpacity={0.7} onPress={() => changeMonth(-1)} style={styles.navBtn}>
            <Ionicons name="chevron-back" size={22} color="#111" />
          </TouchableOpacity>

          <Text style={styles.monthText}>{MONTHS[currentDate.getMonth()]}</Text>

          <TouchableOpacity activeOpacity={0.7} onPress={() => changeMonth(1)} style={styles.navBtn}>
            <Ionicons name="chevron-forward" size={22} color="#111" />
          </TouchableOpacity>
        </View>

        {/* Calendar */}
        <View style={styles.calendarCard}>
          {/* Days */}
          <View style={styles.daysRow}>
            {DAYS_HEADER.map((day, index) => (
              <Text key={index} style={styles.dayText}>
                {day}
              </Text>
            ))}
          </View>

          {/* Dates */}
          <View style={styles.dateGrid}>
            {calendarData.map((item, index) => (
              <CalendarCell 
                key={index} 
                item={item} 
                holiday={item.holiday} 
                isToday={item.isToday} 
                onPress={handleHolidayPress} 
              />
            ))}
          </View>
        </View>

        {/* Holidays */}
        <View style={styles.holidaySection}>
          <View style={styles.holidayHeader}>
            <Text style={styles.sectionTitle}>Month Holidays</Text>
            
            {isLoading ? (
              <ActivityIndicator size="small" color="#2D7FF9" />
            ) : (
              <TouchableOpacity 
              onPress={syncVisibleMonthHolidays}
              disabled={isSyncing}
              style={styles.syncButton}
            >
              {isSyncing ? (
                <ActivityIndicator size="small" color="#2D7FF9" />
              ) : (
                <Ionicons name="sync" size={16} color="#2D7FF9" />
              )}
              <Text style={styles.syncText}>{isSyncing ? "Syncing..." : "Sync"}</Text>
            </TouchableOpacity>
            )}
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color="#2D7FF9" style={{ marginVertical: 20 }} />
          ) : visibleMonthHolidays.length > 0 ? (
            visibleMonthHolidays.map((item) => (
              <HolidayCard key={item.id} item={item} onPress={handleHolidayPress} />
            ))
          ) : (
            <Text style={styles.emptyHolidaysText}>Enjoy! No holidays in {MONTHS[currentDate.getMonth()]}.</Text>
          )}
        </View>
        </Animated.View>
      </ScrollView>

      <HolidayModal 
        visible={isHolidayModalVisible} 
        holiday={selectedHoliday} 
        onClose={() => setIsHolidayModalVisible(false)} 
      />
    </View>
  );
};

export default CalendarScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FB",
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

  emptyHolidaysText: {
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 13,
    paddingVertical: 20,
    fontWeight: "600",
  },

  monthCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10,
    elevation: 2,
  },
  navBtn: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
  },

  monthText: {
    fontSize: 28,
    fontWeight: "500",
    color: "#111",
  },

  calendarCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 18,
    padding: 18,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10,
    elevation: 2,
  },

  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  dayText: {
    width: "14.28%",
    textAlign: "center",
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "700",
    textTransform: "uppercase",
  },

  dateGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  dateCell: {
    width: "14.28%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  dateCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  dateText: {
    fontSize: 14,
    color: "#111",
    fontWeight: "500",
  },

  inactiveDate: {
    color: "#B7BDC8",
  },

  blueDate: {
    backgroundColor: "#DCEBFF",
  },

  redDate: {
    backgroundColor: "#FFE3E3",
  },

  activeDateText: {
    color: "#2D7FF9",
    fontWeight: "700",
  },
  todayDate: {
    backgroundColor: "#2D7FF9",
    borderWidth: 0,
  },
  todayText: {
    color: "#FFF",
    fontWeight: "800",
  },

  holidaySection: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginTop: 22,
    borderRadius: 18,
    padding: 16,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,

    elevation: 2,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 18,
  },
  holidayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  syncButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF4FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  syncText: {
    fontSize: 12,
    color: "#2D7FF9",
    fontWeight: "700",
    marginLeft: 4,
  },
  holidayCardWrap: {
    marginBottom: 12,
  },

  holidayCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  dateBlock: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  dateBlockMonth: {
    fontSize: 10,
    fontWeight: "800",
    opacity: 0.8,
  },
  dateBlockDay: {
    fontSize: 18,
    fontWeight: "900",
    marginTop: -2,
  },
  holidayContent: {
    flex: 1,
  },
  holidayTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  holidaySubRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  holidaySubtitle: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 24,
    overflow: "hidden",
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  modalHeader: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  closeModalButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBody: {
    padding: 24,
    alignItems: "center",
  },
  modalHolidayTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },
  modalDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 20,
  },
  modalDateText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },
  modalDivider: {
    width: "100%",
    height: 1,
    backgroundColor: "#F1F5F9",
    marginBottom: 20,
  },
  modalDescription: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 28,
  },
  modalActionBtn: {
    width: "100%",
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  modalActionBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});