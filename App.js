import React, { useState, useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from './src/screens/LoginScreen';
import SplashScreen from './src/screens/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import ForgotPasswordScreen from './src/components/ForgotPasswordScreen'; // Import new screen
import OtpVerificationScreen from './src/components/OTPVerificationScreen'; // Import new screen
import ResetPasswordScreen from './src/components/ResetPasswordScreen'; // Import new screen


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
    // Automated Navigation Logic
    // In a real production app, this is where you would check for user tokens,
    // load application assets, or sync initial data.
    const splashTimer = setTimeout(() => {
      // Execute a dynamic fade-out transition for a professional feel
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800, // 800ms for a smooth cross-fade effect
        useNativeDriver: true,
      }).start(() => {
        // Unmount the splash screen and reveal the LoginScreen
        setIsAppReady(true);
      });
    }, 3000); // Display the branding for 3 seconds

    return () => clearTimeout(splashTimer);
  }, [fadeAnim]);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      
      {/* By always rendering the LoginScreen (or NavigationContainer) and overlaying the Splash, 
          the transition looks significantly more seamless. */} 
      {isAppReady ? (
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
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
