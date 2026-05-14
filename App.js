import React, { useState, useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Font from 'expo-font';
import { 
  Ionicons, 
  MaterialIcons, 
  MaterialCommunityIcons, 
  Feather, 
  FontAwesome5 
} from '@expo/vector-icons';

import LoginScreen from './src/screens/LoginScreen';
import SplashScreen from './src/screens/SplashScreen';
import WelcomeSplashScreen from './src/screens/WelcomeSplashScreen';
import AttendanceScreen from './src/components/AttendanceScreen';
import TimeTableScreen from './src/components/TimeTableScreen';
import FeeDetailsScreen from './src/components/FeeDetailsScreen';
import TransportScreen from './src/components/TransportScreen';
import ExamScheduleScreen from './src/components/ExamScheduleScreen';
import NoticesScreen from './src/components/NoticesScreen';
import CalendarScreen from './src/components/CalendarScreen';
import SubjectsMaterialsScreen from './src/components/SubjectsMaterialsScreen';
import AssignmentsScreen from './src/components/AssignmentsScreen';
import LiveClassesScreen from './src/components/LiveClassesScreen';
import AcademicMarksScreen from './src/components/AcademicMarksScreen';
import ProfileScreen from './src/components/ProfileScreen';
import HomeScreen from './src/screens/HomeScreen';



const Stack = createStackNavigator();
/**
 * Maxzen - Main Application Entry Point
 * 
 * This component handles the initial application lifecycle, implementing a 
 * professional fade-out transition from the Splash Screen to the Login Screen.
 */
export default function App() {
  const [isAppReady, setIsAppReady] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    async function prepare() {
      try {
        // Preload all icon fonts used across the application
        // This prevents the "flicker" where icons appear as boxes or empty spaces
        const fontLoading = Font.loadAsync({
          ...Ionicons.font,
          ...MaterialIcons.font,
          ...MaterialCommunityIcons.font,
          ...Feather.font,
          ...FontAwesome5.font,
        });

        // Maintain the splash screen for at least 2.5 seconds for branding
        const timer = new Promise(resolve => setTimeout(resolve, 2500));

        await Promise.all([fontLoading, timer]);
      } catch (e) {
        console.warn("Asset loading error:", e);
      } finally {
        // Execute the cross-fade transition
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }).start(() => setIsAppReady(true));
      }
    }

    prepare();
  }, [fadeAnim]);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      
      {/* By always rendering the LoginScreen (or NavigationContainer) and overlaying the Splash, 
          the transition looks significantly more seamless. */} 
      {isAppReady ? (
        <NavigationContainer>
          <Stack.Navigator initialRouteName="WelcomeSplash" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="WelcomeSplash" component={WelcomeSplashScreen}/>
            <Stack.Screen name="Login" component={LoginScreen}/>
            <Stack.Screen name="Attendance" component={AttendanceScreen}/>
            <Stack.Screen name="TimeTable" component={TimeTableScreen}/>
            <Stack.Screen name="FeeDetails" component={FeeDetailsScreen}/>
            <Stack.Screen name="Transport" component={TransportScreen}/>
            <Stack.Screen name="ExamSchedule" component={ExamScheduleScreen}/>
            <Stack.Screen name="Notices" component={NoticesScreen}/>
            <Stack.Screen name="Calendar" component={CalendarScreen}/>
            <Stack.Screen name="Subjects" component={SubjectsMaterialsScreen}/>
            <Stack.Screen name="Assignments" component={AssignmentsScreen}/>
            <Stack.Screen name="Marks" component={AcademicMarksScreen}/>
            <Stack.Screen name="LiveClasses" component={LiveClassesScreen}/>
            <Stack.Screen name="Home" component={HomeScreen}/>
            <Stack.Screen name="Profile" component={ProfileScreen}/>
          </Stack.Navigator>
        </NavigationContainer>
      ) : (
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
          <SplashScreen />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#eaf7f5', // Matches the SplashScreen primary color
  },
});
