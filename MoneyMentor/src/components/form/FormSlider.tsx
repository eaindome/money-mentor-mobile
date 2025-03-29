import React, { useRef, useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
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
  // Use controlled value from props directly rather than duplicating in local state
  const [displayValue, setDisplayValue] = useState(value);
  const thumbAnim = useRef(new Animated.Value(1)).current;
  const bubbleOpacity = useRef(new Animated.Value(0)).current;
  const bubbleScale = useRef(new Animated.Value(0.8)).current;
  const sliderWidth = useRef(0);
  
  // Debounce timer ref for smoother updates to parent
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Update display value when prop value changes
  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  // Memoize track color to prevent unnecessary recalculations
  const trackColor = useMemo(() => {
    const percentage = (value - minimumValue) / (maximumValue - minimumValue);
    if (percentage < 0.25) return colors.emerald.light;
    if (percentage < 0.5) return colors.emerald.DEFAULT;
    if (percentage < 0.75) return colors.emerald.dark;
    return colors.emerald.dark;
  }, [value, minimumValue, maximumValue]);

  // Handle slider width measurement
  const onSliderLayout = (event: any) => {
    sliderWidth.current = event.nativeEvent.layout.width;
  };

  const handleValueChange = (val: number) => {
    // Update local display immediately for responsive UI
    setDisplayValue(val);
    
    // Show the value bubble with smooth animation
    Animated.parallel([
      Animated.timing(bubbleOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(bubbleScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start();
    
    // Subtle pulse animation on thumb - make it very subtle
    Animated.sequence([
      Animated.timing(thumbAnim, {
        toValue: 1.05,
        duration: 30,
        useNativeDriver: true,
      }),
      Animated.timing(thumbAnim, {
        toValue: 1,
        duration: 30,
        useNativeDriver: true,
      })
    ]).start();
    
    // Debounce the update to parent component to reduce excess renders
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      onValueChange(val);
    }, 10); // Small delay to batch updates
  };
  
  const handleSlidingComplete = (val: number) => {
    // Ensure final value is sent to parent
    onValueChange(val);
    
    // Fade out bubble after sliding completes
    Animated.parallel([
      Animated.timing(bubbleOpacity, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
        delay: 800, // Keep visible for a moment before fading
      }),
      Animated.timing(bubbleScale, {
        toValue: 0.8,
        duration: 400,
        useNativeDriver: true,
        delay: 800,
      })
    ]).start();
  };

  const handleSlidingStart = () => {
    // Show bubble when sliding starts
    Animated.parallel([
      Animated.timing(bubbleOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(bubbleScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start();
  };
  
  // Calculate the left position for the label bubble based on value
  const getLabelPosition = () => {
    const percentage = (displayValue - minimumValue) / (maximumValue - minimumValue);
    // Apply constraints to keep bubble within visible area
    const constrainedPercentage = Math.max(0.02, Math.min(0.98, percentage));
    return `${constrainedPercentage * 100}%`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <View style={styles.sliderContainer} onLayout={onSliderLayout}>
        <Slider
          style={styles.slider}
          value={value} // Use the prop value directly
          minimumValue={minimumValue}
          maximumValue={maximumValue}
          step={step}
          minimumTrackTintColor={trackColor}
          maximumTrackTintColor={colors.gray.light}
          thumbTintColor={colors.emerald.DEFAULT}
          onValueChange={handleValueChange}
          onSlidingStart={handleSlidingStart}
          onSlidingComplete={handleSlidingComplete}
          // Performance optimizations
          tapToSeek={Platform.OS === 'ios'} // Only use on iOS
          {...(Platform.OS === 'android' ? {
            thumbImage: undefined,
            animateTransitions: false, // Disable for smoother Android performance
          } : {})}
        />
        
        {/* Value label bubble with animation */}
        <Animated.View 
          style={[
            styles.valueBubble,
            { 
              left: sliderWidth.current * (parseFloat(getLabelPosition()) / 100),
              opacity: bubbleOpacity,
              transform: [
                { translateX: -20 }, // Center the bubble
                { scale: bubbleScale }
              ]
            }
          ]}
          pointerEvents="none" // Prevent bubble from intercepting touches
        >
          <Text style={styles.valueText}>
            {formatLabel ? formatLabel(displayValue) : displayValue.toString()}
          </Text>
        </Animated.View>
        
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
    // Reduce margins to improve thumb movement
    marginHorizontal: 0,
  },
  valueBubble: {
    position: 'absolute',
    top: -16,
    backgroundColor: colors.emerald.DEFAULT,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
    // Optimized shadows
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
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