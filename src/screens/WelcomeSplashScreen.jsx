import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Image,
  Keyboard,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import IMAGES from '../constants/images';
import { SCHOOLS } from '../constants/schools'; // Import SCHOOLS from the new central file
import { useResponsive } from '../constants/useResponsive';

const normalize = (value) => value.toLowerCase().trim();

function SchoolCard({ item, index, onPress, selected, cardWidth }) {
  const translateY = useRef(new Animated.Value(18)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 340,
        delay: 70 + index * 60,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        delay: 70 + index * 60,
        friction: 8,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, opacity, translateY]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable
          onPress={() => onPress(item)}
          onPressIn={() => {
            Animated.spring(scale, {
              toValue: 0.985,
              friction: 7,
              tension: 120,
              useNativeDriver: true,
            }).start();
          }}
          onPressOut={() => {
            Animated.spring(scale, {
              toValue: 1,
              friction: 7,
              tension: 120,
              useNativeDriver: true,
            }).start();
          }}
          style={[styles.schoolCard, selected && styles.schoolCardSelected, { width: cardWidth }]}
          accessibilityRole="button"
          accessibilityLabel={`Select ${item.name}`}
        >
          <Image source={item.logo} style={styles.schoolLogo} resizeMode="contain" />

          <View style={styles.schoolCopy}>
            <Text style={styles.schoolName} numberOfLines={2}>
              {item.name}
            </Text>
            <Text 
              style={styles.schoolCode} // Removed selected style as per request
              numberOfLines={1}
            >
              {item.shortName}
            </Text>
          </View>

          <View style={[styles.arrowCircle, selected && styles.arrowCircleSelected]}>
            <Ionicons name="chevron-forward" size={24} color="#050505" />
          </View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

export default function WelcomeSplashScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { width, height, isSmallDevice, isTablet } = useResponsive();
  const [query, setQuery] = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState(null);
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-16)).current;

  // Responsive Logic
  const containerMaxWidth = 1200;
  const numColumns = isTablet ? 2 : 1;
  const cardGap = 14;
  const horizontalPadding = isTablet ? 32 : 16;
  const listContentWidth = Math.min(width, containerMaxWidth);
  const cardWidth = (listContentWidth - (horizontalPadding * 2) - (cardGap * (numColumns - 1))) / numColumns;

  const headerHeight = Math.max(height * (isSmallDevice ? 0.44 : 0.48), isTablet ? 440 : 380);
  const illustrationHeight = headerHeight * 0.46;
  const illustrationAspectRatio = 1320 / 2868;
  const logoSize = isSmallDevice ? 64 : (isTablet ? 120 : 150);

  const filteredSchools = useMemo(() => {
    const searchText = normalize(query);

    if (!searchText) {
      return SCHOOLS;
    }

    return SCHOOLS.filter((school) =>
      normalize(`${school.name} ${school.shortName}`).includes(searchText)
    );
  }, [query]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 520,
        useNativeDriver: true,
      }),
      Animated.spring(headerTranslateY, {
        toValue: 0,
        friction: 9,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [headerOpacity, headerTranslateY]);

  const handleSelectSchool = (school) => {
    setSelectedSchoolId(school.id);
    Keyboard.dismiss();

    setTimeout(() => {
      navigation.navigate('Login', { selectedSchool: school });
    }, 220);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons name="search" size={22} color="#1f5fb9" />
      </View>
      <Text style={styles.emptyTitle}>No schools found</Text>
      <Text style={styles.emptySubtitle}>Try another school name or abbreviation.</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#eef6f5" />

      <View style={styles.page}>
        <Animated.View
          style={[
            styles.hero,
            { height: headerHeight, opacity: headerOpacity, transform: [{ translateY: headerTranslateY }], width: '100%' },
          ]}
        >
          <View style={styles.heroBackground}>
            <View style={[styles.illustrationClip, { height: illustrationHeight }]}>
              <Image
                source={IMAGES.splashBackground}
                style={[
                  styles.heroImage,
                  {
                    width: width * (isTablet ? 1.05 : 1.2),
                    height: (width * 1.2) / illustrationAspectRatio,
                    bottom: -(illustrationHeight * 1),
                  },
                ]}
                resizeMode="cover"
              />
            </View>

            <View style={[styles.brandBlock, { top: Math.max(insets.top + (height * 0.07), isSmallDevice ? 60 : 90) }]}>
              <Image
                source={IMAGES.logo}
                style={[styles.brandLogo, { width: logoSize, height: logoSize * 0.74 }]}
                resizeMode="contain"
              />
              <Text style={styles.brandName}>Maxzen</Text>
              <Text style={styles.brandSubtitle}>School Management System</Text>
            </View>

            <View style={styles.searchWrap}>
              <Ionicons name="search-outline" size={18} color="#7c8796" />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search School Name"
                placeholderTextColor="#7c8796"
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="search"
                style={styles.searchInput}
              />
              {query ? (
                <Pressable
                  onPress={() => setQuery('')}
                  hitSlop={10}
                  style={styles.clearButton}
                  accessibilityRole="button"
                  accessibilityLabel="Clear school search"
                >
                  <Ionicons name="close" size={16} color="#6b7280" />
                </Pressable>
              ) : null}
            </View>
          </View>
        </Animated.View>

        <FlatList
          data={filteredSchools}
          numColumns={numColumns}
          key={isTablet ? 'tablet-grid' : 'mobile-list'}
          renderItem={({ item, index }) => (
            <SchoolCard
              item={item}
              index={index}
              onPress={handleSelectSchool}
              selected={selectedSchoolId === item.id}
              cardWidth={cardWidth}
            />
          )}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: Math.max(insets.bottom + 20, 40), paddingHorizontal: horizontalPadding },
            filteredSchools.length === 0 && styles.emptyListContent,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  page: {
    flex: 1,
    backgroundColor: '#ffffff',
    width: '100%',
  },
  hero: {
    backgroundColor: '#eef6f5',
    borderBottomLeftRadius: 42,
    borderBottomRightRadius: 42,
    overflow: 'hidden',
  },
  heroBackground: {
    flex: 1,
    backgroundColor: '#eef6f5',
  },
  illustrationClip: {
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
  },
  heroImage: {
    alignSelf: 'center',
    position: 'absolute',
  },
  brandBlock: {
    alignItems: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  brandLogo: {
    marginBottom: 4,
  },
  brandName: {
    color: '#050505',
    fontSize: 23,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 29,
  },
  brandSubtitle: {
    color: '#0755ce',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 18,
    marginTop: 2,
  },
  searchWrap: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#2b65d7',
    borderRadius: 16,
    borderWidth: 1.5,
    bottom: 24,
    flexDirection: 'row',
    height: 54,
    paddingHorizontal: 16,
    position: 'absolute',
    width: '89%',
    ...Platform.select({
      ios: {
        shadowColor: '#1f5fb9',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 14,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  searchInput: {
    color: '#111827',
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    height: '100%',
    letterSpacing: 0,
    paddingHorizontal: 8,
  },
  clearButton: {
    alignItems: 'center',
    backgroundColor: '#f3f6fb',
    borderRadius: 11,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  listContent: {
    paddingTop: 48,
    alignSelf: 'center',
  },
  schoolCard: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#f1f5f9',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 88,
    marginBottom: 14,
    marginHorizontal: 6, // Gap between grid items
    paddingHorizontal: 18,
    paddingVertical: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  schoolCardSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#f8faff',
    borderWidth: 1.5,
  },
  schoolLogo: {
    height: 62,
    width: 62,
    marginRight: 16,
  },
  schoolCopy: {
    flex: 1,
    justifyContent: 'center',
  },
  schoolName: {
    color: '#1e293b',
    fontSize: 19,
    fontWeight: '700',
    lineHeight: 24,
  },
  schoolCode: {
    color: '#1e293b', // Match schoolName
    fontSize: 19, // Match schoolName
    fontWeight: '700', // Match schoolName
    marginTop: 2, // Adjust spacing
  },
  arrowCircle: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    marginLeft: 8,
    width: 32,
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
  },
  arrowCircleSelected: {
    backgroundColor: '#2563eb',
    transform: [{ scale: 1.04 }],
  },
  emptyListContent: {
    flexGrow: 1,
  },
  emptyState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: '#eaf2ff',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    marginBottom: 12,
    width: 44,
  },
  emptyTitle: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
});
