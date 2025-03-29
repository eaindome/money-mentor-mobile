// src/components/ui/ProgressBadge.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import colors from '../../theme/color';

interface ProgressBadgeProps {
  progress: number; // 0 to 1
}

const ProgressBadge = ({ progress }: ProgressBadgeProps) => {
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const progressText = Math.round(progress * 100);
  
  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [progress]);
  
  const width = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <Animated.View 
          style={[
            styles.progressBar,
            { width }
          ]} 
        />
      </View>
      <Text style={styles.progressText}>{progressText}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(72, 187, 120, 0.1)',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  progressContainer: {
    width: 50,
    height: 6,
    backgroundColor: 'rgba(72, 187, 120, 0.2)',
    borderRadius: 3,
    marginRight: 6,
    overflow: 'hidden',
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.emerald.DEFAULT,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.emerald.DEFAULT,
  },
});

export default ProgressBadge;