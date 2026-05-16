import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  Ionicons,
  MaterialCommunityIcons,
  Feather,
} from "@expo/vector-icons";

const feeData = [
  {
    id: "1",
    title: "Admission Fee",
    amount: 10000,
    date: "01 Jun 2025",
    status: "Paid",
  },
  {
    id: "2",
    title: "1st Term Fee",
    amount: 15000,
    date: "01 Aug 2025",
    status: "Paid",
  },
  {
    id: "3",
    title: "2nd Term Fee",
    amount: 15000,
    date: "01 Nov 2025",
    status: "Paid",
  },
  {
    id: "4",
    title: "3rd Term Fee",
    amount: 15000,
    date: "01 Feb 2026",
    status: "Pending",
  },
  {
    id: "5",
    title: "4th Term Fee",
    amount: 20000,
    date: "-",
    status: "Pending",
  },
];

const paymentHistory = [
  {
    id: "TXN_8829102",
    title: "Admission Fee",
    amount: "10,000",
    date: "01 Jun 2025",
    method: "UPI - PhonePe",
  },
  {
    id: "TXN_8830455",
    title: "1st Term Fee",
    amount: "15,000",
    date: "05 Aug 2025",
    method: "Credit Card",
  },
];

const FeeDetailsScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [selectedIds, setSelectedIds] = useState([]);

  // States for dynamic UI feedback
  const [isPaying, setIsPaying] = useState(false);
  const [downloadingReceiptId, setDownloadingReceiptId] = useState(null);
  const [isDownloadingStructure, setIsDownloadingStructure] = useState(false);

  // Formatting helper
  const formatCurr = (val) => `₹ ${val.toLocaleString("en-IN")}`;

  // Dynamic Calculations
  const { totalYearly, totalPaid, totalPending } = useMemo(() => {
    return feeData.reduce(
      (acc, item) => {
        acc.totalYearly += item.amount;
        if (item.status === "Paid") acc.totalPaid += item.amount;
        else acc.totalPending += item.amount;
        return acc;
      },
      { totalYearly: 0, totalPaid: 0, totalPending: 0 }
    );
  }, []);

  // Calculate amount currently selected for payment
  const selectedAmount = useMemo(() => {
    return feeData
      .filter((item) => selectedIds.includes(item.id))
      .reduce((sum, item) => sum + item.amount, 0);
  }, [selectedIds]);

  const toggleInstallment = useCallback((id, status) => {
    if (status === "Paid") return;
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const handlePayNow = () => {
    if (selectedAmount === 0) {
      Alert.alert("Selection Required", "Please select at least one installment to pay.");
      return;
    }

    setIsPaying(true);
    // Simulate professional payment gateway processing
    setTimeout(() => {
      setIsPaying(false);
      Alert.alert("Payment Success", `Successfully paid ${formatCurr(selectedAmount)}. Thank you!`);
      setSelectedIds([]); // Clear selection after payment
    }, 2200);
  };

  const handleDownloadReceipt = (id, title) => {
    setDownloadingReceiptId(id);
    // Simulate dynamic file generation
    setTimeout(() => {
      setDownloadingReceiptId(null);
    }, 1800);
  };

  const handleViewAllHistory = () => {
    // Implementation for navigating to full history list
    console.log("Navigate to full history");
  };

  const handleDownloadStructure = () => {
    setIsDownloadingStructure(true);
    // Simulate dynamic PDF download
    setTimeout(() => {
      setIsDownloadingStructure(false);
    }, 2000);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
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
          <Text style={styles.headerTitle}>Fee Details</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* Fee Summary */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Fee Summary</Text>
          <Text style={styles.academicYear}>Session 2025-26</Text>
        </View>

        <View style={styles.summaryCard}>
          {/* Total Fee */}
          <View style={styles.summaryItem}>
            <View
              style={[
                styles.iconBox,
                { backgroundColor: "#E8F0FF" },
              ]}
            >
              <Ionicons
                name="wallet-outline"
                size={26}
                color="#2563EB"
              />
            </View>

            <Text style={styles.summaryLabel}>
              Total Fee(Yearly)
            </Text>

            <Text style={styles.summaryAmount}>{formatCurr(totalYearly)}</Text>
          </View>

          {/* Paid */}
          <View style={styles.summaryItem}>
            <View
              style={[
                styles.iconBox,
                { backgroundColor: "#E7F8EC" },
              ]}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={26}
                color="#16A34A"
              />
            </View>

            <Text style={styles.summaryLabel}>Paid Amount</Text>

            <Text style={styles.summaryAmount}>{formatCurr(totalPaid)}</Text>
          </View>

          {/* Pending */}
          <View style={styles.summaryItem}>
            <View
              style={[
                styles.iconBox,
                { backgroundColor: "#FFF4E7" },
              ]}
            >
              <Feather
                name="clock"
                size={24}
                color="#D97706"
              />
            </View>

            <Text style={styles.summaryLabel}>
              Pending Amount
            </Text>

            <Text style={styles.summaryAmount}>{formatCurr(totalPending)}</Text>
          </View>
        </View>

        {/* Fee Details */}
        <View style={[styles.sectionHeader, { marginBottom: 12 }]}>
          <Text style={[styles.sectionTitle, styles.detailsHeading]}>Fee Details</Text>
        </View>

        <View style={styles.tableCard}>
          {/* Header Row */}
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { flex: 1.4 }]}>
              Installment
            </Text>

            <Text style={[styles.headerCell, { flex: 1 }]}>
              Amount(₹)
            </Text>

            <Text style={[styles.headerCell, { flex: 1.2 }]}>
              Paid Date
            </Text>

            <Text style={[styles.headerCell, { flex: 0.9 }]}>
              Status
            </Text>
          </View>

          {/* Table Rows */}
          {feeData.map((item, index) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.tableRow}
              onPress={() => toggleInstallment(item.id, item.status)}
              activeOpacity={item.status === "Paid" ? 1 : 0.7}
            >
              <View style={styles.installmentContainer}>
                <View style={[
                  styles.checkbox,
                  (item.status === "Paid" || selectedIds.includes(item.id)) && styles.checkboxActive,
                  item.status === "Paid" && { backgroundColor: "#16A34A", borderColor: "#16A34A" }
                ]}>
                  {(item.status === "Paid" || selectedIds.includes(item.id)) && (
                    <Ionicons name="checkmark" size={12} color="#fff" />
                  )}
                </View>

                <Text
                  style={[styles.rowText, styles.installmentText]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
              </View>

              <Text style={[styles.rowText, { flex: 1 }]}>
                {item.amount.toLocaleString("en-IN")}
              </Text>

              <Text style={[styles.rowText, { flex: 1.2 }]}>
                {item.date}
              </Text>

              <View
                style={[
                  styles.statusContainer,
                  { flex: 0.9 },
                ]}
              >
                {item.status === "Paid" ? (
                  <>
                    <View style={styles.paidBadge}>
                      <Text style={styles.paidText}>Paid</Text>
                    </View>

                    {downloadingReceiptId === item.id ? (
                      <ActivityIndicator size="small" color="#2563EB" style={{ marginLeft: 15 }} />
                    ) : (
                      <TouchableOpacity onPress={() => handleDownloadReceipt(item.id, item.title)}>
                        <Ionicons
                          name="download-outline"
                          size={17}
                          color="#2563EB"
                          style={{ marginLeft: 15 }}
                        />
                      </TouchableOpacity>
                    )}
                  </>
                ) : (
                  <Text style={[styles.rowText, { color: "#D97706", fontWeight: "600" }]}>Due</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}

          {/* Footer */}
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>
              Total Paid Amount
            </Text>

            <Text style={styles.totalAmount}>{formatCurr(totalPaid)}</Text>
          </View>
        </View>

        {/* Payment History */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>Payment History</Text>
          <TouchableOpacity onPress={handleViewAllHistory}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.historyContainer}>
          {paymentHistory.map((item, index) => (
            <View key={index} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <View style={styles.historyTitleRow}>
                  <Text style={styles.historyTitle}>{item.title}</Text>
                  <Text style={styles.historyAmount}>₹ {item.amount}</Text>
                </View>
                <Text style={styles.txnId}>ID: {item.id}</Text>
              </View>

              <View style={styles.historyFooter}>
                <View style={styles.methodGroup}>
                  <Feather name="credit-card" size={12} color="#6B7280" />
                  <Text style={styles.methodText}>{item.method}</Text>
                </View>
                <View style={styles.dateGroup}>
                  <Ionicons name="calendar-outline" size={12} color="#6B7280" />
                  <Text style={styles.historyDate}>{item.date}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Due Card */}
        <View style={styles.dueCard}>
          <View>
            <Text style={styles.dueLabel}>Total Due</Text>

            <Text style={styles.dueAmount}>{formatCurr(selectedAmount || totalPending)}</Text>

            <Text style={styles.dueDate}>
              Due on 15 Jun 2025
            </Text>
          </View>

          <View style={styles.rightSection}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.payButton, isPaying && { opacity: 0.7 }]}
              onPress={handlePayNow}
              disabled={isPaying}
            >
              {isPaying ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.payButtonText}>Pay Now</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.downloadButton, isDownloadingStructure && { opacity: 0.7 }]}
              onPress={handleDownloadStructure}
              disabled={isDownloadingStructure}
            >
              {isDownloadingStructure ? (
                <ActivityIndicator color="#444" size="small" />
              ) : (
                <>
                  <Ionicons
                    name="download-outline"
                    size={15}
                    color="#444"
                  />
                  <Text style={styles.downloadText}>Download Fee Structure</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Note */}
        <View style={styles.noteCard}>
          <View style={styles.noteIcon}>
            <Ionicons
              name="alert-circle"
              size={20}
              color="#16A34A"
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.noteTitle}>Note</Text>

            <Text style={styles.noteText}>
              Late fee of 100 per day will be applicable after the due date.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default FeeDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
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
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginHorizontal: 16,
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },

  academicYear: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
  
  detailsHeading: {
    marginLeft: 10, // Shifts the text right to align with the table content
    marginLeft: 16, // Further shift to align with the table card container
  },

  summaryCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 26,
    borderWidth: 1,
    borderColor: "#EEF2F7",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },

  summaryItem: {
    alignItems: "center",
    width: "30%",
  },

  iconBox: {
    width: 54,
    height: 54,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  summaryLabel: {
    fontSize: 12,
    color: "#444",
    textAlign: "center",
    marginBottom: 8,
  },

  summaryAmount: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
  },

  tableCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EEF2F7",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#EAF1FB",
    paddingVertical: 14,
    paddingHorizontal: 10,
  },

  headerCell: {
    fontSize: 11,
    fontWeight: "800",
    color: "#475569",
    textTransform: "uppercase",
  },

  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: "#F1F1F1",
  },

  installmentContainer: {
    flex: 1.5,
    flexDirection: "row",
    alignItems: "center",
  },

  installmentText: {
    fontWeight: "600",
    color: "#1F2937",
  },

  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginRight: 10,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },

  checkboxActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  rowText: {
    fontSize: 13,
    color: "#4B5563",
  },

  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  paidBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },

  paidText: {
    color: "#16A34A",
    fontSize: 10,
    fontWeight: "700",
  },

  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 16,
    backgroundColor: "#FDFDFD",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },

  totalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },

  totalAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#16A34A",
  },

  dueCard: {
    backgroundColor: "#FFEDEE",
    marginHorizontal: 16,
    marginTop: 26,
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  dueLabel: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },

  dueAmount: {
    fontSize: 36,
    fontWeight: "700",
    color: "#DC2626",
  },

  dueDate: {
    marginTop: 8,
    color: "#444",
    fontSize: 13,
  },

  rightSection: {
    alignItems: "center",
  },

  payButton: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 34,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },

  payButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
  },

  downloadText: {
    fontSize: 11,
    color: "#444",
    marginLeft: 6,
    fontWeight: "500",
  },

  noteCard: {
    backgroundColor: "#EEF8F1",
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  noteIcon: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: "#CDEADA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  noteTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#15803D",
    marginBottom: 6,
  },

  noteText: {
    fontSize: 12,
    color: "#666",
    lineHeight: 18,
  },

  viewAllText: {
    fontSize: 12,
    color: "#2563EB",
    fontWeight: "600",
  },

  historyContainer: {
    marginHorizontal: 16,
    gap: 12,
  },

  historyCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EEF2F7",
  },

  historyHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 10,
    marginBottom: 10,
  },

  historyTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },

  historyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },

  historyAmount: {
    fontSize: 15,
    fontWeight: "800",
    color: "#16A34A",
  },

  txnId: {
    fontSize: 11,
    color: "#6B7280",
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  historyFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  methodGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  dateGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  methodText: {
    fontSize: 11,
    color: "#4B5563",
    fontWeight: "500",
  },

  historyDate: {
    fontSize: 11,
    color: "#6B7280",
  },
});