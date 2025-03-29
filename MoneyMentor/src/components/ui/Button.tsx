// src/components/ui/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from "../../theme/color"

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  disabled?: boolean;
  pulsing?: boolean;
  className?: string;
  rightIcon?: string;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled = false,
  pulsing = false,
  className = '',
}) => {
  const buttonStyles = [
    styles.button,
    styles[`${size}Button`],
    variant === 'outline' && styles.outlineButton,
    disabled && styles.disabledButton,
  ];

  const textStyles = [
    styles.text,
    styles[`${size}Text`],
    variant === 'outline' && styles.outlineText,
    disabled && styles.disabledText,
  ];

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || isLoading}
        style={pulsing ? styles.pulsingContainer : undefined}
      >
        <LinearGradient
          colors={[colors.emerald.light, colors.emerald.DEFAULT]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[...buttonStyles.filter(Boolean), pulsing && styles.pulsingButton, { borderRadius: 9999 }]} 
        >
          {isLoading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={[textStyles, { fontWeight: 'bold', color: colors.white, textAlign: 'center' }]}>
              {title}
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
        style={[buttonStyles, pulsing && styles.pulsingButton]}
      >
        {isLoading ? (
          <ActivityIndicator color={variant === 'outline' ? colors.emerald.DEFAULT : colors.white} />
        ) : (
          <Text style={textStyles}>
            {title}
          </Text>
        )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  mediumButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.emerald.DEFAULT,
  },
  disabledButton: {
    opacity: 0.6,
  },
  text: {
    color: colors.white,
    fontWeight: 'bold',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  outlineText: {
    color: colors.emerald.DEFAULT,
  },
  disabledText: {
    opacity: 0.8,
  },
  pulsingContainer: {
    position: 'relative',
  },
  pulsingButton: {
    transform: [{ scale: 1 }],
  },
});

export default Button;