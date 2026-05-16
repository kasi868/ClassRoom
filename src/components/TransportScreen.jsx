import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  memo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
  Alert,
  Modal,
  RefreshControl,
  Animated,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";

// --- Constants & Mock Data ---
const STORAGE_KEYS = {
  FILTER: "@transport_filter",
  EXPANDED: "@transport_expanded",
};

const MOCK_ROUTE_DATA = [
  { id: "1", place: "Green Park", sub: "(Stop No 5)", time: "08:30 AM" },
  { id: "2", place: "Saket Metro Station", time: "08:45 AM" },
  { id: "3", place: "Panchsheel Enclave", time: "09:00 AM" },
  { id: "4", place: "Malviya Nagar", time: "09:10 AM" },
  { id: "5", place: "School", time: "09:20 AM" },
];

const MOCK_INSTALLMENTS = [
  {
    id: "i1",
    title: "1st Installment",
    amount: 4000,
    due: "01/04/2025",
    status: "Paid",
  },
  {
    id: "i2",
    title: "2nd Installment",
    amount: 4000,
    due: "01/07/2025",
    status: "Due",
  },
  {
    id: "i3",
    title: "3rd Installment",
    amount: 4000,
    due: "01/10/2025",
    status: "Upcoming",
  },
  {
    id: "i4",
    title: "4th Installment",
    amount: 4000,
    due: "01/01/2026",
    status: "Upcoming",
  },
];

const BUS_CONFIG = {
  number: "DL 01 AB 1234",
  driver: { name: "Narasimha", phone: "+919898767654" },
  helper: { name: "Revanth", phone: "+919098767654" },
};

// --- Reusable Components (Memoized for Performance) ---

const InfoCard = memo(
  ({ icon, iconBg, title, value, subtitle, onAction, onLongPress }) => (
    <TouchableOpacity
      activeOpacity={onAction ? 0.7 : 1}
      onPress={onAction}
      onLongPress={onLongPress}
      style={styles.infoCard}
    >
      <View style={[styles.iconBox, { backgroundColor: iconBg }]}>{icon}</View>
      <Text style={styles.infoTitle} accessibilityLabel={title}>
        {title}
      </Text>
      <Text style={styles.infoValue}>{value}</Text>
      {subtitle && <Text style={styles.infoSub}>{subtitle}</Text>}
    </TouchableOpacity>
  ),
);

const FeeCard = memo(({ title, amount, color, bgColor }) => (
  <View style={[styles.feeCard, { backgroundColor: bgColor }]}>
    <Text style={[styles.feeTitle, { color }]}>{title}</Text>
    <Text style={[styles.feeAmount, { color }]}>
      ₹ {amount.toLocaleString("en-IN")}
    </Text>
  </View>
));

// --- Main Screen ---

const TransportScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [installmentFilter, setInstallmentFilter] = useState("All");
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  // Animation Refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const modalSlideAnim = useRef(new Animated.Value(300)).current;

  // Load Persisted Settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const filter = await AsyncStorage.getItem(STORAGE_KEYS.FILTER);
        if (filter) setInstallmentFilter(filter);

        // Initial entrance animation
        setLoading(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      } catch (e) {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  // Time Utilities
  const getMinutesFromTime = (timeStr) => {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":");
    if (hours === "12") hours = "00";
    if (modifier === "PM") hours = parseInt(hours, 10) + 12;
    return parseInt(hours, 10) * 60 + parseInt(minutes, 10);
  };

  const currentTimeMinutes = useMemo(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }, [refreshing]);

  // Dynamic Logic: Bus Status
  const busStatus = useMemo(() => {
    const firstStopTime = getMinutesFromTime(MOCK_ROUTE_DATA[0].time);
    const lastStopTime = getMinutesFromTime(
      MOCK_ROUTE_DATA[MOCK_ROUTE_DATA.length - 1].time,
    );

    if (currentTimeMinutes < firstStopTime - 10)
      return { label: "On Time", color: "#2D7FF9", bg: "#EEF5FF" };
    if (
      currentTimeMinutes >= firstStopTime - 10 &&
      currentTimeMinutes <= lastStopTime
    )
      return { label: "Arriving", color: "#27AE60", bg: "#EEFDF3" };
    return { label: "Delayed", color: "#EB5757", bg: "#FFECEC" };
  }, [currentTimeMinutes]);

  // Dynamic Logic: Route Progress
  const processedRoute = useMemo(() => {
    return MOCK_ROUTE_DATA.map((item) => {
      const stopTime = getMinutesFromTime(item.time);
      return {
        ...item,
        isCompleted: currentTimeMinutes > stopTime,
        isActive: Math.abs(currentTimeMinutes - stopTime) <= 5,
      };
    });
  }, [currentTimeMinutes]);

  // Smart Fee Calculation
  const feeStats = useMemo(() => {
    const total = MOCK_INSTALLMENTS.reduce((sum, item) => sum + item.amount, 0);
    const paid = MOCK_INSTALLMENTS.filter((i) => i.status === "Paid").reduce(
      (sum, item) => sum + item.amount,
      0,
    );
    const pending = total - paid;
    const nextDue =
      MOCK_INSTALLMENTS.find((i) => i.status === "Due")?.due || "N/A";
    return { total, paid, pending, nextDue };
  }, []);

  const filteredInstallments = useMemo(() => {
    if (installmentFilter === "All") return MOCK_INSTALLMENTS;
    return MOCK_INSTALLMENTS.filter((i) => i.status === installmentFilter);
  }, [installmentFilter]);

  // Actions
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const openContactModal = useCallback(
    (contact, role) => {
      setSelectedContact({ ...contact, role });
      setContactModalVisible(true);
      Animated.spring(modalSlideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }).start();
    },
    [modalSlideAnim],
  );

  const closeContactModal = useCallback(() => {
    Animated.timing(modalSlideAnim, {
      toValue: 300,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setContactModalVisible(false));
  }, [modalSlideAnim]);

  const copyToClipboard = async (text, label) => {
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied", `${label} copied to clipboard.`);
  };

  const toggleRoute = () => {
    const toValue = isRouteExpanded ? 0 : 1;
    Animated.spring(expandAnim, {
      toValue,
      useNativeDriver: false, // Height animation requires false
      friction: 8,
    }).start();
    setIsRouteExpanded(!isRouteExpanded);
    AsyncStorage.setItem(STORAGE_KEYS.EXPANDED, String(!isRouteExpanded));
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2D7FF9" />
      </View>
    );
  }

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
          <Text style={styles.headerTitle}>Transport</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* Live Status Badge */}
        <View style={styles.statusBadgeWrapper}>
          <View style={[styles.liveBadge, { backgroundColor: busStatus.bg }]}>
            <View
              style={[styles.pulseDot, { backgroundColor: busStatus.color }]}
            />
            <Text style={[styles.liveBadgeText, { color: busStatus.color }]}>
              Status: {busStatus.label}
            </Text>
          </View>
        </View>

        {/* Bus Information */}
        <Text style={styles.sectionTitle}>Bus Information</Text>
        <View style={styles.infoContainer}>
          <InfoCard
            icon={<Ionicons name="bus" size={22} color="#2D7FF9" />}
            iconBg="#EAF3FF"
            title="Bus Number"
            value={BUS_CONFIG.number}
          />
          <InfoCard
            icon={<Ionicons name="location-sharp" size={20} color="#27AE60" />}
            iconBg="#EAF9F0"
            title="Route / Stop"
            value="Green park"
            subtitle="(Stop no 5)"
          />
          <InfoCard
            icon={
              <MaterialIcons name="emoji-people" size={22} color="#E67E22" />
            }
            iconBg="#FFF4EA"
            title="Driver"
            value={BUS_CONFIG.driver.name}
            subtitle={BUS_CONFIG.driver.phone}
            onAction={() => openContactModal(BUS_CONFIG.driver, "Driver")}
          />
          <InfoCard
            icon={<Feather name="user" size={20} color="#B05CFF" />}
            iconBg="#F5ECFF"
            title="Helper"
            value={BUS_CONFIG.helper.name}
            subtitle={BUS_CONFIG.helper.phone}
            onAction={() => openContactModal(BUS_CONFIG.helper, "Helper")}
          />
        </View>

        {/* Bus Route Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Bus Route</Text>
        </View>

        <View style={styles.routeCard}>
          <View style={styles.routeHeader}>
            <Text style={styles.morningText}>Morning</Text>
            <Text style={styles.eveningText}>Evening</Text>
          </View>

          {processedRoute.length === 0 ? (
            <Text style={styles.emptyText}>No stops found.</Text>
          ) : (
            processedRoute.map((item, index) => (
              <View key={item.id} style={styles.routeRow}>
                <View style={styles.timelineContainer}>
                  <View
                    style={[
                      styles.circle,
                      item.isCompleted && styles.completedCircle,
                      item.isActive && styles.activeCircle,
                    ]}
                  />
                  {index !== processedRoute.length - 1 && (
                    <View style={styles.line} />
                  )}
                </View>
                <View style={styles.routePlaceContainer}>
                  <Text
                    style={[
                      styles.routePlace,
                      item.isActive && styles.activePlace,
                      item.isCompleted && styles.completedPlace,
                    ]}
                  >
                    {item.place}{" "}
                    {item.sub && (
                      <Text style={styles.routeSub}>{item.sub}</Text>
                    )}
                  </Text>
                </View>
                <Text style={styles.routeTime}>{item.time}</Text>
              </View>
            ))
          )}
        </View>

        {/* Fee Details */}
        <Text style={styles.sectionTitle}>Transport Fee Details</Text>
        <View style={styles.feeContainer}>
          <FeeCard
            title="Annual Fee"
            amount={feeStats.total}
            color="#2D7FF9"
            bgColor="#EEF5FF"
          />
          <FeeCard
            title="Paid Amount"
            amount={feeStats.paid}
            color="#27AE60"
            bgColor="#EEFDF3"
          />
          <FeeCard
            title="Pending Amount"
            amount={feeStats.pending}
            color="#F2994A"
            bgColor="#FFF6EB"
          />
          <FeeCard
            title="Next Due Date"
            amount={feeStats.nextDue}
            color="#9B51E0"
            bgColor="#F5ECFF"
          />
        </View>

        {/* Installments Table */}
        <Text style={styles.sectionTitle}>Fee Installment Details</Text>

        {/* Filter Chips */}
        <View style={styles.filterContainer}>
          {["All", "Paid", "Due", "Upcoming"].map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => {
                setInstallmentFilter(f);
                AsyncStorage.setItem(STORAGE_KEYS.FILTER, f);
              }}
              style={[
                styles.filterChip,
                installmentFilter === f && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  installmentFilter === f && styles.filterTextActive,
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, { flex: 1.5 }]}>Installment</Text>
            <Text style={[styles.headerText, { flex: 1 }]}>Amount</Text>
            <Text style={[styles.headerText, { flex: 1 }]}>Due Date</Text>
            <Text
              style={[styles.headerText, { flex: 0.8, textAlign: "center" }]}
            >
              Status
            </Text>
          </View>

          {filteredInstallments.length === 0 ? (
            <Text style={styles.emptyTableText}>
              No data available for this filter.
            </Text>
          ) : (
            filteredInstallments.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.tableRow,
                  index === filteredInstallments.length - 1 && {
                    borderBottomWidth: 0,
                  },
                ]}
              >
                <Text style={[styles.rowText, { flex: 1.5 }]}>
                  {item.title}
                </Text>
                <Text style={[styles.rowText, { flex: 1 }]}>
                  ₹{item.amount.toLocaleString()}
                </Text>
                <Text style={[styles.rowText, { flex: 1 }]}>{item.due}</Text>
                <View style={{ flex: 0.8, alignItems: "center" }}>
                  <View
                    style={[
                      styles.statusBadge,
                      item.status === "Paid" && styles.paidBadge,
                      item.status === "Due" && styles.dueBadge,
                      item.status === "Upcoming" && styles.upcomingBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        item.status === "Paid" && styles.paidText,
                        item.status === "Due" && styles.dueText,
                        item.status === "Upcoming" && styles.upcomingText,
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Premium Contact Action Sheet */}
      <Modal
        visible={contactModalVisible}
        transparent
        animationType="none"
        onRequestClose={closeContactModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={closeContactModal}
          />
          <Animated.View
            style={[
              styles.contactSheet,
              {
                transform: [{ translateY: modalSlideAnim }],
                paddingBottom: Math.max(insets.bottom, 20),
              },
            ]}
          >
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <View style={styles.contactAvatar}>
                <Text style={styles.avatarText}>
                  {selectedContact?.name?.charAt(0)}
                </Text>
              </View>
              <View>
                <Text style={styles.sheetRole}>{selectedContact?.role}</Text>
                <Text style={styles.sheetName}>{selectedContact?.name}</Text>
              </View>
            </View>

            <View style={styles.actionGrid}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => Linking.openURL(`tel:${selectedContact?.phone}`)}
              >
                <View
                  style={[styles.actionIcon, { backgroundColor: "#EEFDF3" }]}
                >
                  <Ionicons name="call" size={24} color="#27AE60" />
                </View>
                <Text style={styles.actionText}>Call</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => Linking.openURL(`sms:${selectedContact?.phone}`)}
              >
                <View
                  style={[styles.actionIcon, { backgroundColor: "#EEF5FF" }]}
                >
                  <Ionicons name="chatbubble" size={24} color="#2D7FF9" />
                </View>
                <Text style={styles.actionText}>Message</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() =>
                  copyToClipboard(selectedContact?.phone, "Phone Number")
                }
              >
                <View
                  style={[styles.actionIcon, { backgroundColor: "#F5F7FB" }]}
                >
                  <Ionicons name="copy" size={24} color="#666" />
                </View>
                <Text style={styles.actionText}>Copy</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.cancelSheetBtn}
              onPress={closeContactModal}
            >
              <Text style={styles.cancelSheetText}>Dismiss</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

export default TransportScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FB" },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 15,
    marginBottom: 10,
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
  headerPlaceholder: { width: 40 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
    marginHorizontal: 16,
    marginBottom: 14,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 20,
  },
  statusBadgeWrapper: {
    paddingHorizontal: 16,
    marginBottom: 15,
    alignItems: "center",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  pulseDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  liveBadgeText: {
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  infoContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginBottom: 24,
  },
  infoCard: {
    width: "48%",
    backgroundColor: "#FFF",
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 12,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 11,
    color: "#888",
    textAlign: "center",
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
    textAlign: "center",
  },
  infoSub: { fontSize: 11, color: "#666", textAlign: "center", marginTop: 4 },
  routeCard: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    overflow: "hidden",
  },
  routeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
    paddingHorizontal: 12,
  },
  morningText: { color: "#2D7FF9", fontWeight: "700", fontSize: 14 },
  eveningText: { color: "#B8B8B8", fontWeight: "600", fontSize: 14 },
  routeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  timelineContainer: { width: 20, alignItems: "center" },
  circle: {
    width: 11,
    height: 11,
    borderRadius: 20,
    borderWidth: 1.8,
    borderColor: "#9B9B9B",
    backgroundColor: "#FFF",
  },
  completedCircle: { borderColor: "#27AE60", backgroundColor: "#27AE60" },
  activeCircle: {
    borderColor: "#2D7FF9",
    backgroundColor: "#2D7FF9",
    transform: [{ scale: 1.2 }],
  },
  line: { width: 1.5, height: 34, backgroundColor: "#E0E0E0", marginTop: 2 },
  routePlaceContainer: { flex: 1, paddingLeft: 10 },
  routePlace: { fontSize: 14, color: "#444", fontWeight: "500" },
  activePlace: { color: "#2D7FF9", fontWeight: "700" },
  completedPlace: { color: "#0b150f", opacity: 0.7 , fontWeight: "600"},
  routeSub: { color: "#888", fontSize: 12 },
  routeTime: { fontSize: 13, color: "#111", fontWeight: "700" },
  feeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginBottom: 24,
  },
  feeCard: {
    width: "48%",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  feeTitle: { fontSize: 11, fontWeight: "600", marginBottom: 8 },
  feeAmount: { fontSize: 18, fontWeight: "700" },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 15,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  filterChipActive: { backgroundColor: "#2D7FF9", borderColor: "#2D7FF9" },
  filterText: { fontSize: 12, color: "#666", fontWeight: "600" },
  filterTextActive: { color: "#FFF" },
  tableCard: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    marginHorizontal: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#EDF3FC",
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  headerText: { fontSize: 12, fontWeight: "700", color: "#333" },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  rowText: { fontSize: 12, color: "#333" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: "700" },
  paidBadge: { backgroundColor: "#E9F9EE" },
  paidText: { color: "#27AE60" },
  dueBadge: { backgroundColor: "#FFECEC" },
  dueText: { color: "#EB5757" },
  upcomingBadge: { backgroundColor: "#FFF3E5" },
  upcomingText: { color: "#F2994A" },
  emptyText: { textAlign: "center", color: "#999", marginVertical: 20 },
  emptyTableText: { textAlign: "center", padding: 30, color: "#999" },

  // Modal & Action Sheet Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  contactSheet: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 12,
    paddingHorizontal: 24,
  },
  sheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 20,
  },
  sheetHeader: { flexDirection: "row", alignItems: "center", marginBottom: 25 },
  contactAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#EAF3FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: { fontSize: 20, fontWeight: "700", color: "#2D7FF9" },
  sheetRole: {
    fontSize: 12,
    color: "#888",
    textTransform: "uppercase",
    fontWeight: "700",
    marginBottom: 2,
  },
  sheetName: { fontSize: 18, fontWeight: "800", color: "#111" },
  actionGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  actionBtn: { alignItems: "center", width: "30%" },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionText: { fontSize: 13, fontWeight: "600", color: "#444" },
  cancelSheetBtn: {
    backgroundColor: "#F5F7FB",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
  },
  cancelSheetText: { fontSize: 15, fontWeight: "700", color: "#666" },
});
