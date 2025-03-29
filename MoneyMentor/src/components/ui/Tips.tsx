// src/components/ui/Tip.tsx
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../../theme/color';

interface TipProps {
  text: string;
  type?: 'info' | 'success' | 'warning' | 'motivation';
}

const Tip = ({ text, type = 'info' }: TipProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(10)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      })
    ]).start();
  }, []);
  
  // Get icon and colors based on type
  const getTypeStyles = (): {
    icon: 'check-circle' | 'alert-circle' | 'star' | 'information';
    color: string;
    backgroundColor: string;
  } => {
    switch(type) {
      case 'success':
        return {
          icon: 'check-circle',
          color: colors.emerald.DEFAULT,
          backgroundColor: 'rgba(72, 187, 120, 0.1)',
        };
      case 'warning':
        return {
          icon: 'alert-circle',
          color: '#F59E0B', // Amber
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
        };
      case 'motivation':
        return {
          icon: 'star',
          color: '#8B5CF6', // Purple
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
        };
      case 'info':
      default:
        return {
          icon: 'information',
          color: '#3B82F6', // Blue
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
        };
    }
  };
  
  const { icon, color, backgroundColor } = getTypeStyles();

  return (
    <Animated.View 
      style={[
        styles.container,
        { backgroundColor },
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <MaterialCommunityIcons 
        name={icon} 
        size={18} 
        color={color} 
        style={styles.icon}
      />
      <Text style={[styles.text, { color }]}>{text}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  }
});

export default Tip;