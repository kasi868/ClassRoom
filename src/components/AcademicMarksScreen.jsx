import React, { useState, useMemo, useCallback, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  Ionicons,
  MaterialCommunityIcons,
  Feather,
} from "@expo/vector-icons";

// Production-level Mock Data Structure
export const ACADEMIC_RECORDS = [
  { id: 1, subject: "English", marks: 98, total: 100, grade: "A+", remarks: "Outstanding" },
  { id: 2, subject: "Mathematics", marks: 99, total: 100, grade: "A+", remarks: "Outstanding" },
  { id: 3, subject: "Hindi", marks: 95, total: 100, grade: "A+", remarks: "Outstanding" },
  { id: 4, subject: "Telugu", marks: 98, total: 100, grade: "A+", remarks: "Outstanding" },
  { id: 5, subject: "Science", marks: 97, total: 100, grade: "A+", remarks: "Outstanding" },
  { id: 6, subject: "Social", marks: 96, total: 100, grade: "A+", remarks: "Outstanding" },
];

const MarksRow = memo(({ item, index, totalRows }) => (
  <View 
    style={[
      styles.tableRow, 
      index === totalRows - 1 && { borderBottomWidth: 0 }
    ]}
  >
    <View style={{ flex: 1.5 }}>
      <Text style={[styles.rowText, styles.subjectName]}>
        {item.subject}
      </Text>
    </View>
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={styles.rowText}>
        {item.marks} <Text style={styles.totalBaseText}>/ {item.total || 100}</Text>
      </Text>
    </View>
    <View style={[{ flex: 0.7, alignItems: 'center' }]}>
      <View style={[styles.gradeBadge, { backgroundColor: item.grade.includes('A') ? '#DCFCE7' : '#DBEAFE' }]}>
        <Text style={[styles.gradeText, { color: item.grade.includes('A') ? '#16A34A' : '#2563EB' }]}>
          {item.grade}
        </Text>
      </View>
    </View>
    <Text style={[styles.rowText, styles.remarksText, { flex: 1.2, textAlign: 'right' }]} numberOfLines={1}>
      {item.remarks}
    </Text>
  </View>
));

const AcademicMarksScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  // State management
  const [isDownloading, setIsDownloading] = useState(false);

  // Data Logic
  const stats = useMemo(() => {
    const totalObtained = ACADEMIC_RECORDS.reduce((acc, curr) => acc + curr.marks, 0);
    const totalPossible = ACADEMIC_RECORDS.reduce((acc, curr) => acc + (curr.total || 100), 0);
    const numericPercentage = (totalObtained / totalPossible) * 100;
    
    return {
      percentage: `${numericPercentage.toFixed(1)}%`,
      isTopPerformer: numericPercentage > 95,
      subjectCount: ACADEMIC_RECORDS.length,
      rank: numericPercentage > 90 ? "1st" : numericPercentage > 85 ? "3rd" : "5th"
    };
  }, []);

  const handleDownloadReport = useCallback(() => {
    setIsDownloading(true);
    // Simulate professional PDF generation and download
    setTimeout(() => {
      setIsDownloading(false);
      Alert.alert(
        "Download Complete",
        "The half yearly report card has been saved to your downloads.",
        [{ text: "View File", onPress: () => console.log("Open PDF") }, { text: "OK" }]
      );
    }, 2000);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingBottom: Math.max(insets.bottom, 30),
          backgroundColor: "#F7F8FA" 
        }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={26} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Academic Marks</Text>
          <TouchableOpacity 
            onPress={handleDownloadReport}
            disabled={isDownloading}
            style={styles.downloadHeaderBtn}
          >
            {isDownloading ? (
              <ActivityIndicator size="small" color="#2563EB" />
            ) : (
              <Feather name="download" size={20} color="#2563EB" />
            )}
          </TouchableOpacity>
        </View>

        {/* Top Blue Card */}
        <View style={styles.topCard}>
          {/* Student */}
          <View style={styles.studentRow}>
            <Image
              source={{
                uri: "https://randomuser.me/api/portraits/men/46.jpg",
              }}
              style={styles.studentImage}
            />
              <View style={{ flex: 1 }}>
                <View style={styles.nameBadgeRow}>
                  <Text style={styles.studentName}>
                    Alex Johnson
                  </Text>
                  {stats.isTopPerformer && (
                    <View style={styles.topPerformerBadge}>
                      <Ionicons name="trophy" size={10} color="#FFD700" />
                      <Text style={styles.topPerformerText}>TOP PERFORMER</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.studentClass}>
                  Grade 10 - Section A
                </Text>
              </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            {/* Overall */}
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>
                Overall
              </Text>

              <Text style={styles.statValue}>
                {stats.percentage}
              </Text>
            </View>

            {/* Rank */}
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>
                Rank
              </Text>

              <Text style={styles.statValue}>
                {stats.rank}
              </Text>
            </View>

            {/* Subjects */}
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>
                Subjects
              </Text>

              <Text style={styles.statValue}>
                {stats.subjectCount}
              </Text>
            </View>
          </View>
        </View>

        {/* Subject Wise Marks Section */}
        <Text style={styles.subjectTitle}>
          Subject Wise Marks
        </Text>

        {/* Simplified Marks Table */}
        <View style={styles.tableCard}>
          {/* Table Header Row */}
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { flex: 1.5 }]}>Subject</Text>
            <Text style={[styles.headerCell, { flex: 1, textAlign: 'center' }]}>Obtained</Text>
            <Text style={[styles.headerCell, { flex: 0.7, textAlign: 'center' }]}>Grade</Text>
            <Text style={[styles.headerCell, { flex: 1.2, textAlign: 'right' }]}>Remarks</Text>
          </View>
          
          {/* Table Data Rows */}
          {ACADEMIC_RECORDS.map((item, index) => (
            <MarksRow 
              key={item.id}
              item={item} 
              index={index} 
              totalRows={ACADEMIC_RECORDS.length} 
            />
          ))}
        </View>

        {/* Teacher Feedback Card */}
        <View style={styles.messageCard}>
          <View style={styles.messageIcon}>
            <Ionicons name="star" size={20} color="#2563EB" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.messageTitle}>Class Teacher's Note</Text>
            <Text style={styles.messageText}>
              "Alex continues to demonstrate exceptional analytical skills, especially in STEM subjects. Consistent effort in Social Studies will yield even better overall results."
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default AcademicMarksScreen;

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
    color: "#111827",
    flex: 1,
    textAlign: "center",
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },

  downloadHeaderBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  headerPlaceholder: {
    width: 40,
  },

  topCard: {
    backgroundColor: "#1D4ED8",
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomLeftRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#1D4ED8",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    paddingBottom: 32,
  },

  studentRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  studentImage: { width: 64, height: 64, borderRadius: 32, borderWidth: 3, borderColor: "rgba(255,255,255,0.3)", marginRight: 16 },
  nameBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  topPerformerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.4)',
  },
  topPerformerText: {
    color: '#FFD700',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  gradeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 32,
    alignItems: 'center',
  },
  totalBaseText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  studentName: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },

  studentClass: {
    color: "#DCE7FF",
    fontSize: 13,
    marginTop: 4,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },

  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginRight: 10,
  },

  statLabel: {
    color: "#DCE7FF",
    fontSize: 12,
    marginBottom: 8,
  },

  statValue: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
  },

  selectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    marginHorizontal: 14,
    marginBottom: 14,
  },

  selectionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  selectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },

  examPickerTrigger: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },

  examPickerText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563EB",
  },

  downloadBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0", 
  },

  marksList: {
    marginHorizontal: 14,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E293B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  subjectCount: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94A3B8",
  },

  tableCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginHorizontal: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    overflow: "hidden",
  },

  subjectTitle: {
    marginTop: 32,
    marginLeft: 20,
    marginBottom: 12,
    fontSize: 19,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: 0.1,
    lineHeight: 24,
  },

  tableHeader: { flexDirection: "row", backgroundColor: "#F8FAFC", paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },

  headerCell: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    textTransform: "uppercase",
  },

  tableRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    paddingVertical: 18, 
    paddingHorizontal: 20, 
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  rowText: {
    fontSize: 14,
    color: "#334155",
    fontWeight: "500",
  },

  subjectName: {
    fontWeight: "700",
  },

  gradeText: { 
    fontWeight: "900", fontSize: 12 
  },

  messageCard: {
    backgroundColor: "#EAF1FF",
    marginHorizontal: 14,
    marginTop: 22,
    borderRadius: 14,
    padding: 16,

    flexDirection: "row",
    alignItems: "flex-start",
  },

  messageIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#DCE7FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  messageTitle: {
    color: "#2563EB",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },

  messageText: {
    color: "#475569",
    fontSize: 12,
    lineHeight: 18,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    width: '80%',
    maxHeight: '60%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  dropdownHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'center',
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  monthOption: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  activeMonthOption: {
    backgroundColor: '#EFF6FF',
  },
  monthOptionText: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
  },
  activeMonthOptionText: {
    color: '#2563EB',
    fontWeight: '700',
  },
  remarksText: {
    color: "#64748B",
  }
});