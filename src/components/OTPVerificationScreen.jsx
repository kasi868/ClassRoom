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
import { useNavigation, useRoute } from "@react-navigation/native";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;
const MAX_RESEND_ATTEMPTS = 3;
const DEMO_OTP = "123456";

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
};

const simulateVerifyOtp = async (otp) => {
  await new Promise((resolve) => setTimeout(resolve, 900));

  if (otp === "999999") {
    throw new Error("Network/API failure. Please try again.");
  }

  if (otp === "000000") {
    return { ok: false, reason: "Expired OTP. Please request a new code." };
  }

  if (otp !== DEMO_OTP) {
    return { ok: false, reason: "Invalid OTP. Please check the code and try again." };
  }

  return { ok: true };
};

const simulateResendOtp = async () => {
  await new Promise((resolve) => setTimeout(resolve, 850));
  return { requestId: `otp_${Date.now()}` };
};

const maskEmail = (email = "") => {
  const [name = "", domain = ""] = email.split("@");
  if (!name || !domain) {
    return "your registered email";
  }

  const visibleStart = name.slice(0, 1);
  const visibleEnd = name.length > 3 ? name.slice(-1) : "";

  return `${visibleStart}${"*".repeat(Math.max(3, name.length - 2))}${visibleEnd}@${domain}`;
};

const formatTimer = (seconds) => {
  const safeSeconds = Math.max(0, seconds);
  return `00:${String(safeSeconds).padStart(2, "0")}`;
};

const SecurityHeaderIcon = memo(function SecurityHeaderIcon() {
  return (
    <View style={styles.iconHalo} accessible accessibilityLabel="OTP security verification">
      <LinearGradient colors={["#FFFFFF", "#DCEAFE"]} style={styles.iconGradient}>
        <Ionicons name="keypad" size={34} color={theme.colors.primary} />
      </LinearGradient>
      <View style={styles.iconCheck}>
        <Ionicons name="checkmark" size={14} color={theme.colors.white} />
      </View>
    </View>
  );
});

export default function OtpVerificationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { height, width } = useWindowDimensions();

  const email = route.params?.email || "";

  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(RESEND_SECONDS);
  const [resendAttempts, setResendAttempts] = useState(0);

  const inputRefs = useRef([]);
  const boxScales = useRef(Array.from({ length: OTP_LENGTH }, () => new Animated.Value(1))).current;
  const entrance = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  const otp = useMemo(() => digits.join(""), [digits]);
  const isOtpComplete = otp.length === OTP_LENGTH && digits.every(Boolean);
  const maskedEmail = useMemo(() => maskEmail(email), [email]);
  const isSmallDevice = height < 700;

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 620,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    const focusTimeout = setTimeout(() => inputRefs.current[0]?.focus(), 340);
    return () => clearTimeout(focusTimeout);
  }, [entrance]);

  useEffect(() => {
    if (timer <= 0) {
      return undefined;
    }

    const interval = setInterval(() => {
      setTimer((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const animateBox = useCallback(
    (index, toValue = 1.04) => {
      Animated.sequence([
        Animated.spring(boxScales[index], {
          toValue,
          speed: 26,
          bounciness: 5,
          useNativeDriver: true,
        }),
        Animated.spring(boxScales[index], {
          toValue: 1,
          speed: 26,
          bounciness: 4,
          useNativeDriver: true,
        }),
      ]).start();
    },
    [boxScales]
  );

  const setOtpFromText = useCallback(
    (text, startIndex) => {
      const cleanText = text.replace(/\D/g, "").slice(0, OTP_LENGTH);

      if (!cleanText) {
        return;
      }

      setErrorMessage("");
      setSuccessMessage("");

      setDigits((current) => {
        const next = [...current];
        cleanText.split("").forEach((char, offset) => {
          const targetIndex = startIndex + offset;
          if (targetIndex < OTP_LENGTH) {
            next[targetIndex] = char;
          }
        });
        return next;
      });

      const nextFocusIndex = Math.min(startIndex + cleanText.length, OTP_LENGTH - 1);
      requestAnimationFrame(() => inputRefs.current[nextFocusIndex]?.focus());
      animateBox(Math.min(startIndex + cleanText.length - 1, OTP_LENGTH - 1));
    },
    [animateBox]
  );

  const handleDigitChange = useCallback(
    (text, index) => {
      if (text.length > 1) {
        setOtpFromText(text, index);
        return;
      }

      const cleanText = text.replace(/\D/g, "");

      setDigits((current) => {
        const next = [...current];
        next[index] = cleanText;
        return next;
      });
      setErrorMessage("");
      setSuccessMessage("");

      if (cleanText && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }

      if (cleanText) {
        animateBox(index);
      }
    },
    [animateBox, setOtpFromText]
  );

  const handleKeyPress = useCallback(
    ({ nativeEvent }, index) => {
      if (nativeEvent.key !== "Backspace") {
        return;
      }

      if (digits[index]) {
        setDigits((current) => {
          const next = [...current];
          next[index] = "";
          return next;
        });
        return;
      }

      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        setDigits((current) => {
          const next = [...current];
          next[index - 1] = "";
          return next;
        });
      }
    },
    [digits]
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

  const navigateAfterVerification = useCallback(() => {
    const routeNames = navigation.getState?.()?.routeNames || [];

    navigation.navigate("ResetPassword", { email });
  }, [email, navigation]);

  const handleVerifyOtp = useCallback(async () => {
    if (isVerifying) {
      return;
    }

    if (!otp) {
      setErrorMessage("Enter the 6-digit OTP sent to your email.");
      inputRefs.current[0]?.focus();
      return;
    }

    if (!isOtpComplete) {
      setErrorMessage("Please enter all 6 digits to continue.");
      inputRefs.current[digits.findIndex((digit) => !digit)]?.focus();
      return;
    }

    setIsVerifying(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await simulateVerifyOtp(otp);

      if (!response.ok) {
        setErrorMessage(response.reason);
        return;
      }

      setSuccessMessage("OTP verified successfully.");
      setTimeout(navigateAfterVerification, 450);
    } catch (error) {
      setErrorMessage(error.message || "Network/API failure. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  }, [digits, isOtpComplete, isVerifying, navigateAfterVerification, otp]);

  const handleResendOtp = useCallback(async () => {
    if (timer > 0 || isResending || resendAttempts >= MAX_RESEND_ATTEMPTS) {
      return;
    }

    setIsResending(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await simulateResendOtp();
      setDigits(Array(OTP_LENGTH).fill(""));
      setTimer(RESEND_SECONDS);
      setResendAttempts((current) => current + 1);
      setSuccessMessage("A new OTP has been sent to your email.");
      requestAnimationFrame(() => inputRefs.current[0]?.focus());
    } catch (error) {
      setErrorMessage(error.message || "Network/API failure. Please try again.");
    } finally {
      setIsResending(false);
    }
  }, [isResending, resendAttempts, timer]);

  const cardTranslateY = entrance.interpolate({
    inputRange: [0, 1],
    outputRange: [28, 0],
  });

  const canResend = timer === 0 && resendAttempts < MAX_RESEND_ATTEMPTS && !isResending;
  const canVerify = isOtpComplete && !isVerifying;

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <LinearGradient
        colors={["#EAF2FF", "#F4F7FB", "#FFFFFF"]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              minHeight: height,
              paddingHorizontal: width < 360 ? 16 : 24,
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
            <View style={[styles.header, isSmallDevice && styles.headerCompact]}>
              <SecurityHeaderIcon />
              <Text style={styles.eyebrow}>Security verification</Text>
              <Text style={styles.title}>Enter verification code</Text>
              <Text style={styles.subtitle}>We sent a 6-digit code to {maskedEmail}</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.otpRow} accessibilityLabel="6 digit OTP input">
                {digits.map((digit, index) => {
                  const isActive = focusedIndex === index;
                  const hasError = Boolean(errorMessage);

                  return (
                    <Animated.View
                      key={`otp-${index}`}
                      style={[
                        styles.otpBox,
                        isActive && styles.otpBoxActive,
                        digit && styles.otpBoxFilled,
                        hasError && styles.otpBoxError,
                        { transform: [{ scale: boxScales[index] }] },
                      ]}
                    >
                      <TextInput
                        ref={(ref) => {
                          inputRefs.current[index] = ref;
                        }}
                        value={digit}
                        onChangeText={(text) => handleDigitChange(text, index)}
                        onKeyPress={(event) => handleKeyPress(event, index)}
                        onFocus={() => setFocusedIndex(index)}
                        keyboardType="number-pad"
                        textContentType="oneTimeCode"
                        autoComplete="sms-otp"
                        selectTextOnFocus
                        style={styles.otpInput}
                        accessibilityLabel={`OTP digit ${index + 1}`}
                      />
                    </Animated.View>
                  );
                })}
              </View>

              {errorMessage ? (
                <View style={styles.feedbackBanner} accessibilityRole="alert">
                  <Ionicons name="alert-circle" size={17} color={theme.colors.error} />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              {successMessage ? (
                <View style={[styles.feedbackBanner, styles.successBanner]}>
                  <Ionicons name="checkmark-circle" size={17} color={theme.colors.success} />
                  <Text style={styles.successText}>{successMessage}</Text>
                </View>
              ) : null}

              <View style={styles.resendSection}>
                <Text style={styles.resendHelper}>Did not receive the code?</Text>
                <Pressable
                  onPress={handleResendOtp}
                  disabled={!canResend}
                  accessibilityRole="button"
                  accessibilityLabel={canResend ? "Resend OTP" : `Resend OTP in ${formatTimer(timer)}`}
                  accessibilityState={{ disabled: !canResend, busy: isResending }}
                  style={({ pressed }) => [styles.resendButton, pressed && canResend && styles.pressedLight]}
                >
                  {isResending ? (
                    <ActivityIndicator color={theme.colors.primary} size="small" />
                  ) : (
                    <Text style={[styles.resendText, !canResend && styles.resendTextDisabled]}>
                      {resendAttempts >= MAX_RESEND_ATTEMPTS
                        ? "Resend limit reached"
                        : timer > 0
                          ? `Resend OTP in ${formatTimer(timer)}`
                          : "Resend OTP"}
                    </Text>
                  )}
                </Pressable>
              </View>

              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <Pressable
                  onPress={handleVerifyOtp}
                  onPressIn={() => runButtonPress(0.985)}
                  onPressOut={() => runButtonPress(1)}
                  disabled={!canVerify}
                  accessibilityRole="button"
                  accessibilityLabel="Verify OTP"
                  accessibilityState={{ disabled: !canVerify, busy: isVerifying }}
                  style={({ pressed }) => [
                    styles.buttonContainer,
                    (!canVerify || pressed) && styles.buttonContainerMuted,
                  ]}
                >
                  <LinearGradient
                    colors={canVerify ? [theme.colors.primary, theme.colors.primaryDark] : ["#BFDBFE", "#93C5FD"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.buttonGradient}
                  >
                    {isVerifying ? (
                      <ActivityIndicator color={theme.colors.white} />
                    ) : (
                      <>
                        <Text style={styles.buttonText}>Verify OTP</Text>
                        <Ionicons name="shield-checkmark" size={19} color={theme.colors.white} />
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
  header: {
    alignItems: "center",
    marginBottom: 18,
  },
  headerCompact: {
    marginTop: -8,
    marginBottom: 12,
  },
  iconHalo: {
    width: 92,
    height: 92,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  iconGradient: {
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
  iconCheck: {
    position: "absolute",
    right: 5,
    bottom: 12,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.success,
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
    fontSize: 27,
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
    maxWidth: 340,
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
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 7,
  },
  otpBox: {
    flex: 1,
    maxWidth: 50,
    aspectRatio: 0.82,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  otpBoxActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.white,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 5,
  },
  otpBoxFilled: {
    borderColor: "#BFDBFE",
    backgroundColor: "#EFF6FF",
  },
  otpBoxError: {
    borderColor: theme.colors.error,
    backgroundColor: "#FEF2F2",
  },
  otpInput: {
    width: "100%",
    height: "100%",
    color: theme.colors.textPrimary,
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    padding: 0,
  },
  feedbackBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#FEF2F2",
    marginTop: 16,
  },
  successBanner: {
    backgroundColor: "#F0FDF4",
  },
  errorText: {
    flex: 1,
    color: theme.colors.error,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
  },
  successText: {
    flex: 1,
    color: theme.colors.success,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
  },
  resendSection: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 4,
  },
  resendHelper: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  resendButton: {
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  resendText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: "800",
  },
  resendTextDisabled: {
    color: "#94A3B8",
  },
  buttonContainer: {
    marginTop: 12,
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
