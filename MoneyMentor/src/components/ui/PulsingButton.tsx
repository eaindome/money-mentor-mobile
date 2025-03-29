// src/components/ui/PulsingButton.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../theme/color';

interface PulsingButtonProps {
  title: string;
  onPress: () => void;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const PulsingButton: React.FC<PulsingButtonProps> = ({
  title,
  onPress,
  size = 'large',
  className = '',
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const sizeStyles = {
    small: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      fontSize: 14,
    },
    medium: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      fontSize: 16,
    },
    large: {
      paddingVertical: 16,
      paddingHorizontal: 32,
      fontSize: 18,
    },
  };

  return (
    <Animated.View
      style={[
        styles.buttonContainer,
        { transform: [{ scale: pulseAnim }] },
      ]}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <LinearGradient
          colors={[colors.emerald.light, colors.emerald.DEFAULT]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.button,
            {
              paddingVertical: sizeStyles[size].paddingVertical,
              paddingHorizontal: sizeStyles[size].paddingHorizontal,
              borderRadius: 9999,
            },
          ]}
        >
          <Text 
            style={[styles.text, { fontSize: sizeStyles[size].fontSize }]} 
          >
            {title}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    alignSelf: 'center',
    shadowColor: colors.emerald.DEFAULT,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.white,
    fontWeight: 'bold',
  },
});

export default PulsingButton;