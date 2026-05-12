import React, { useState, useEffect, useMemo, useCallback, useRef, memo, useLayoutEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
  Animated,
  Easing,
  Platform,
  UIManager,
  LayoutAnimation,
  RefreshControl,
  FlatList,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";

import {
  Ionicons,
  MaterialCommunityIcons,
  Feather,
} from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard"; // Correct import for Clipboard

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

// Production-level Daily Schedule Configuration
const DAILY_SCHEDULE = [
  {
    id: 'math-101',
    title: "Advanced Mathematics",
    subtitle: "Calculus II - Differential Equations",
    teacher: "Dr. Michael Chen",
    role: "Mathematics Professor",
    start: "09:00",
    end: "10:30",
    meetingLink: "meet.edu/math-calc-2-session",
    maxCapacity: 60,
    teacherAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: 'phys-202',
    title: "Physics Fundamentals",
    subtitle: "Quantum Mechanics & Wave Theory",
    teacher: "Prof. Sarah Jenkins",
    role: "Physics HOD",
    start: "11:30",
    end: "13:00",
    meetingLink: "meet.edu/physics-quantum-101",
    maxCapacity: 45,
    teacherAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: 'eng-303',
    title: "English Literature",
    subtitle: "Shakespearean Tragedies & Sonnets",
    teacher: "Ms. Elena Rodriguez",
    role: "Literature Specialist",
    start: "14:30",
    end: "16:00",
    meetingLink: "meet.edu/eng-lit-shakespeare",
    maxCapacity: 50,
    teacherAvatar: "https://randomuser.me/api/portraits/women/65.jpg",
  }
];

const MOCK_PREVIOUS_SESSIONS = [
  {
    id: 3,
    title: "Algebraic Structures",
    date: "Dec 20, 2024",
    duration: "1h 10min",
    tag: "Abstract Algebra",
    image: "https://images.unsplash.com/photo-1596495578065-6f8d56b17a02?q=80&w=400",
    status: "Completed",
    isRecent: true,
  },
  {
    id: 1,
    title: "Integration Techniques",
    date: "Dec 18, 2024",
    duration: "58 min",
    tag: "Calculus",
    image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=400",
    status: "Completed",
  },
  {
    id: 2,
    title: "Limits & Continuity",
    date: "Dec 15, 2024",
    duration: "1h 7min",
    tag: "Theory",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=400",
    status: "Completed",
  },
];

// --- Sub-Components ---

const SessionCard = memo(({ item }) => (
  <TouchableOpacity activeOpacity={0.85} style={styles.previousCard}>
    <View style={styles.imageContainer}>
      <Image source={{ uri: item.image }} style={styles.previousImage} />
      <View style={styles.durationBadge}>
        <Text style={styles.durationText}>{item.duration}</Text>
      </View>
    </View>
    <View style={{ flex: 1 }}>
      <View style={styles.tagRow}>
        <View style={styles.subjectTag}><Text style={styles.tagText}>{item.tag}</Text></View>
        {item.isRecent && <View style={[styles.subjectTag, { backgroundColor: '#EEF2FF' }]}><Text style={[styles.tagText, { color: '#2563EB' }]}>New</Text></View>}
      </View>
      <Text style={styles.previousSubject}>{item.title}</Text>
      <Text style={styles.previousDate}>{item.date} • Recorded</Text>
      <View style={styles.watchRow}>
        <Ionicons name="play-circle" size={16} color="#2563EB" />
        <Text style={styles.recordingText}>Watch Recording</Text>
      </View>
    </View>
  </TouchableOpacity>
));

const ScheduleItem = memo(({ item, isCurrent, currentTime }) => {
  const isPast = currentTime > item.endTime;
  const isLive = currentTime >= item.startTime && currentTime <= item.endTime;

  return (
    <View style={styles.scheduleWrapper}>
      <View style={styles.timeColumn}>
        <Text style={[styles.timeText, isLive && styles.activeTimeText]}>{item.start}</Text>
        <View style={styles.timeline}>
          <View style={[styles.timelineDot, (isLive || isPast) && styles.activeDot]} />
          <View style={[styles.timelineLine, isPast && styles.activeLineLine]} />
        </View>
        <Text style={styles.endTimeText}>{item.end}</Text>
      </View>
      
      <TouchableOpacity 
        activeOpacity={0.8}
        style={[
          styles.scheduleCard, 
          isCurrent && styles.activeScheduleCard,
          isPast && styles.pastScheduleCard
        ]}
      >
        <View style={styles.scheduleCardHeader}>
          <Text style={[styles.scheduleCardTitle, isCurrent && styles.activeCardTitle]} numberOfLines={1}>
            {item.title}
          </Text>
          {isLive && (
            <View style={styles.liveIndicatorSmall}>
              <View style={styles.liveIndicatorDotSmall} />
              <Text style={styles.liveIndicatorTextSmall}>LIVE</Text>
            </View>
          )}
          {isPast && <Ionicons name="checkmark-done" size={18} color="#16A34A" />}
        </View>
        
        <Text style={styles.scheduleCardSubtitle} numberOfLines={1}>{item.subtitle}</Text>
        
        <View style={styles.scheduleCardFooter}>
          <View style={styles.scheduleTeacherRow}>
            <Image source={{ uri: item.teacherAvatar }} style={styles.scheduleTeacherAvatar} />
            <Text style={styles.scheduleTeacherName}>{item.teacher}</Text>
          </View>
          <View style={styles.scheduleRoomBadge}>
            <Ionicons name="location-outline" size={12} color="#64748B" />
            <Text style={styles.scheduleRoomText}>Room 201</Text>
          </View>
        </View>

        {isCurrent && (
          <View style={styles.activePill}>
            <Ionicons name="play" size={10} color="#FFF" />
            <Text style={styles.activePillText}>Current</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
});

const ClassInformationCard = memo(({
  joinedCount, maxCapacity, classStatus, activeSession, pulseAnim,
}) => {
  const timeStr = useMemo(() => {
    return new Date(activeSession.startTime).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });
  }, [activeSession.startTime]);

  const isStarted = classStatus === "LIVE" || classStatus === "ENDING_SOON" || classStatus === "COMPLETED";

  return (
    <View style={styles.classInfoCard}>
      <View style={styles.infoGridContainer}>
        <View style={styles.infoRow}>
          {isStarted && (
            <View style={styles.infoBlock}>
              <View style={[styles.infoBlockIconContainer, { backgroundColor: '#F0F9FF' }]}>
                <Ionicons name="people" size={18} color="#0EA5E9" />
              </View>
              <View style={styles.infoBlockContent}>
                <Text style={styles.infoBlockLabel}>{classStatus === "COMPLETED" ? "Total Attendance" : "Participants"}</Text>
                <View style={styles.participantValueRow}>
                  <Text style={styles.infoBlockValue}>{joinedCount}</Text>
                  <Text style={styles.capacityText}>/ {maxCapacity} joined</Text>
                </View>
              </View>
            </View>
          )}
          
          <View style={styles.infoBlock}>
            <View style={[styles.infoBlockIconContainer, { backgroundColor: classStatus === "UPCOMING" ? '#FFFBEB' : '#F0FDF4' }]}>
              <Ionicons 
                name={classStatus === "UPCOMING" ? "calendar" : "play-circle"} 
                size={18} 
                color={classStatus === "UPCOMING" ? "#D97706" : "#16A34A"} 
              />
            </View>
            <View style={styles.infoBlockContent}>
              <Text style={styles.infoBlockLabel}>{classStatus === "UPCOMING" ? "Scheduled At" : "Started At"}</Text>
              <Text style={styles.infoBlockValue}>{timeStr}</Text>
            </View>
          </View>
        </View>

        {(isStarted || classStatus === "UPCOMING") && (
        <View style={[styles.infoFooter, !isStarted && { borderTopWidth: 0, marginTop: 0, paddingTop: 0 }]}>
          {isStarted ? (
          <View style={styles.participantSummary}>
            <View style={styles.peersIconBox}>
              <Ionicons name="radio-outline" size={14} color="#64748B" />
            </View>
            <Text style={styles.activePeersText}>
              {classStatus === "LIVE" ? `${joinedCount} active now` : `${joinedCount} attended`}
            </Text>
          </View>
          ) : (
            <View style={styles.participantSummary}>
              <Ionicons name="information-circle-outline" size={16} color="#64748B" />
              <Text style={styles.activePeersText}>Class hasn't started yet</Text>
            </View>
          )}
          
          {(classStatus === "LIVE" || classStatus === "ENDING_SOON") && (
            <View style={styles.liveIndicatorContainer}>
              <Animated.View style={[styles.liveIndicatorDot, { opacity: pulseAnim }]} />
              <Text style={styles.liveIndicatorText}>LIVE NOW</Text>
            </View>
          )}
        </View>
        )}
      </View>
    </View>
  );
});

const LiveClassesScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const classInfoCardAnim = useRef(new Animated.Value(0)).current; // For the new card's appearance
  const joiningOpacity = useRef(new Animated.Value(0)).current;
  const joiningScale = useRef(new Animated.Value(0.9)).current;
  const progressBarWidth = useRef(new Animated.Value(0)).current;

  const [activeTab, setActiveTab] = useState("schedule");
  const [currentTime, setCurrentTime] = useState(new Date().getTime());
  const [refreshing, setRefreshing] = useState(false);
  const [joinedCount, setJoinedCount] = useState(12); // Initial joined count
  const [isLinkCopied, setIsLinkCopied] = useState(false); // State for copy feedback
  const [isJoining, setIsJoining] = useState(false);
  const [joiningStatus, setJoiningStatus] = useState("");

  // Convert schedule to absolute timestamps for today
  const todaySchedule = useMemo(() => {
    const now = new Date();
    return DAILY_SCHEDULE.map(session => {
      const [startH, startM] = session.start.split(':').map(Number);
      const [endH, endM] = session.end.split(':').map(Number);
      const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startH, startM).getTime();
      const endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endH, endM).getTime();
      return { ...session, startTime, endTime };
    });
  }, []);

  // Find the most relevant session for the Hero section
  const activeSession = useMemo(() => {
    // 1. Check for live/ending soon
    const live = todaySchedule.find(s => currentTime >= s.startTime && currentTime <= s.endTime);
    if (live) return live;

    // 2. Check for upcoming
    const next = todaySchedule.find(s => currentTime < s.startTime);
    if (next) return next;

    // 3. Default to the last one (completed)
    return todaySchedule[todaySchedule.length - 1];
  }, [currentTime, todaySchedule]);

  const classStatus = useMemo(() => {
    if (currentTime < activeSession.startTime) return "UPCOMING";
    if (currentTime <= activeSession.endTime) {
      const diff = activeSession.endTime - currentTime;
      if (diff < 10 * 60 * 1000) return "ENDING_SOON"; // Ending soon if less than 10 minutes left
      return "LIVE";
    }
    return "COMPLETED";
  }, [currentTime, activeSession]);

  // Dynamic Participant Growth Simulation
  useEffect(() => {
    if (classStatus === "LIVE" || classStatus === "ENDING_SOON") {
      const interval = setInterval(() => {
        setJoinedCount(prev => {
          const increment = Math.floor(Math.random() * 2);
          return Math.min(prev + increment, activeSession.maxCapacity - 6);
        });
      }, 8000); // Increment every 8 seconds
      return () => clearInterval(interval);
    } else if (classStatus === "COMPLETED") {
      setJoinedCount(58); // Final count for completed class
    }
  }, [classStatus]);

  const classProgress = useMemo(() => {
    if (classStatus === "UPCOMING") return 0;
    if (classStatus === "COMPLETED") return 1; // 100% for completed
    const total = activeSession.endTime - activeSession.startTime;
    const elapsed = currentTime - activeSession.startTime;
    return Math.min(elapsed / total, 1);
  }, [currentTime, classStatus, activeSession]);

  // Dynamic Progress Bar Color for the Hero Card
  const progressColor = useMemo(() => {
    switch (classStatus) {
      case "ENDING_SOON": return "#FFFFFF"; // High contrast on warning background
      case "COMPLETED": return "#CBD5E1";   // Muted on completed background
      case "LIVE":
      default: return "#e7af5b";            // Vibrant success green
    }
  }, [classStatus]);

  const countdown = useMemo(() => {
    const diff = activeSession.startTime - currentTime;
    if (diff <= 0) return { hrs: "00", min: "00", sec: "00" };
    const totalSeconds = Math.floor(diff / 1000);
    return {
      hrs: String(Math.floor(totalSeconds / 3600)).padStart(2, '0'),
      min: String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0'),
      sec: String(totalSeconds % 60).padStart(2, '0'),
    };
  }, [currentTime, activeSession]);

  const totalDurationMs = useMemo(() => activeSession.endTime - activeSession.startTime, [activeSession]);
  const elapsedMs = useMemo(() => currentTime - activeSession.startTime, [currentTime, activeSession]);
  const remainingMs = useMemo(() => activeSession.endTime - currentTime, [currentTime, activeSession]);

  const classTimeInterval = useMemo(() => {
    const options = { hour: '2-digit', minute: '2-digit', hour12: true };
    const start = new Date(activeSession.startTime).toLocaleTimeString([], options);
    const end = new Date(activeSession.endTime).toLocaleTimeString([], options);
    return `${start} - ${end}`;
  }, [activeSession]);

  const timeElapsedStr = useMemo(() => {
    const elapsedMins = Math.floor(elapsedMs / (1000 * 60));
    return `${elapsedMins} min elapsed`;
  }, [elapsedMs]);

  const timeRemainingStr = useMemo(() => {
    const remainingMins = Math.floor(remainingMs / (1000 * 60));
    if (remainingMins <= 0 && classStatus === "COMPLETED") return "Finished";
    if (remainingMins <= 0) return "Ending now";
    return `${remainingMins} min remaining`;
  }, [remainingMs, classStatus]);

  const classScheduleStr = useMemo(() => {
    const options = { hour: '2-digit', minute: '2-digit', hour12: true };
    const start = new Date(activeSession.startTime).toLocaleTimeString([], options);
    const end = new Date(activeSession.endTime).toLocaleTimeString([], options);
    
    if (classStatus === "COMPLETED") return `Ended at ${end}`;
    if (classStatus === "LIVE" || classStatus === "ENDING_SOON") return "Happening Now";
    
    return `${start} - ${end}`;
  }, [classStatus, activeSession]);

  const cardThemeColor = useMemo(() => {
    if (classStatus === "UPCOMING") return "#94A3B8";
    if (classStatus === "ENDING_SOON") return "#F59E0B";
    if (classStatus === "LIVE" || classStatus === "ENDING_SOON") return "#2563EB"; // Primary blue for active states
    return "#2563EB";
  }, [classStatus]);

  const formattedCurrentTime = useMemo(() => {
    return new Date(currentTime).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  }, [currentTime]);

  const isMeetingLinkActive = useMemo(() => {
    // Link is active 10 mins before start until end
    return currentTime >= (activeSession.startTime - 10 * 60 * 1000) && currentTime <= activeSession.endTime;
  }, [currentTime, activeSession]);

  // Animations & Side Effects
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date().getTime()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Smooth animation for the progress bar width when the screen opens or progress updates
  useEffect(() => {
    Animated.timing(progressBarWidth, {
      toValue: classProgress,
      duration: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // Width animation requires false
    }).start();
  }, [classProgress]);

  useEffect(() => {
    if (classStatus === "LIVE" || classStatus === "ENDING_SOON") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.4, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1); // Reset opacity when not live
    }
  }, [classStatus, pulseAnim]);

  // Smooth appearance for the new ClassInformationCard
  useLayoutEffect(() => {
    Animated.timing(classInfoCardAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [classInfoCardAnim]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate data refetch
    setTimeout(() => {
      setCurrentTime(new Date().getTime()); // Update current time to re-evaluate status
      setRefreshing(false);
    }, 1500);
  }, []);

  const handleJoin = useCallback(() => {
    if (classStatus === "LIVE" || classStatus === "ENDING_SOON" || classStatus === "COMPLETED") {
      setIsJoining(true);
      setJoiningStatus(classStatus === "COMPLETED" ? "Accessing session archive..." : "Securing your connection...");
      
      Animated.parallel([
        Animated.spring(joiningScale, { toValue: 1, friction: 8, useNativeDriver: true }),
        Animated.timing(joiningOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start();

      if (classStatus !== "COMPLETED") {
        setTimeout(() => setJoiningStatus("Preparing your digital seat..."), 1200);
        setTimeout(() => setJoiningStatus("Entering the classroom..."), 2400);
      }

      setTimeout(() => {
        Animated.parallel([
          Animated.timing(joiningOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.timing(joiningScale, { toValue: 1.05, duration: 300, useNativeDriver: true }),
        ]).start(() => {
          setIsJoining(false);
          joiningScale.setValue(0.9);
        });
      }, 3500);
    }
  }, [classStatus, joiningOpacity, joiningScale]);

  const handleCopy = useCallback(async () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    await Clipboard.setStringAsync(activeSession.meetingLink);
    setIsLinkCopied(true);
    setTimeout(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsLinkCopied(false);
    }, 2000); // Reset after 2 seconds
  }, []);

  const handleTabChange = useCallback((tab) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveTab(tab);
  }, []);

  const renderHeader = () => (
    <>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={28} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Classes</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Live Card (Blue Hero Card) */}
      <View style={[styles.liveCard, classStatus === "COMPLETED" && styles.liveCardCompleted, classStatus === "ENDING_SOON" && styles.liveCardWarning]}>
        <View style={styles.topRow}>
          {(classStatus === "LIVE" || classStatus === "ENDING_SOON") ? (
            <View style={[styles.liveBadge, classStatus === "ENDING_SOON" && { backgroundColor: 'rgba(0,0,0,0.2)' }]}>
              <Animated.View style={[styles.greenDot, { opacity: pulseAnim }]} />
              <Text style={styles.liveText}>{classStatus === "ENDING_SOON" ? "Ending Soon" : "Live Now"}</Text>
            </View>
          ) : (
            <View style={[styles.liveBadge, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
              <View style={[styles.greenDot, { backgroundColor: classStatus === 'UPCOMING' ? '#94A3B8' : '#F87171' }]} />
              <Text style={[styles.liveText, { color: '#DCE7FF' }]}>
                {classStatus === 'UPCOMING' ? "Upcoming" : "Finished"}
              </Text>
            </View>
          )}

          <View style={styles.timeRow}>
            <View style={styles.schedulePill}>
               <Ionicons 
                name={(classStatus === "LIVE" || classStatus === "ENDING_SOON") ? "time" : "calendar-outline"} 
                size={13} 
                color="rgba(255,255,255,0.9)" 
              />
              <Text style={styles.timeText}>Today</Text>
              <View style={styles.timeSeparator} />
              <Text style={styles.timeValueText}>{(classStatus === "LIVE" || classStatus === "ENDING_SOON") ? formattedCurrentTime : classScheduleStr}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.subjectTitle}>{activeSession.title}</Text>
        <Text style={styles.subjectSubTitle}>{activeSession.subtitle}</Text>

        <View style={styles.teacherRow}>
          <Image source={{ uri: activeSession.teacherAvatar }} style={styles.teacherImage} />
          <View>
            <Text style={styles.teacherName}>{activeSession.teacher}</Text>
            <Text style={styles.teacherRole}>{activeSession.role}</Text>
          </View>
        </View>

        <View style={styles.bottomContainer}>
          {classStatus === "UPCOMING" ? (
            <View style={styles.timerCard}>
              <Text style={styles.timerTitle}>Class starts in</Text>
              <View style={styles.timerRow}>
                <View style={styles.timerBox}><Text style={styles.timerValue}>{countdown.hrs}</Text><Text style={styles.timerLabel}>HRS</Text></View>
                <View style={styles.timerBox}><Text style={styles.timerValue}>{countdown.min}</Text><Text style={styles.timerLabel}>MIN</Text></View>
                <View style={styles.timerBox}><Text style={styles.timerValue}>{countdown.sec}</Text><Text style={styles.timerLabel}>SEC</Text></View>
              </View>
            </View>
          ) : (
            <View style={styles.progressContainer}>
              <View style={styles.progressHeaderRow}>
                <Text style={styles.timerTitle}>{classStatus === "COMPLETED" ? "Session Completed" : "Session Progress"}</Text>
                <Text style={styles.progressPercentText}>{Math.floor(classProgress * 100)}%</Text>
              </View>
              <View style={styles.progressBarBg}>
                <Animated.View style={[
                  styles.progressBarFill,
                  {
                    width: progressBarWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                    backgroundColor: progressColor
                  }
                ]} />
              </View>
              <View style={styles.progressFooterRow}>
                <Text style={styles.progressSubText}>{timeElapsedStr}</Text>
                <Text style={styles.progressRemainingText}>{timeRemainingStr}</Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.joinButton, classStatus === "UPCOMING" && styles.buttonDisabled]}
            disabled={classStatus === "UPCOMING"}
            onPress={handleJoin}
          >
            <Ionicons
              name={classStatus === "COMPLETED" ? "play-circle" : "videocam"}
              size={18}
              color={cardThemeColor}
            />
            <Text style={[styles.joinButtonText, { color: cardThemeColor }]}>
              {classStatus === "UPCOMING" ? "Starts Soon" : (classStatus === "LIVE" || classStatus === "ENDING_SOON") ? "Join Now" : "Recording"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Class Information Card (New White Card) */}
      <ClassInformationCard
        joinedCount={joinedCount}
        maxCapacity={activeSession.maxCapacity}
        classStatus={classStatus}
        activeSession={activeSession}
        pulseAnim={classInfoCardAnim} // Use a separate animation for the card itself
      />

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          onPress={() => handleTabChange("schedule")}
          style={[styles.tabButton, activeTab === "schedule" && styles.activeTabButton]}
        >
          <Ionicons name="calendar-outline" size={16} color={activeTab === "schedule" ? "#2563EB" : "#64748B"} />
          <Text style={[styles.tabButtonText, activeTab === "schedule" && styles.activeTabButtonText]}>Today's Schedule</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => handleTabChange("recordings")}
          style={[styles.tabButton, activeTab === "recordings" && styles.activeTabButton]}
        >
          <Ionicons name="videocam-outline" size={16} color={activeTab === "recordings" ? "#2563EB" : "#64748B"} />
          <Text style={[styles.tabButtonText, activeTab === "recordings" && styles.activeTabButtonText]}>Recordings</Text>
        </TouchableOpacity>
      </View>

      {activeTab === "schedule" ? (
        <>
          {/* Meeting Link */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderInner}>
              <Text style={styles.sectionTitle}>Meeting Link</Text>
              {isMeetingLinkActive && <View style={styles.activeIndicator}><Text style={styles.activeIndicatorText}>Active</Text></View>}
            </View>

            <View style={[styles.linkCard, !isMeetingLinkActive && styles.linkCardDisabled]}>
              <View style={styles.linkLeft}>
                <Ionicons name="link-outline" size={16} color={isMeetingLinkActive ? "#2563EB" : "#94A3B8"} />
                <Text style={[styles.linkText, !isMeetingLinkActive && { color: "#94A3B8" }]}>{activeSession.meetingLink}</Text>
              </View>
              <TouchableOpacity 
                onPress={handleCopy} 
                disabled={!isMeetingLinkActive || isLinkCopied}
                style={[styles.copyButton, isLinkCopied && styles.copyButtonActive]}
              >
                <Ionicons 
                  name={isLinkCopied ? "checkmark-circle" : "copy-outline"} 
                  size={18} 
                  color={isLinkCopied ? "#16A34A" : (isMeetingLinkActive ? "#2563EB" : "#CBD5E1")} 
                />
                {isLinkCopied && <Text style={styles.copiedText}>Copied!</Text>}
              </TouchableOpacity>
            </View>

            <View style={styles.noteRow}>
              <Ionicons name="information-circle-outline" size={13} color="#94A3B8" />
              <Text style={styles.noteText}>
                {isMeetingLinkActive ? "The meeting is currently active. You can join now." : "The link will activate 10 minutes before the class begins."}
              </Text>
            </View>
          </View>

          {/* Tips */}
          <View style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <View style={styles.tipIcon}><MaterialCommunityIcons name="lightbulb-on-outline" size={18} color="#F59E0B" /></View>
              <Text style={styles.tipTitle}>Quick Preparation Checklist</Text>
            </View>
            <View style={styles.tipItem}><Ionicons name="checkmark-circle" size={14} color="#16A34A" /><Text style={styles.tipText}>Stable internet connection check</Text></View>
            <View style={styles.tipItem}><Ionicons name="checkmark-circle" size={14} color="#16A34A" /><Text style={styles.tipText}>Headphones for crystal clear audio</Text></View>
            <View style={styles.tipItem}><Ionicons name="checkmark-circle" size={14} color="#16A34A" /><Text style={styles.tipText}>Notebook and pen ready for notes</Text></View>
          </View>
          
          <View style={styles.listHeader}>
            <Text style={styles.listHeaderTitle}>Daily Classes</Text>
          </View>
        </>
      ) : (
        <View style={styles.listHeader}>
          <Text style={styles.listHeaderTitle}>Recent Recordings</Text>
        </View>
      )}
    </>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <FlatList
        data={activeTab === "schedule" ? todaySchedule : MOCK_PREVIOUS_SESSIONS}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          activeTab === "schedule" 
            ? <ScheduleItem item={item} isCurrent={item.id === activeSession.id} currentTime={currentTime} /> 
            : <SessionCard item={item} />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 30) }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563EB"]} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="videocam-off-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>No historical sessions available yet.</Text>
          </View>
        }
      />

      {/* Persistent Bottom Join Bar (Only if LIVE or ENDING_SOON) */}
      {(classStatus === "LIVE" || classStatus === "ENDING_SOON") && (
        <Animated.View 
          style={[styles.bottomJoinCard, { opacity: pulseAnim }]}
          accessible={true}
          accessibilityLabel="Class is live now, join now."
      >
          <View>
            <View style={styles.bottomStatus}>
              <View style={styles.bottomDot} />
              <Text style={styles.bottomTitle}>{classStatus === "ENDING_SOON" ? "Class Ending Soon" : "Session is Live"}</Text>
            </View>
            <Text style={styles.bottomSubTitle}>{joinedCount} peers joined • HD Record On</Text>
          </View>
          <TouchableOpacity activeOpacity={0.8} style={styles.bottomJoinButton} onPress={handleJoin}>
            <Text style={styles.bottomJoinText}>Join Now</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Premium Joining Overlay */}
      <Modal transparent visible={isJoining} animationType="none">
        <View style={styles.modalOverlay}>
          <AnimatedBlurView 
            tint="dark" 
            intensity={40} 
            style={[StyleSheet.absoluteFill, { opacity: joiningOpacity }]} 
          />
          <Animated.View 
            style={[
              styles.joiningCard, 
              { opacity: joiningOpacity, transform: [{ scale: joiningScale }] }
            ]}
          >
            <View style={styles.joiningIconContainer}>
              <ActivityIndicator size="large" color="#2563EB" />
            </View>
            <Text style={styles.joiningTitle}>{classStatus === "COMPLETED" ? "Accessing Recording" : "Joining Live Class"}</Text>
            <Text style={styles.joiningSubtitle}>{joiningStatus}</Text>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

export default LiveClassesScreen;

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

  liveCard: {
    marginHorizontal: 14,
    borderRadius: 22,
    padding: 20,
    backgroundColor: "#2563EB",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  liveCardCompleted: {
    backgroundColor: "#64748B",
    shadowColor: "#000",
  },
  liveCardWarning: {
    backgroundColor: "#F59E0B",
    shadowColor: "#F59E0B",
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 10,
    backgroundColor: "#4ADE80",
    marginRight: 6,
  },

  liveText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },

  timeRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  schedulePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },

  timeSeparator: {
    width: 1,
    height: 12,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: 8,
  },

  timeText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "700",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  timeValueText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 12,
  },

  subjectTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    marginTop: 22,
  },

  subjectSubTitle: {
    color: "#DCE7FF",
    fontSize: 14,
    marginTop: 8,
  },

  teacherRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
  },

  teacherImage: {
    width: 44,
    height: 44,
    borderRadius: 30,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#fff",
  },

  teacherName: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  teacherRole: {
    color: "#DCE7FF",
    fontSize: 12,
    marginTop: 2,
  },

  bottomContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },

  timerCard: {
    flex: 1,
  },

  timerTitle: {
    color: "#DCE7FF",
    fontSize: 11,
    marginBottom: 8,
  },

  timerRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  timerBox: {
    marginRight: 16,
  },

  timerValue: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
  },

  timerLabel: {
    color: "#DCE7FF",
    fontSize: 9,
    marginTop: 2,
  },
  
  // Progress Styles (inside blue card)
  progressContainer: {
    flex: 1,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressPercentText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.36)',
    borderRadius: 3,
    marginTop: 10,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressSubText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  progressRemainingText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 10,
    fontWeight: "600",
  },

  joinButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: "rgba(255,255,255,0.4)",
    elevation: 0,
  },
  joinButtonText: {
    fontWeight: "700",
    marginLeft: 8,
    fontSize: 14,
  },

  // --- Class Information Card Styles ---
  classInfoCard: {
    marginHorizontal: 14,
    marginTop: 20,
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  infoGridContainer: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10, // Spacing between blocks
  },
  infoBlockIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  infoBlockContent: {
    flex: 1,
  },
  infoBlockLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  infoBlockValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  peersIconBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  capacityText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  infoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  participantSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activePeersText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  liveIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 5,
  },
  liveIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  liveIndicatorText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#EF4444',
    textTransform: 'uppercase',
  },
  // Reusing progressBarBg and progressBarFill from blue card styles, but with white card colors
  progressBarBg: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 3,
  },

  // --- Meeting Link Section Styles ---
  section: {
    marginTop: 24,
    marginHorizontal: 14,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  sectionHeaderInner: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  activeIndicator: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activeIndicatorText: { color: '#16A34A', fontSize: 10, fontWeight: '800' },

  linkCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    paddingVertical: 14,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  linkCardDisabled: { backgroundColor: '#F3F4F6', borderColor: '#E5E7EB' },

  linkLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  linkText: {
    color: "#2563EB",
    fontSize: 13,
    marginLeft: 8,
    fontWeight: "500",
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  copyButtonActive: {
    backgroundColor: '#DCFCE7',
  },
  copiedText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '700',
  },

  noteRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  noteText: {
    color: "#94A3B8",
    fontSize: 11,
    marginLeft: 5,
    flex: 1,
  },

  // --- Tips Card Styles ---
  tipCard: {
    marginHorizontal: 14,
    marginTop: 22,
    borderRadius: 16,
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FED7AA",
    padding: 16,
  },

  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  tipIcon: {
    width: 28,
    height: 28,
    borderRadius: 20,
    backgroundColor: "#FFEDD5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  tipTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
  },

  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  tipText: {
    fontSize: 12,
    color: "#555",
    marginLeft: 8,
  },

  // --- Previous Sessions Styles ---
  previousHeader: {
    marginHorizontal: 14,
    marginTop: 24,
    marginBottom: 14,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  previousTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },

  viewAll: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "600",
  },

  previousCard: {
    backgroundColor: "#fff",
    marginHorizontal: 14,
    marginBottom: 12,
    borderRadius: 14,
    padding: 12,

    borderWidth: 1,
    borderColor: "#ECECEC",

    flexDirection: "row",
    alignItems: "center",
  },

  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  tagRow: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  subjectTag: { backgroundColor: '#F1F5F9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  tagText: { fontSize: 9, color: '#64748B', fontWeight: '800', textTransform: 'uppercase' },
  watchRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  
  previousImage: {
    width: 62,
    height: 62,
    borderRadius: 10,
    marginRight: 12,
  },

  previousSubject: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
  },

  previousDate: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 4,
  },

  recordingText: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 6,
  },

  // --- Bottom Join Card Styles ---
  bottomJoinCard: {
    backgroundColor: "#fff",
    marginHorizontal: 14,
    marginTop: 10,
    borderRadius: 16,
    padding: 16,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: 'absolute',
    bottom: 20,
    left: 14,
    right: 14,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },

  bottomStatus: {
    flexDirection: "row",
    alignItems: "center",
  },

  bottomDot: {
    width: 8,
    height: 8,
    borderRadius: 10,
    backgroundColor: "#22C55E",
    marginRight: 8,
  },

  bottomTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },

  bottomSubTitle: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 4,
    marginLeft: 16,
  },

  bottomJoinButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 10,
  },

  bottomJoinText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  emptyText: { color: '#94A3B8', fontSize: 14, fontWeight: '600', textAlign: 'center' },

  // Joining Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  joiningCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    padding: 32,
    alignItems: "center",
    width: "80%",
    maxWidth: 320,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 24,
  },
  joiningIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F0F7FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  joiningTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 8,
  },
  joiningSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
    textAlign: "center",
  },

  // Tab Switcher Styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    padding: 4,
    marginHorizontal: 14,
    marginTop: 20,
    marginBottom: 10,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 11,
    gap: 8,
  },
  activeTabButton: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabButtonText: {
    color: '#2563EB',
    fontWeight: '700',
  },

  // Schedule Item Styles
  scheduleWrapper: {
    flexDirection: 'row',
    marginHorizontal: 14,
    marginBottom: 0,
  },
  timeColumn: {
    width: 60,
    alignItems: 'center',
    paddingTop: 4,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  activeTimeText: {
    color: '#2563EB',
  },
  timeline: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#CBD5E1',
    zIndex: 2,
  },
  activeDot: {
    backgroundColor: '#2563EB',
    borderWidth: 2,
    borderColor: '#DBEAFE',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginTop: -2,
  },
  activeLineLine: {
    backgroundColor: '#2563EB',
  },
  endTimeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 10,
  },
  scheduleCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    marginLeft: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  activeScheduleCard: {
    borderColor: '#2563EB',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
  },
  pastScheduleCard: {
    opacity: 0.8,
  },
  scheduleCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  scheduleCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    marginRight: 10,
  },
  activeCardTitle: {
    color: '#2563EB',
  },
  activePill: {
    position: 'absolute',
    top: -10,
    right: 12,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  activePillText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  scheduleCardSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 12,
  },
  scheduleCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleTeacherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scheduleTeacherAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  scheduleTeacherName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  scheduleRoomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  scheduleRoomText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  liveIndicatorSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  liveIndicatorDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  liveIndicatorTextSmall: {
    fontSize: 9,
    fontWeight: '900',
    color: '#EF4444',
  },
  listHeader: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 15,
  },
  listHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});