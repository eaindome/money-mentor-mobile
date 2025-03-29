// src/components/ui/StepIndicator.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../../theme/color';

interface StepIndicatorProps {
  steps: number;
  currentStep: number;
  labels?: string[];
}

const StepIndicator = ({ steps, currentStep, labels }: StepIndicatorProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.stepsContainer}>
        {Array(steps).fill(0).map((_, index) => (
          <React.Fragment key={index}>
            {/* Step dot */}
            <View 
              style={[
                styles.stepDot,
                currentStep >= index ? styles.activeDot : styles.inactiveDot
              ]}
            >
              {currentStep > index ? (
                <View style={styles.checkmark} />
              ) : (
                <Text style={styles.stepNumber}>{index + 1}</Text>
              )}
            </View>
            
            {/* Connector line */}
            {index < steps - 1 && (
              <View 
                style={[
                  styles.connector, 
                  currentStep > index ? styles.activeConnector : styles.inactiveConnector
                ]} 
              />
            )}
          </React.Fragment>
        ))}
      </View>
      
      {labels && (
        <View style={styles.labelContainer}>
          {Array(steps).fill(0).map((_, index) => (
            <Text
              key={`label-${index}`}
              style={[
                styles.stepLabel,
                currentStep >= index ? styles.activeLabel : styles.inactiveLabel,
                { maxWidth: `${100 / steps}%` }
              ]}
              numberOfLines={1}
            >
              {labels[index]}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDot: {
    backgroundColor: colors.emerald.DEFAULT,
  },
  inactiveDot: {
    backgroundColor: colors.gray.light,
    borderWidth: 1,
    borderColor: colors.gray.DEFAULT,
  },
  stepNumber: {
    color: colors.gray.dark,
    fontSize: 14,
    fontWeight: '500',
  },
  checkmark: {
    width: 10,
    height: 6,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.white,
    transform: [{ rotate: '-45deg' }],
  },
  connector: {
    flex: 1,
    height: 2,
    marginHorizontal: 4,
  },
  activeConnector: {
    backgroundColor: colors.emerald.DEFAULT,
  },
  inactiveConnector: {
    backgroundColor: colors.gray.light,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 8,
  },
  stepLabel: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  activeLabel: {
    color: colors.emerald.DEFAULT,
    fontWeight: '500',
  },
  inactiveLabel: {
    color: colors.gray.DEFAULT,
  },
});

export default StepIndicator;