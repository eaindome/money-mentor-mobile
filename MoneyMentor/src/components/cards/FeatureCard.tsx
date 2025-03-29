// src/components/cards/FeatureCard.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import colors from '../../theme/color';

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
};

type FeatureCardNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  delay?: number;
  screenToNavigate?: keyof RootStackParamList;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  delay = 0,
  screenToNavigate
}) => {
  const navigation = useNavigation<FeatureCardNavigationProp>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handlePress = () => {
    if (screenToNavigate === 'SimulationResults') {
      navigation.navigate(screenToNavigate, {
        amount: 1000,
        investmentType: 'Stocks',
        days: 30,
        deposits: 5,
        frequency: 7,
      });
    } else if (screenToNavigate) {
      navigation.navigate(screenToNavigate);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={ 1}
      onPress={screenToNavigate ? handlePress : undefined}
    >
      <Animated.View
        style={[
          styles.card,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name={icon as any} size={28} color={colors.emerald.DEFAULT} />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
        {screenToNavigate && (
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color={colors.emerald.light}
            style={styles.chevron}
          />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    backgroundColor: 'rgba(0, 128, 0, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray.dark,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: colors.gray.DEFAULT,
  },
  chevron: {
    marginLeft: 8,
  }
});

export default FeatureCard;