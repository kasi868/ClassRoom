import { PixelRatio, Platform, useWindowDimensions } from "react-native";
import { useMemo } from "react";

const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;
const TABLET_WIDTH = 768;
const LARGE_TABLET_WIDTH = 1024;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const getScreenCategory = (width) => {
  if (width < 360) return "compact";
  if (width < 430) return "regular";
  if (width < TABLET_WIDTH) return "largePhone";
  if (width < LARGE_TABLET_WIDTH) return "tablet";
  return "largeTablet";
};

export const isTabletWidth = (width) => width >= TABLET_WIDTH;
export const isSmallDeviceSize = (width, height) => width < 360 || height < 700;

export const responsiveWidth = (value, width = BASE_WIDTH) =>
  PixelRatio.roundToNearestPixel((value * width) / BASE_WIDTH);

export const responsiveHeight = (value, height = BASE_HEIGHT) =>
  PixelRatio.roundToNearestPixel((value * height) / BASE_HEIGHT);

export const responsiveFont = (size, width = BASE_WIDTH, fontScale = 1) => {
  const category = getScreenCategory(width);
  const scaleByWidth = clamp(width / BASE_WIDTH, 0.88, category.includes("tablet") ? 1.2 : 1.08);
  const accessibilityScale = clamp(fontScale, 1, 1.28);
  return PixelRatio.roundToNearestPixel(size * scaleByWidth * accessibilityScale);
};

export const lineHeight = (fontSize, multiplier = 1.32) =>
  PixelRatio.roundToNearestPixel(fontSize * multiplier);

export const getSpacing = (width) => {
  const category = getScreenCategory(width);
  const factor =
    category === "compact" ? 0.82 :
    category === "regular" ? 0.94 :
    category === "largePhone" ? 1 :
    category === "tablet" ? 1.18 :
    1.32;

  const s = (value) => PixelRatio.roundToNearestPixel(value * factor);

  return {
    none: 0,
    xxs: s(4),
    xs: s(8),
    sm: s(12),
    md: s(16),
    lg: s(20),
    xl: s(24),
    xxl: s(32),
    page: s(category === "compact" ? 14 : 18),
    section: s(22),
    gap: s(12),
  };
};

export const getTypography = (width, fontScale) => {
  const f = (size) => responsiveFont(size, width, fontScale);

  return {
    caption: { fontSize: f(11), lineHeight: lineHeight(f(11), 1.35) },
    label: { fontSize: f(12), lineHeight: lineHeight(f(12), 1.35) },
    bodySmall: { fontSize: f(13), lineHeight: lineHeight(f(13), 1.42) },
    body: { fontSize: f(14), lineHeight: lineHeight(f(14), 1.45) },
    bodyLarge: { fontSize: f(16), lineHeight: lineHeight(f(16), 1.4) },
    titleSmall: { fontSize: f(18), lineHeight: lineHeight(f(18), 1.3) },
    title: { fontSize: f(20), lineHeight: lineHeight(f(20), 1.26) },
    headline: { fontSize: f(24), lineHeight: lineHeight(f(24), 1.22) },
  };
};

export const getCardMetrics = (width, height) => {
  const category = getScreenCategory(width);
  const spacing = getSpacing(width);

  return {
    radius: category === "compact" ? 16 : category.includes("tablet") ? 22 : 18,
    largeRadius: category === "compact" ? 20 : 26,
    padding: spacing.md,
    compactPadding: spacing.sm,
    minInteractiveSize: 44,
    dashboardMinHeight: isSmallDeviceSize(width, height) ? 116 : category.includes("tablet") ? 146 : 126,
    categoryAspectRatio: category === "compact" ? 0.84 : category.includes("tablet") ? 0.96 : 0.88,
  };
};

export const getGridColumns = (width, type = "dashboard") => {
  if (type === "category") {
    if (width >= 1100) return 6;
    if (width >= 768) return 5;
    if (width >= 430) return 4;
    return 3;
  }

  if (width >= 1100) return 4;
  if (width >= 768) return 3;
  if (width >= 380) return 2;
  return 1;
};

export const getContentWidth = (width, maxWidth = 1120) => Math.min(width, maxWidth);

export const getGridItemWidth = (width, columns, horizontalPadding, gap, maxWidth = 1120) => {
  const contentWidth = getContentWidth(width, maxWidth);
  return Math.floor((contentWidth - horizontalPadding * 2 - gap * (columns - 1)) / columns);
};

export const shadow = (level = "sm") => {
  const config = {
    sm: { elevation: 2, opacity: 0.04, radius: 8, height: 3 },
    md: { elevation: 4, opacity: 0.07, radius: 14, height: 8 },
    lg: { elevation: 8, opacity: 0.11, radius: 20, height: 12 },
  }[level];

  return Platform.select({
    ios: {
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: config.height },
      shadowOpacity: config.opacity,
      shadowRadius: config.radius,
    },
    android: {
      elevation: config.elevation,
    },
    default: {
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: config.height },
      shadowOpacity: config.opacity,
      shadowRadius: config.radius,
      elevation: config.elevation,
    },
  });
};

export const colors = {
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  background: "#F5F7FB",
  surface: "#FFFFFF",
  surfaceSoft: "#F8FAFC",
  textPrimary: "#111827",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  border: "#E5E7EB",
  success: "#16A34A",
  warning: "#F59E0B",
  error: "#DC2626",
};

export const useAdaptiveLayout = () => {
  const dimensions = useWindowDimensions();
  const { width, height, fontScale, scale } = dimensions;

  return useMemo(() => {
    const category = getScreenCategory(width);
    const spacing = getSpacing(width);
    const typography = getTypography(width, fontScale);
    const card = getCardMetrics(width, height);
    const isTablet = isTabletWidth(width);
    const isSmallDevice = isSmallDeviceSize(width, height);
    const isLandscape = width > height;
    const aspectRatio = height ? width / height : 0;

    return {
      width,
      height,
      fontScale,
      pixelScale: scale,
      category,
      aspectRatio,
      isTablet,
      isSmallDevice,
      isLandscape,
      spacing,
      typography,
      card,
      colors,
      maxContentWidth: isTablet ? 1120 : width,
      contentWidth: getContentWidth(width),
      responsiveWidth: (value) => responsiveWidth(value, width),
      responsiveHeight: (value) => responsiveHeight(value, height),
      responsiveFont: (value) => responsiveFont(value, width, fontScale),
      lineHeight,
      gridColumns: (type) => getGridColumns(width, type),
      gridItemWidth: (columns, horizontalPadding = spacing.page, gap = spacing.gap, maxWidth) =>
        getGridItemWidth(width, columns, horizontalPadding, gap, maxWidth),
      shadow,
    };
  }, [fontScale, height, scale, width]);
};
