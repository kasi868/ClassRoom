import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const theme = {
  colors: {
    primary: "#2563EB",
    primaryDark: "#1D4ED8",
    primarySoft: "#DBEAFE",
    background: "#F4F7FB",
    card: "#FFFFFF",
    textPrimary: "#111827",
    textSecondary: "#6B7280",
    border: "#E5E7EB",
    error: "#DC2626",
    success: "#16A34A",
    white: "#FFFFFF",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
};

const simulateSendOtp = async (email) => {
  await new Promise((resolve) => setTimeout(resolve, 1100));

  if (email.toLowerCase().includes("network")) {
    throw new Error("We couldn't send the code. Check your connection and try again.");
  }

  return { requestId: `otp_${Date.now()}` };
};

const SecurityHero = memo(function SecurityHero() {
  return (
    <View style={styles.heroIconWrap} accessible accessibilityLabel="Secure account recovery">
      <LinearGradient colors={["#FFFFFF", "#DCEAFE"]} style={styles.heroIconGradient}>
        <View style={styles.heroInnerRing}>
          <Ionicons name="shield-checkmark" size={34} color={theme.colors.primary} />
        </View>
      </LinearGradient>
      <View style={styles.heroBadge}>
        <Ionicons name="lock-closed" size={13} color={theme.colors.white} />
      </View>
    </View>
  );
});

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const { height, width } = useWindowDimensions();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [apiError, setApiError] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const entrance = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const inputFocus = useRef(new Animated.Value(0)).current;

  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email]);
  const isEmailValid = EMAIL_REGEX.test(normalizedEmail);
  const isSmallDevice = height < 700;

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 620,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [entrance]);

  useEffect(() => {
    Animated.timing(inputFocus, {
      toValue: isFocused ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [inputFocus, isFocused]);

  const validateEmail = useCallback((value, shouldShowRequired = false) => {
    const nextEmail = value.trim();

    if (!nextEmail) {
      return shouldShowRequired ? "Email address is required" : "";
    }

    if (!EMAIL_REGEX.test(nextEmail.toLowerCase())) {
      return "Please enter a valid email address";
    }

    return "";
  }, []);

  const handleEmailChange = useCallback(
    (value) => {
      setEmail(value);
      setApiError("");

      if (isTouched || value.trim()) {
        setEmailError(validateEmail(value, isTouched));
      }
    },
    [isTouched, validateEmail]
  );

  const runButtonPress = useCallback(
    (toValue) => {
      Animated.spring(buttonScale, {
        toValue,
        speed: 32,
        bounciness: 4,
        useNativeDriver: true,
      }).start();
    },
    [buttonScale]
  );

  const handleSendOtp = useCallback(async () => {
    if (isSubmitting) {
      return;
    }

    setIsTouched(true);
    const nextError = validateEmail(email, true);
    setEmailError(nextError);

    if (nextError) {
      return;
    }

    setIsSubmitting(true);
    setApiError("");

    try {
      const response = await simulateSendOtp(normalizedEmail);
      navigation.navigate("OtpVerification", {
        email: normalizedEmail,
        requestId: response.requestId,
      });
    } catch (error) {
      setApiError(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [email, isSubmitting, navigation, normalizedEmail, validateEmail]);

  const inputBorderColor = inputFocus.interpolate({
    inputRange: [0, 1],
    outputRange: [emailError ? theme.colors.error : theme.colors.border, theme.colors.primary],
  });

  const cardTranslateY = entrance.interpolate({
    inputRange: [0, 1],
    outputRange: [28, 0],
  });

  const canSubmit = isEmailValid && !isSubmitting;

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <LinearGradient
        colors={["#EAF2FF", "#F4F7FB", "#FFFFFF"]}
        locations={[0, 0.52, 1]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              minHeight: height,
              paddingHorizontal: width < 360 ? 18 : 24,
              paddingTop: isSmallDevice ? 14 : 24,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressedLight]}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={24} color={theme.colors.textPrimary} />
          </Pressable>

          <Animated.View
            style={[
              styles.content,
              {
                opacity: entrance,
                transform: [{ translateY: cardTranslateY }],
              },
            ]}
          >
            <View style={[styles.hero, isSmallDevice && styles.heroCompact]}>
              <SecurityHero />
              <Text style={styles.eyebrow}>Account security</Text>
              <Text style={styles.title}>Recover your password</Text>
              <Text style={styles.subtitle}>
                Enter the email linked to your travel account. We will send a 6-digit security code.
              </Text>
            </View>

            <View style={styles.card}>
              <View style={styles.fieldHeader}>
                <Text style={styles.label}>Registered email</Text>
                {isEmailValid ? (
                  <View style={styles.validPill}>
                    <Ionicons name="checkmark" size={12} color={theme.colors.success} />
                    <Text style={styles.validText}>Valid</Text>
                  </View>
                ) : null}
              </View>

              <Animated.View
                style={[
                  styles.inputShell,
                  { borderColor: inputBorderColor },
                  emailError && styles.inputShellError,
                  isEmailValid && !emailError && styles.inputShellValid,
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={emailError ? theme.colors.error : isFocused ? theme.colors.primary : "#94A3B8"}
                />
                <TextInput
                  value={email}
                  onChangeText={handleEmailChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => {
                    setIsFocused(false);
                    setIsTouched(true);
                  }}
                  placeholder="name@example.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="send"
                  onSubmitEditing={handleSendOtp}
                  editable={!isSubmitting}
                  style={styles.input}
                  accessibilityLabel="Registered email address"
                  accessibilityHint="Enter the email address connected to your account"
                />
              </Animated.View>

              {emailError ? (
                <View style={styles.feedbackRow}>
                  <Ionicons name="alert-circle" size={15} color={theme.colors.error} />
                  <Text style={styles.errorText}>{emailError}</Text>
                </View>
              ) : (
                <Text style={styles.helperText}>Use the email you registered with for bookings and tickets.</Text>
              )}

              {apiError ? (
                <View style={styles.apiBanner} accessibilityRole="alert">
                  <Ionicons name="wifi-outline" size={17} color={theme.colors.error} />
                  <Text style={styles.apiBannerText}>{apiError}</Text>
                </View>
              ) : null}

              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <Pressable
                  onPress={handleSendOtp}
                  onPressIn={() => runButtonPress(0.985)}
                  onPressOut={() => runButtonPress(1)}
                  disabled={!canSubmit}
                  accessibilityRole="button"
                  accessibilityLabel="Send Security Code"
                  accessibilityState={{ disabled: !canSubmit, busy: isSubmitting }}
                  style={({ pressed }) => [
                    styles.buttonContainer,
                    (!canSubmit || pressed) && styles.buttonContainerMuted,
                  ]}
                >
                  <LinearGradient
                    colors={
                      canSubmit
                        ? [theme.colors.primary, theme.colors.primaryDark]
                        : ["#BFDBFE", "#93C5FD"]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.buttonGradient}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color={theme.colors.white} />
                    ) : (
                      <>
                        <Text style={styles.buttonText}>Send Security Code</Text>
                        <Ionicons name="arrow-forward" size={19} color={theme.colors.white} />
                      </>
                    )}
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 28,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.74)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.92)",
    marginTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 10,
  },
  pressedLight: {
    opacity: 0.72,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  hero: {
    alignItems: "center",
    marginBottom: 18,
  },
  heroCompact: {
    marginTop: -8,
    marginBottom: 12,
  },
  heroIconWrap: {
    width: 92,
    height: 92,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  heroIconGradient: {
    width: 86,
    height: 86,
    borderRadius: 43,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
  },
  heroInnerRing: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: "#DCEAFE",
  },
  heroBadge: {
    position: "absolute",
    right: 5,
    bottom: 12,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 34,
    textAlign: "center",
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 10,
    maxWidth: 330,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.96)",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.1,
    shadowRadius: 28,
    elevation: 12,
  },
  fieldHeader: {
    minHeight: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 9,
  },
  label: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "700",
  },
  validPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#DCFCE7",
  },
  validText: {
    color: theme.colors.success,
    fontSize: 11,
    fontWeight: "800",
  },
  inputShell: {
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  inputShellError: {
    backgroundColor: "#FEF2F2",
  },
  inputShellValid: {
    borderColor: "#BBF7D0",
  },
  input: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
    paddingVertical: 0,
  },
  helperText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 9,
  },
  feedbackRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 9,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  apiBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#FEF2F2",
    marginTop: 16,
  },
  apiBannerText: {
    flex: 1,
    color: theme.colors.error,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
  },
  buttonContainer: {
    marginTop: 20,
    borderRadius: 18,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.24,
    shadowRadius: 18,
    elevation: 8,
  },
  buttonContainerMuted: {
    shadowOpacity: 0.1,
  },
  buttonGradient: {
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 9,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "800",
  },
});
