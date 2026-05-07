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
  Keyboard,
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

const theme = {
  colors: {
    primary: "#2563EB",
    primaryDark: "#1D4ED8",
    background: "#F4F7FB",
    textPrimary: "#111827",
    textSecondary: "#6B7280",
    border: "#E5E7EB",
    error: "#DC2626",
    success: "#16A34A",
    white: "#FFFFFF",
  },
};

const simulateResetPassword = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return { ok: true };
};

const SecurityHero = memo(function SecurityHero() {
  return (
    <View style={styles.heroIconWrap} accessible accessibilityLabel="Password reset security">
      <LinearGradient colors={["#FFFFFF", "#DCEAFE"]} style={styles.heroIconGradient}>
        <View style={styles.heroInnerRing}>
          <Ionicons name="lock-open" size={34} color={theme.colors.primary} />
        </View>
      </LinearGradient>
      <View style={styles.heroBadge}>
        <Ionicons name="shield-checkmark" size={13} color={theme.colors.white} />
      </View>
    </View>
  );
});

export default function ResetPasswordScreen() {
  const navigation = useNavigation();
  const { height, width } = useWindowDimensions();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const entrance = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const strengthWidth = useRef(new Animated.Value(0)).current;
  const keyboardTranslateY = useRef(new Animated.Value(0)).current;

  const isSmallDevice = height < 700;

  const strength = useMemo(() => {
    if (password.length === 0) return 0;
    let s = 1; // Base: 1-5 chars
    if (password.length >= 8) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s; // Max score of 4
  }, [password]);

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 620,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [entrance]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (event) => {
        const keyboardHeight = event.endCoordinates.height;
        // Calculate dynamic lift: lift less on small devices to keep header visible
        const liftValue = Platform.OS === "ios" ? -keyboardHeight * 0.45 : -40;
        
        Animated.spring(keyboardTranslateY, {
          toValue: liftValue,
          speed: 15,
          bounciness: 5,
          useNativeDriver: true,
        }).start();
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        Animated.spring(keyboardTranslateY, {
          toValue: 0,
          speed: 20,
          bounciness: 3,
          useNativeDriver: true,
        }).start();
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [keyboardTranslateY]);

  useEffect(() => {
    Animated.timing(strengthWidth, {
      toValue: strength,
      duration: 350,
      useNativeDriver: false,
    }).start();
  }, [strength, strengthWidth]);

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

  const handleResetPassword = useCallback(async () => {
    let hasError = false;

    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      hasError = true;
    } else {
      setPasswordError("");
    }

    if (password !== confirmPassword) {
      setConfirmError("Passwords do not match");
      hasError = true;
    } else {
      setConfirmError("");
    }

    if (hasError || isSubmitting) return;

    setIsSubmitting(true);
    setSuccessMessage("");
    try {
      await simulateResetPassword();
      setSuccessMessage("Password updated successfully!");
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }, 1600);
    } catch (error) {
      setPasswordError("Failed to reset password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [confirmPassword, isSubmitting, navigation, password]);

  const cardTranslateY = entrance.interpolate({
    inputRange: [0, 1],
    outputRange: [28, 0],
  });

  const canSubmit = password.length >= 6 && confirmPassword.length >= 6 && !isSubmitting && !successMessage;

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <LinearGradient
        colors={["#EAF2FF", "#F4F7FB", "#FFFFFF"]}
        locations={[0, 0.52, 1]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        enabled={Platform.OS === "ios"}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              minHeight: height,
              flexGrow: 1,
              paddingHorizontal: width < 360 ? 18 : 24,
              paddingTop: isSmallDevice ? 14 : 24,
              justifyContent: 'center',
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
                transform: [
                  { translateY: cardTranslateY },
                  { translateY: keyboardTranslateY }
                ],
              },
            ]}
          >
            <View style={[styles.hero, isSmallDevice && styles.heroCompact]}>
              <SecurityHero />
              <Text style={styles.eyebrow}>Secure Recovery</Text>
              <Text style={styles.title}>New Password</Text>
              <Text style={styles.subtitle}>
                Choose a strong password that you haven't used before.
              </Text>
            </View>

            <View style={styles.card}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>New Password</Text>
                <View style={[styles.inputShell, passwordError && styles.inputShellError]}>
                  <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" />
                  <TextInput
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (passwordError) setPasswordError("");
                    }}
                    placeholder="Minimum 6 characters"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    style={styles.input}
                  />
                  <Pressable 
                    onPress={() => setShowPassword(!showPassword)} 
                    hitSlop={8}
                    accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#94A3B8"
                    />
                  </Pressable>
                </View>
                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

                {password.length > 0 && (
                  <View style={styles.strengthMeter}>
                    <View style={styles.meterTrack}>
                      <Animated.View
                        style={[
                          styles.meterFill,
                          {
                            width: strengthWidth.interpolate({
                              inputRange: [0, 4],
                              outputRange: ["0%", "100%"],
                            }),
                            backgroundColor:
                              strength <= 1 ? theme.colors.error :
                              strength === 2 ? "#F59E0B" :
                              strength === 3 ? theme.colors.primary : theme.colors.success,
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[
                        styles.strengthLabel,
                        {
                          color:
                            strength <= 1 ? theme.colors.error :
                            strength === 2 ? "#F59E0B" :
                            strength === 3 ? theme.colors.primary : theme.colors.success,
                        },
                      ]}
                    >
                      {["Weak", "Fair", "Good", "Strong"][strength - 1]}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm New Password</Text>
                <View style={[styles.inputShell, confirmError && styles.inputShellError]}>
                  <Ionicons name="shield-outline" size={20} color="#94A3B8" />
                  <TextInput
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (confirmError) setConfirmError("");
                    }}
                    placeholder="Repeat your password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showConfirmPassword}
                    style={styles.input}
                  />
                  <Pressable 
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)} 
                    hitSlop={8}
                    accessibilityLabel={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    <Ionicons
                      name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#94A3B8"
                    />
                  </Pressable>
                </View>
                {confirmError ? <Text style={styles.errorText}>{confirmError}</Text> : null}
              </View>

              {successMessage ? (
                <View style={[styles.feedbackBanner, styles.successBanner]} accessibilityRole="alert">
                  <Ionicons name="checkmark-circle" size={17} color={theme.colors.success} />
                  <Text style={styles.successText}>{successMessage}</Text>
                </View>
              ) : null}

              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <Pressable
                  onPress={handleResetPassword}
                  onPressIn={() => runButtonPress(0.985)}
                  onPressOut={() => runButtonPress(1)}
                  disabled={!canSubmit}
                  style={({ pressed }) => [
                    styles.buttonContainer,
                    (!canSubmit || pressed) && styles.buttonContainerMuted,
                  ]}
                >
                  <LinearGradient
                    colors={canSubmit ? [theme.colors.primary, theme.colors.primaryDark] : ["#BFDBFE", "#93C5FD"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.buttonGradient}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color={theme.colors.white} />
                    ) : (
                      <Text style={styles.buttonText}>Update Password</Text>
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
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { flexGrow: 1, paddingBottom: 28 },
  backButton: {
    position: "absolute",
    top: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 12 : 12,
    left: 20,
    zIndex: 10,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.74)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.92)",
  },
  pressedLight: { opacity: 0.72 },
  content: { width: '100%' },
  hero: { alignItems: "center", marginBottom: 18 },
  heroCompact: { marginTop: -8, marginBottom: 12 },
  heroIconWrap: { width: 92, height: 92, alignItems: "center", justifyContent: "center", marginBottom: 18 },
  heroIconGradient: {
    width: 86,
    height: 86,
    borderRadius: 43,
    alignItems: "center",
    justifyContent: "center",
    elevation: 10,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
  },
  heroInnerRing: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.white,
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
  eyebrow: { color: theme.colors.primary, fontSize: 12, fontWeight: "800", textTransform: "uppercase", marginBottom: 8 },
  title: { color: theme.colors.textPrimary, fontSize: 28, fontWeight: "800", textAlign: "center" },
  subtitle: { color: theme.colors.textSecondary, fontSize: 15, textAlign: "center", marginTop: 10, maxWidth: 330 },
  card: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 28,
    padding: 20,
    elevation: 12,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.1,
    shadowRadius: 28,
  },
  inputGroup: { marginBottom: 16 },
  label: { color: "#374151", fontSize: 13, fontWeight: "700", marginBottom: 8 },
  inputShell: {
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  inputShellError: { borderColor: theme.colors.error, backgroundColor: "#FEF2F2" },
  input: { flex: 1, color: theme.colors.textPrimary, fontSize: 16, fontWeight: "600" },
  errorText: { color: theme.colors.error, fontSize: 12, fontWeight: "600", marginTop: 6, marginLeft: 4 },
  feedbackBanner: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 16, marginTop: 4, marginBottom: 16 },
  successBanner: { backgroundColor: "#F0FDF4" },
  successText: { flex: 1, color: theme.colors.success, fontSize: 12, fontWeight: "700", lineHeight: 17 },
  strengthMeter: { flexDirection: "row", alignItems: "center", marginTop: 12, gap: 10 },
  meterTrack: { flex: 1, height: 5, backgroundColor: "#E2E8F0", borderRadius: 3, overflow: "hidden" },
  meterFill: { height: "100%" },
  strengthLabel: { fontSize: 10, fontWeight: "900", width: 50, textAlign: "right", textTransform: "uppercase" },
  buttonContainer: { marginTop: 8, borderRadius: 18, elevation: 8, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.24, shadowRadius: 18 },
  buttonContainerMuted: { shadowOpacity: 0.1 },
  buttonGradient: { height: 56, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  buttonText: { color: theme.colors.white, fontSize: 16, fontWeight: "800" },
});