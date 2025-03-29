// src/screens/HomeScreen.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import Container from '../components/layout/Container';
import Logo from '../components/ui/Logo';
import PulsingButton from '../components/ui/PulsingButton';
import FeatureCard from '../components/cards/FeatureCard';
import colors from '../theme/color';

type RootStackParamList = {
  Home: undefined;
  Quiz: undefined;
  SimulationInput: undefined;
  SimulationResults: {
    amount: number;
    investmentType: string;
    days: number;
    deposits: number;
    frequency: number;
  };
  ChallengeSetup: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handleGetStarted = () => {
    navigation.navigate('Quiz');
  };

  return (
    <Container>
      <LinearGradient
        colors={['#f0fff4', '#ffffff']}
        style={styles.gradient}
      >
        <View style={styles.scrollContent}>
          {/* Header Section */}
          <View style={styles.header}>
            <Logo size="large" />
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
              <Text style={styles.subtitle}>
                Let's make investing less scary, together!
              </Text>
            </Animated.View>
          </View>

          {/* Main Illustration */}
          <Animated.View 
            style={[
              styles.illustrationWrapper,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <View style={styles.illustrationContainer}>
              <Image 
                // source={require('../assets/money-mentor-mascot.png')} 
                style={styles.image}
              />
              <View style={styles.badge}>
                <MaterialCommunityIcons name="shield-check" size={18} color={colors.white} />
                <Text style={styles.badgeText}>Safe & Guided</Text>
              </View>
            </View>
          </Animated.View>

          {/* Feature Cards */}
          <View style={styles.featuresContainer}>
            <FeatureCard
              icon="trophy"
              title="Micro-Challenges"
              description="Build confidence with bite-sized financial wins"
              delay={200}
              screenToNavigate="ChallengeSetup"
            />
            <FeatureCard
              icon="chart-line"
              title="Investment Simulator"
              description="Practice investing without risk"
              delay={400}
              screenToNavigate="SimulationInput"
            />
          </View>
        </View>
      </LinearGradient>
    </Container>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 20,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.gray.DEFAULT,
    fontWeight: '500',
    marginTop: 15,
    flexWrap: 'wrap'
  },
  illustrationWrapper: {
    alignItems: 'center',
    marginVertical: 20,
    marginTop: 2
  },
  illustrationContainer: {
    backgroundColor: 'rgba(80, 200, 120, 0.15)',
    borderRadius: 9999,
    padding: 30,
    position: 'relative',
  },
  image: {
    width: 220,
    height: 220,
    resizeMode: 'contain',
  },
  badge: {
    position: 'absolute',
    bottom: 20,
    right: -10,
    backgroundColor: colors.emerald.DEFAULT,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  badgeText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 14,
  },
  featuresContainer: {
    marginTop: 30,
    marginBottom: 30,
  },
  ctaContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
});

export default HomeScreen;