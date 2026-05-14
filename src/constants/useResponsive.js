import { useWindowDimensions } from "react-native";

export const useResponsive = () => {
  const { width, height } = useWindowDimensions();

  const isTablet = width > 768;
  const isSmallDevice = height < 720;

  return {
    width,
    height,
    isTablet,
    isSmallDevice,
  };
};