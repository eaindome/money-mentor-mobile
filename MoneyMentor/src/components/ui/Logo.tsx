// src/components/ui/Logo.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../../theme/color';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'medium', className = '' }) => {
  const iconSize = size === 'small' ? 20 : size === 'medium' ? 28 : 36;
  
  return (
    <View style={styles.logoContainer}>
      <View style={styles.iconWrapper}>
        <MaterialCommunityIcons 
          name="cash-multiple" 
          size={iconSize} 
          color={colors.white} 
        />
      </View>
      <Text 
        style={[styles.logoText, styles[`${size}Logo`]]} 
      >
        Money<Text style={{ color: colors.emerald.light }}>Mentor</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    backgroundColor: colors.emerald.DEFAULT,
    borderRadius: 12,
    padding: 8,
    marginRight: 8,
    shadowColor: colors.emerald.DEFAULT,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  logoText: {
    fontWeight: 'bold',
    color: colors.emerald.DEFAULT,
  },
  smallLogo: {
    fontSize: 20,
  },
  mediumLogo: {
    fontSize: 28,
  },
  largeLogo: {
    fontSize: 36,
  },
});

export default Logo;