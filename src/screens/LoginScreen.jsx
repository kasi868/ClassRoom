import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated, // Import Animated
  Keyboard, // Import Keyboard
  Alert, // Import Alert for simple messages
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SvgXml } from "react-native-svg";
import IMAGES, { googleIconSvg } from "../constants/images";
import { useResponsive } from "../constants/useResponsive";
import { SCHOOLS } from '../constants/schools'; // Import SCHOOLS from the new central file

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const navigation = useNavigation();
  const route = useRoute();
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { width, height, isSmallDevice, isTablet, spacing, typography, card: cardMetrics } = useResponsive();
  const insets = useSafeAreaInsets();

  const selectedSchool = useMemo(() => {
    return route.params?.selectedSchool || null;
  }, [route.params?.selectedSchool]);

  // Professional logo scaling: Dynamic width based on device type
  const logoWidth = Math.min(isSmallDevice ? width * 0.5 : width * 0.56, isTablet ? 220 : 200);
  const logoHeight = logoWidth * 0.74; // Maintains original aspect ratio
  const sheetWidth = Math.min(width - spacing.page * 2, isTablet ? 520 : width);
  const sheetMaxHeight = height * (isSmallDevice ? 0.74 : 0.66);

  // Animated value for the bottom sheet's translateY
  const bottomSheetTranslateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (event) => {
        const keyboardHeight = event.endCoordinates.height;
        const targetTranslateY = Platform.OS === "ios" ? -keyboardHeight + insets.bottom : -keyboardHeight * 0.6;
        Animated.spring(bottomSheetTranslateY, {
          toValue: targetTranslateY,
          speed: 18,
          bounciness: 6,
          useNativeDriver: true,
        }).start();
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        Animated.spring(bottomSheetTranslateY, {
          toValue: 0, // Reset to original position
          speed: 22,
          bounciness: 3,
          useNativeDriver: true,
        }).start();
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [bottomSheetTranslateY, insets.bottom]);

  const validateEmail = (text) => {
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    return reg.test(text);
  };

  const handleLogin = async () => {
    let isValid = true;

    // Email/User Validation
    if (!email.trim()) {
      setEmailError("Email, username or mobile is required");
      isValid = false;
    } else if (email.includes("@") && !validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      isValid = false;
    } else {
      setEmailError("");
    }

    // Password Validation
    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      isValid = false;
    } else {
      setPasswordError("");
    }

    if (isValid) {
      setIsLoading(true);
      try {
        // Simulate a professional API authentication delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Navigation reset is standard for login to prevent back-navigation to auth screens
        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
        });
      } catch (error) {
        Alert.alert("Login Error", "Unable to connect to the server. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}
      // Add a key to force remounting on orientation change if needed, or just for clarity
      // key={width + height} 
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* TOP IMAGE SECTION - This section remains fixed */}
      <View
        style={[
          styles.topImageSection,
          { height: isSmallDevice ? height * 0.35 : height * 0.45 }, 
        ]}
      >
        <View style={styles.logoContainer}>
          <Image
            source={IMAGES.logo}
            style={[styles.logoImage, { width: logoWidth, height: logoHeight }]}
            resizeMode="contain"
          />

          <Text style={styles.appTitle}>Maxzen</Text>
          <Text style={styles.appSubtitle}>School Management System</Text>
        </View>
      </View>

      {/* ANIMATED BOTTOM SHEET (LOGIN CARD) */}
      {/* The Animated.View itself is the bottom sheet, positioned absolutely */}
      <Animated.View
        style={[
          styles.card,
          styles.bottomSheetAbsolute, // Position absolutely at the bottom
          {
            width: sheetWidth,
            alignSelf: "center",
            left: (width - sheetWidth) / 2,
            right: undefined,
            maxHeight: sheetMaxHeight,
            borderTopLeftRadius: cardMetrics.largeRadius,
            borderTopRightRadius: cardMetrics.largeRadius,
            borderBottomLeftRadius: isTablet ? cardMetrics.largeRadius : 0,
            borderBottomRightRadius: isTablet ? cardMetrics.largeRadius : 0,
            marginBottom: isTablet ? spacing.lg : 0,
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.lg,
          },
          { 
            paddingBottom: Math.max(insets.bottom, 20),
          },
          { transform: [{ translateY: bottomSheetTranslateY }] }, // Apply animation
        ]}
      >
        {/* KeyboardAvoidingView inside the Animated.View to handle internal input scrolling/padding */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingContent}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.cardScrollContent, { paddingBottom: isSmallDevice ? 20 : 10 }]}
            keyboardShouldPersistTaps="handled" // Important for smooth keyboard dismissal and tap handling
          >
            {/* SHEET HANDLE - Standard production UI element */}
            <View style={styles.sheetHandle} />

            {/* SELECTED SCHOOL HEADER - Visible after selection from WelcomeSplash */}
            {selectedSchool && (
              <View style={styles.schoolHeaderContainer}>
                <View style={styles.schoolHeaderRow}>
                  <Image source={selectedSchool.logo} style={styles.schoolLogoSmall} resizeMode="contain" />
                  <View style={styles.schoolInfoContent}>
                    <Text style={styles.schoolNameHeading} numberOfLines={2}>{selectedSchool.name}</Text>
                    <Text style={styles.schoolOverline} numberOfLines={1}>
                      {selectedSchool.shortName || 'Institution'}
                    </Text>
                  </View>
                </View>
                <View style={styles.schoolHeaderDivider} />
              </View>
            )}

            <Text style={[styles.title, typography.title]}>Welcome Back</Text>

            <Text style={[styles.subtitle, typography.body, isSmallDevice ? { marginBottom: spacing.sm } : { marginBottom: spacing.xl }]}>
              Log in to access your account
            </Text>

            {/* EMAIL INPUT */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Username or Mobile no</Text>

              <TextInput
                placeholder="Enter email, username or mobile no"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) setEmailError("");
                }}
                style={[styles.input, emailError ? styles.inputError : null]}
                placeholderTextColor="#8E99A8"
                autoCapitalize="none"
                keyboardType="email-address"
              />
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            </View>

            {/* PASSWORD INPUT */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  placeholder="Enter password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) setPasswordError("");
                  }}
                  style={[
                    styles.input,
                    typography.body,
                    { paddingRight: 48 },
                    passwordError ? styles.inputError : null,
                  ]}
                  secureTextEntry={!isPasswordVisible}
                  placeholderTextColor="#8E99A8"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                >
                  <Ionicons
                    name={isPasswordVisible ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#8E99A8"
                  />
                </TouchableOpacity>
              </View>
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            </View>
            
            {/* FORGOT PASSWORD LINK */}
            {/* <TouchableOpacity 
              style={styles.forgotPasswordButton} 
              activeOpacity={0.7}
              onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.forgotPasswordText}>
                Forgot Password?
              </Text>
            </TouchableOpacity> */}

            {/* LOGIN BUTTON */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.buttonDisabled]}
              activeOpacity={0.86}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={[styles.loginText, typography.bodyLarge]}>Login</Text>
              )}
            </TouchableOpacity>

            {/* DIVIDER */}
            <View style={styles.dividerContainer}>
              <View style={styles.line} />
              <Text style={styles.orText}>or</Text>
              <View style={styles.line} />
            </View>

            {/* GOOGLE BUTTON */}
            <TouchableOpacity style={styles.googleButton} activeOpacity={0.78}>
              <Text style={styles.googleText}>
                Continue with Google
              </Text>

              <SvgXml
                xml={googleIconSvg}
                width={18}
                height={18}
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF", // Clean, professional white background
  },

  // This is the fixed area for the image at the top
  topImageSection: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingTop: 8,
  },

  // This wraps the content inside the animated bottom sheet
  keyboardAvoidingContent: {
    flex: 1,
  },

  image: {
    // Dynamics sizes handled via inline style
  },

  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    marginBottom: 12,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 4,
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 14,
    color: '#165DB8',
    fontWeight: '600',
  },

  card: {
    // Base styles for the card's appearance
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 28,
    paddingTop: 22,
  },

  // Positioning for the animated bottom sheet
  bottomSheetAbsolute: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    // The height will be determined by content or minHeight/maxHeight if set
    // minHeight: height * 0.5, // Example: minimum half screen height
    // maxHeight: height * 0.8, // Example: maximum 80% screen height
    // Production-level shadow for depth against white background
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -10,
    },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 24,

    // Ensure content scrolls within the card if it overflows
    // This is handled by the ScrollView inside, but good to note for the card itself
  },

  cardScrollContent: {
  },

  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 24,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#050505",
    lineHeight: 24,
  },

  subtitle: {
    fontSize: 14,
    color: "#5F6770",
    marginTop: 10,
    marginBottom: 20,
    lineHeight: 20,
  },

  inputContainer: {
    marginBottom: 16,
  },

  label: {
    fontSize: 12,
    color: "#4B5563",
    marginBottom: 8,
    fontWeight: "600",
    lineHeight: 16,
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: "#F8FAFC",
    fontSize: 15,
    color: "#111",
  },

  loginButton: {
    backgroundColor: "#1F5FB9",
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,

    shadowColor: "#1F5FB9",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 6,
  },

  loginText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "500",
    lineHeight: 23,
  },

  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    width: "88%",
    marginTop: 22,
    marginBottom: 18,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },

  orText: {
    marginHorizontal: 18,
    color: "#6B7280",
    fontSize: 12,
    lineHeight: 16,
  },

  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1F5FB9",
    marginHorizontal: 4,
  },

  googleText: {
    color: "#165DB8",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },

  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: -8, // Adjust to bring it closer to the password input
    marginBottom: 16, // Space before the login button
    paddingVertical: 4, // Make it easier to tap
    paddingHorizontal: 8,
  },
  forgotPasswordText: {
    color: "#1F5FB9", // A color that stands out but matches the theme
    fontSize: 13,
    fontWeight: "600",
  },
  passwordWrapper: {
    justifyContent: "center",
  },
  eyeIcon: {
    position: "absolute",
    right: 14,
    padding: 4,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  inputError: {
    borderColor: "#DC2626",
  },
  buttonDisabled: {
    opacity: 0.8,
  },
  schoolHeaderContainer: {
    marginBottom: 20,
    width: '100%',
  },
  schoolHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  schoolLogoSmall: {
    width: 76,
    height: 76,
  },
  schoolInfoContent: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },
  schoolOverline: {
    fontSize: 21,
    color: '#1e293b',
    fontWeight: '700',
    marginTop: 2,
  },
  schoolNameHeading: {
    fontSize: 21,
    color: '#1e293b',
    fontWeight: '700',
    lineHeight: 28,
    marginTop: 0,
  },
  schoolHeaderDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginTop: 24,
    width: '100%',
  },
});
