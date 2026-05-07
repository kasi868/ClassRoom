import { StatusBar } from 'expo-status-bar';
import {
  Image,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import images from '../constants/images';

const ROLE_ITEMS = [
  {
    key: 'student',
    label: 'Student',
    color: '#2366d8',
    icon: 'graduation',
  },
  {
    key: 'parent',
    label: 'Parent',
    color: '#9acb7d',
    icon: 'parent',
  },
  {
    key: 'teacher',
    label: 'Teacher',
    color: '#2366d8',
    icon: 'teacher',
  },
];

function RoleIcon({ type, color }) {
  if (type === 'graduation') {
    return (
      <View style={styles.iconBox} accessibilityElementsHidden>
        <View style={[styles.capTop, { borderBottomColor: color }]} />
        <View style={[styles.capBand, { borderColor: color }]} />
        <View style={[styles.capTassel, { backgroundColor: color }]} />
      </View>
    );
  }

  if (type === 'parent') {
    return (
      <View style={styles.iconBox} accessibilityElementsHidden>
        <View style={styles.peopleRow}>
          <View style={[styles.personHead, { borderColor: color }]} />
          <View style={[styles.personHeadSmall, { borderColor: color }]} />
        </View>
        <View style={styles.peopleRow}>
          <View style={[styles.personBody, { borderColor: color }]} />
          <View style={[styles.personBodySmall, { borderColor: color }]} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.iconBox} accessibilityElementsHidden>
      <View style={[styles.boardFrame, { borderColor: color }]}>
        <View style={[styles.boardLine, { backgroundColor: color }]} />
        <View style={[styles.boardLineShort, { backgroundColor: color }]} />
      </View>
      <View style={[styles.boardStand, { backgroundColor: color }]} />
    </View>
  );
}

function RoleItem({ item, showDivider }) {
  return (
    <View style={styles.roleWrapper}>
      <View style={styles.roleItem}>
        <RoleIcon type={item.icon} color={item.color} />
        <Text style={styles.roleLabel}>{item.label}</Text>
      </View>
      {showDivider ? <View style={styles.roleDivider} /> : null}
    </View>
  );
}

export default function SplashScreen() {
  const { height, width } = useWindowDimensions();
  const compactHeight = height < 700;
  const horizontalPadding = Math.max(24, width * 0.08);

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <ImageBackground
        source={images.splashBackground}
        style={styles.background}
        imageStyle={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={[styles.content, { paddingHorizontal: horizontalPadding }]}>
          <View style={[styles.brandBlock, compactHeight && styles.brandBlockCompact]}>
            <Image source={images.logo} style={styles.logo} resizeMode="contain" />
            <Text style={styles.appName}>Maxzen</Text>
            <Text style={styles.subtitle}>School Management System</Text>
          </View>

          <View style={[styles.rolesRow, compactHeight && styles.rolesRowCompact]}>
            {ROLE_ITEMS.map((item, index) => (
              <RoleItem
                key={item.key}
                item={item}
                showDivider={index < ROLE_ITEMS.length - 1}
              />
            ))}
          </View>

          <Text style={styles.tagline}>Learn. Track. Grow</Text>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#eaf7f5',
  },
  background: {
    flex: 1,
    width: '100%',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: Platform.select({
      ios: 120,
      android: 104,
      default: 96,
    }),
  },
  brandBlock: {
    alignItems: 'center',
    marginTop: '7%',
  },
  brandBlockCompact: {
    marginTop: '3%',
  },
  logo: {
    width: 298,
    height: 166,
    marginBottom: 4,
  },
  appName: {
    color: '#050505',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 0,
    lineHeight: 36,
  },
  subtitle: {
    color: '#0755ce',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0,
    marginTop: 6,
  },
  rolesRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 62,
    minHeight: 56,
  },
  rolesRowCompact: {
    marginTop: 42,
  },
  roleWrapper: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  roleItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
  },
  roleDivider: {
    width: StyleSheet.hairlineWidth,
    height: 35,
    backgroundColor: '#9aa9b9',
    marginHorizontal: 12,
    opacity: 0.85,
  },
  roleLabel: {
    color: '#151515',
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 0,
    marginTop: 5,
  },
  iconBox: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    width: 28,
  },
  capTop: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    transform: [{ rotate: '180deg' }],
  },
  capBand: {
    width: 13,
    height: 8,
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderRadius: 2,
    marginTop: -1,
  },
  capTassel: {
    position: 'absolute',
    right: 6,
    top: 10,
    width: 1.5,
    height: 9,
    borderRadius: 1,
  },
  peopleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  personHead: {
    width: 8,
    height: 8,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 5,
  },
  personHeadSmall: {
    width: 7,
    height: 7,
    borderWidth: 2,
    borderRadius: 4,
    marginTop: 5,
  },
  personBody: {
    width: 10,
    height: 11,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderTopWidth: 2,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    marginRight: 3,
  },
  personBodySmall: {
    width: 8,
    height: 9,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderTopWidth: 2,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  boardFrame: {
    width: 17,
    height: 16,
    borderWidth: 1.6,
    borderRadius: 1,
    paddingHorizontal: 3,
    paddingTop: 4,
  },
  boardLine: {
    width: 8,
    height: 1.5,
    borderRadius: 1,
    marginBottom: 3,
  },
  boardLineShort: {
    width: 5,
    height: 1.5,
    borderRadius: 1,
  },
  boardStand: {
    width: 2,
    height: 7,
    borderRadius: 1,
    marginTop: -1,
  },
  tagline: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0,
    marginTop: 22,
  },
});
