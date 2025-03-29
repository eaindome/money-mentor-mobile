// src/components/form/FormSlider.tsx
import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
// @ts-ignore
import Slider from '@react-native-community/slider'; 
import colors from '../../theme/color';

interface FormSliderProps {
  label: string;
  value: number;
  minimumValue: number;
  maximumValue: number;
  step: number;
  formatLabel?: (value: number) => string;
  onValueChange: (value: number) => void;
}

const FormSlider = ({
  label,
  value,
  minimumValue,
  maximumValue,
  step,
  formatLabel,
  onValueChange
}: FormSliderProps) => {
  const [localValue, setLocalValue] = useState(value);
  const thumbAnim = useRef(new Animated.Value(1)).current;
  
  const handleValueChange = (val: number) => {
    setLocalValue(val);
    
    // Pulse animation on thumb
    Animated.sequence([
      Animated.timing(thumbAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(thumbAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
  };
  
  const handleSlidingComplete = (val: number) => {
    onValueChange(val);
  };
  
  // Calculate the left position for the label bubble based on value
  const getLabelPosition = () => {
    const percentage = (localValue - minimumValue) / (maximumValue - minimumValue);
    return `${percentage * 100}%`;
  };
  
  // Get the color for the track based on value
  const getTrackColor = () => {
    const percentage = (localValue - minimumValue) / (maximumValue - minimumValue);
    if (percentage < 0.25) return colors.emerald.light;
    if (percentage < 0.5) return colors.emerald.DEFAULT;
    if (percentage < 0.75) return colors.emerald.dark;
    // src/components/form/FormSlider.tsx (continued)
    return colors.emerald.dark; // For values >= 0.75
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          value={localValue}
          minimumValue={minimumValue}
          maximumValue={maximumValue}
          step={step}
          minimumTrackTintColor={getTrackColor()}
          maximumTrackTintColor={colors.gray.light}
          thumbTintColor={colors.emerald.DEFAULT}
          onValueChange={handleValueChange}
          onSlidingComplete={handleSlidingComplete}
        />
        
        {/* Value label bubble */}
        <View 
          style={[
            styles.valueBubble,
            { left: `${parseFloat(getLabelPosition())}%` }
          ]}
        >
          <Text style={styles.valueText}>
            {formatLabel ? formatLabel(localValue) : localValue.toString()}
          </Text>
        </View>
        
        {/* Min/Max labels */}
        <View style={styles.minMaxContainer}>
          <Text style={styles.minMaxLabel}>
            {formatLabel ? formatLabel(minimumValue) : minimumValue.toString()}
          </Text>
          <Text style={styles.minMaxLabel}>
            {formatLabel ? formatLabel(maximumValue) : maximumValue.toString()}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray.dark,
    marginBottom: 8,
  },
  sliderContainer: {
    marginTop: 16,
    marginBottom: 8,
    position: 'relative',
  },
  slider: {
    height: 40,
    width: '100%',
  },
  valueBubble: {
    position: 'absolute',
    top: -16,
    backgroundColor: colors.emerald.DEFAULT,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
    transform: [{ translateX: -20 }], // Half the width of the bubble
  },
  valueText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  minMaxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  minMaxLabel: {
    fontSize: 12,
    color: colors.gray.DEFAULT,
  },
});

export default FormSlider;