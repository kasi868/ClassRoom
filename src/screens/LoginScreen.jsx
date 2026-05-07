// LoginScreen.jsx

import React, { useState, useEffect, useRef} from "react";
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
  useWindowDimensions,
  Animated, // Import Animated
  Keyboard, // Import Keyboard
  Alert, // Import Alert for simple messages
  ActivityIndicator,
} from "react-native";
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from "@expo/vector-icons";
import { SvgXml } from "react-native-svg";
import IMAGES, { googleIconSvg } from "../constants/images";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const navigation = useNavigation(); // Hook to access navigation object
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { width, height } = useWindowDimensions();

  const isSmallDevice = height < 750;
  const imageSize = Math.min(width * 0.9, height * 0.38);

  // Calculate the fixed height for the top image section
  const topImageAreaHeight = isSmallDevice ? imageSize + 20 + 15 : imageSize + 80 + 40;

  // Animated value for the bottom sheet's translateY
  const bottomSheetTranslateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (event) => {
        const keyboardHeight = event.endCoordinates.height;
        // Calculate target translateY to move the card up.
        // The reference code uses keyboardHeight * 0.5, capped at hp("35%").
        // Let's use a similar logic to ensure the card moves up sufficiently.
        const targetTranslateY = -keyboardHeight; // Move up by full keyboard height
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
  }, [bottomSheetTranslateY]);

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
          { height: topImageAreaHeight }, // Fixed height for the image area
          isSmallDevice ? styles.imageContainerCompact : styles.imageContainerStandard,
        ]}
      >
        <Image
          source={IMAGES.loginIllustration}
          style={[styles.image, { width: imageSize, height: imageSize }]}
          resizeMode="contain"
        />
      </View>

      {/* ANIMATED BOTTOM SHEET (LOGIN CARD) */}
      {/* The Animated.View itself is the bottom sheet, positioned absolutely */}
      <Animated.View
        style={[
          styles.card,
          styles.bottomSheetAbsolute, // Position absolutely at the bottom
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
            contentContainerStyle={styles.cardScrollContent}
            keyboardShouldPersistTaps="handled" // Important for smooth keyboard dismissal and tap handling
          >
            {/* SHEET HANDLE - Standard production UI element */}
            <View style={styles.sheetHandle} />

            <Text style={styles.title}>Welcome Back</Text>

            <Text style={styles.subtitle}>
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
            <TouchableOpacity 
              style={styles.forgotPasswordButton} 
              activeOpacity={0.7}
              onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.forgotPasswordText}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

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
                <Text style={styles.loginText}>Login</Text>
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
  },

  // Styles for the fixed image section
  imageContainerStandard: {
    paddingTop: 80,
    paddingBottom: 40,
  },

  imageContainerCompact: {
    paddingTop: 20,
    paddingBottom: 15,
  },

  // This wraps the content inside the animated bottom sheet
  keyboardAvoidingContent: {
    flex: 1,
  },

  image: {
    // Dynamics sizes handled via inline style
  },

  card: {
    // Base styles for the card's appearance
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 82,
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
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.02)", // Subtle edge definition
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
});
