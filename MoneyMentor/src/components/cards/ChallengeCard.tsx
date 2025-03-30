import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity,
  StyleSheet 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  useAnimatedProps,
  withTiming, 
  Easing,
  interpolateColor,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

// Types
export type Challenge = {
  id: string;
  title: string;
  description: string;
  type: 'savings' | 'investment';
  goal: number;
  currentProgress: number;
  duration: number; // in days
  startDate: string;
  lastUpdated: string;
  isCompleted: boolean;
  isNudged: boolean;
  commitment: string;
  daysLeft?: number; // Optional calculated field
  rawData?: any; // Store original data for debugging
};

// Theme
const financeTheme = {
  primary: {
    light: '#d7f9ee',
    DEFAULT: '#10b981',
    dark: '#047857',
  },
  secondary: {
    light: '#dbeafe',
    DEFAULT: '#3b82f6',
    dark: '#1e40af',
  },
  success: {
    light: '#d1fae5',
    DEFAULT: '#10b981',
    dark: '#047857',
  },
  warning: {
    light: '#fef3c7',
    DEFAULT: '#f59e0b',
    dark: '#b45309',
  },
  info: {
    light: '#e0f2fe',
    DEFAULT: '#0ea5e9',
    dark: '#0369a1',
  },
  neutral: {
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    700: '#374151',
  },
};

// Badge Component with animation
const Badge = ({ type, text }: { type: 'success' | 'warning' | 'info' | 'neutral'; text: string }) => {
  const scaleAnim = useSharedValue(0.8);
  
  useEffect(() => {
    scaleAnim.value = withTiming(1, { duration: 300, easing: Easing.bezier(0.34, 1.56, 0.64, 1) });
  }, []);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleAnim.value }],
    };
  });
  
  const colors = {
    success: {
      bg: financeTheme.success.light,
      text: financeTheme.success.dark,
    },
    warning: {
      bg: financeTheme.warning.light,
      text: financeTheme.warning.dark,
    },
    info: {
      bg: financeTheme.info.light,
      text: financeTheme.info.dark,
    },
    neutral: {
      bg: financeTheme.neutral[200],
      text: financeTheme.neutral[700],
    }
  };
  
  return (
    <Animated.View style={[
      styles.badge,
      { backgroundColor: colors[type].bg },
      animatedStyle
    ]}>
      <Text style={[
        styles.badgeText,
        { color: colors[type].text }
      ]}>
        {text}
      </Text>
    </Animated.View>
  );
};

// Progress Ring Component
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const ProgressRing = ({ 
  progress, 
  size = 64,
  strokeWidth = 6,
  isCompleted = false 
}: { 
  progress: number; 
  size?: number;
  strokeWidth?: number;
  isCompleted?: boolean;
}) => {
  const progressValue = useSharedValue(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  useEffect(() => {
    progressValue.value = withTiming(progress, { 
      duration: 1500, 
      easing: Easing.bezierFn(0.16, 1, 0.3, 1) 
    });
  }, [progress]);
  
  const animatedCircleProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progressValue.value),
    stroke: interpolateColor(
      progressValue.value,
      [0, 0.5, 1],
      [financeTheme.info.DEFAULT, financeTheme.secondary.DEFAULT, financeTheme.success.DEFAULT]
    ),
  }));
  
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Animated.View style={{ transform: [{ rotate: '-90deg' }] }}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={financeTheme.neutral[200]}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={financeTheme.success.DEFAULT}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            animatedProps={animatedCircleProps}
            strokeLinecap="round"
          />
        </Svg>
      </Animated.View>
      <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
        {isCompleted ? (
          <AntDesign name="checkcircle" size={size/3} color={financeTheme.success.DEFAULT} />
        ) : (
          <Text style={{ fontSize: size/4, fontWeight: '700', color: financeTheme.neutral[700] }}>
            {Math.min(100, Math.max(0, (progress * 100))).toFixed(0)}%
          </Text>
        )}
      </View>
    </View>
  );
};

// Utility functions 
const formatCurrency = (amount: number): string => {
  if (isNaN(amount)) return 'GH₵ 0.00';
  return `GH₵ ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

const getTimeRemaining = (startDateStr: string, durationDays: number): number => {
  const startDate = new Date(startDateStr);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + durationDays);
  const today = new Date();
  return Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? "-" : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Pulse animation component for nudge
const PulseEffect = ({ color = financeTheme.warning.DEFAULT }) => {
  const scale1 = useSharedValue(1);
  const scale2 = useSharedValue(1);
  const opacity1 = useSharedValue(0.7);
  const opacity2 = useSharedValue(0.5);
  
  useEffect(() => {
    const animate = () => {
      scale1.value = withTiming(1.5, { duration: 1500 }, () => {
        scale1.value = 1;
        setTimeout(animate, 500);
      });
      opacity1.value = withTiming(0, { duration: 1500 });
      
      setTimeout(() => {
        scale2.value = withTiming(1.5, { duration: 1500 }, () => {
          scale2.value = 1;
        });
        opacity2.value = withTiming(0, { duration: 1500 }, () => {
          opacity2.value = 0.5;
        });
      }, 400);
    };
    
    animate();
    
    return () => {
      // Cleanup if needed
    };
  }, []);
  
  const animStyle1 = useAnimatedStyle(() => ({
    transform: [{ scale: scale1.value }],
    opacity: opacity1.value,
  }));
  
  const animStyle2 = useAnimatedStyle(() => ({
    transform: [{ scale: scale2.value }],
    opacity: opacity2.value,
  }));
  
  return (
    <View style={styles.pulseContainer}>
      <Animated.View style={[styles.pulseCircle, { backgroundColor: color }, animStyle1]} />
      <Animated.View style={[styles.pulseCircle, { backgroundColor: color }, animStyle2]} />
    </View>
  );
};

// Enhanced ChallengeCard component
const ChallengeCard = ({ 
  challenge, 
  isExpanded, 
  onToggleExpand, 
  onUpdateProgress 
}: { 
  challenge: Challenge; 
  isExpanded: boolean; 
  onToggleExpand: () => void; 
  onUpdateProgress: (id: string) => void;
}) => {
  const progressValue = useSharedValue(0);
  const cardScale = useSharedValue(1);
  const cardOpacity = useSharedValue(0.8);
  
  useEffect(() => {
    // Fade in animation
    cardOpacity.value = withTiming(1, { duration: 500 });
    
    // Animate progress
    progressValue.value = withTiming(
      challenge.goal > 0 ? Math.min(1, challenge.currentProgress / challenge.goal) : 0,
      { duration: 1200, easing: Easing.bezierFn(0.16, 1, 0.3, 1) }
    );
  }, [challenge.currentProgress, challenge.goal]);

  const handlePressIn = () => {
    cardScale.value = withTiming(0.98, { duration: 150 });
  };

  const handlePressOut = () => {
    cardScale.value = withTiming(1, { duration: 300 });
  };
  
  // Card animations
  const cardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: cardScale.value }],
      opacity: cardOpacity.value,
    };
  });
  
  // Progress bar animation
  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${progressValue.value * 100}%`,
      backgroundColor: interpolateColor(
        progressValue.value,
        [0, 0.5, 1],
        [financeTheme.info.DEFAULT, financeTheme.secondary.DEFAULT, financeTheme.success.DEFAULT]
      ),
    };
  });

  const daysRemaining = challenge.daysLeft || getTimeRemaining(challenge.startDate, challenge.duration);
  const progressPercent = challenge.goal > 0 &&
    Number.isFinite(challenge.currentProgress) &&
    Number.isFinite(challenge.goal)
      ? Math.min(1, challenge.currentProgress / challenge.goal)
      : 0;

  // Card background based on type
  const cardGradient: [string, string] = challenge.type === 'savings' 
    ? ['#0A5687', '#0E7490']
    : ['#0F766E', '#0E7490'];
    
  const typeIcon = challenge.type === 'savings' 
    ? 'piggy-bank' 
    : 'chart-line';
    
  const typeLabel = challenge.type === 'savings' 
    ? 'Savings' 
    : 'Investment';

  return (
    <Animated.View style={[cardStyle, styles.cardContainer]}>
      <TouchableOpacity 
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onToggleExpand}
      >
        <LinearGradient
          colors={challenge.isCompleted ? ['#047857', '#10B981'] : cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.challengeCard,
            challenge.isNudged && styles.nudgedCard
          ]}
        >
          {/* Nudge Alert if needed */}
          {challenge.isNudged && (
            <View style={styles.nudgeAlert}>
              <PulseEffect color={financeTheme.warning.DEFAULT} />
              <AntDesign name="clockcircle" size={14} color={financeTheme.warning.dark} />
              <Text style={styles.nudgeText}>Action needed</Text>
            </View>
          )}
          
          <View style={styles.cardContent}>
            <View style={styles.cardMainContent}>
              <View style={styles.cardHeader}>
                <View style={styles.typeContainer}>
                  <FontAwesome5 
                    name={typeIcon} 
                    size={16} 
                    color={challenge.type === 'savings' ? financeTheme.info.DEFAULT : financeTheme.neutral[200]} 
                    style={styles.typeIcon}
                  />
                  <Badge 
                    type={challenge.type === 'savings' ? 'info' : 'neutral'} 
                    text={typeLabel} 
                  />
                </View>
                
                {challenge.isCompleted ? (
                  <View style={styles.completedBadge}>
                    <MaterialIcons name="emoji-events" size={16} color={financeTheme.success.light} />
                    <Text style={styles.completedText}>Completed</Text>
                  </View>
                ) : (
                  <View style={styles.daysLeftBadge}>
                    <AntDesign name="calendar" size={14} color="white" />
                    <Text style={styles.daysLeftText}>{daysRemaining} days left</Text>
                  </View>
                )}
              </View>
              
              <Text style={styles.cardTitle}>{challenge.title}</Text>
              <Text style={styles.cardDescription}>{challenge.description}</Text>
              
              {/* Progress Section */}
              <View style={styles.progressSection}>
                <View style={styles.progressStats}>
                  <Text style={styles.progressText}>Progress</Text>
                  <Text style={styles.progressAmount}>
                    {formatCurrency(challenge.currentProgress)} / {formatCurrency(challenge.goal)}
                  </Text>
                  
                  {/* Progress Bar */}
                  <View style={styles.progressBarContainer}>
                    <Animated.View style={[styles.progressBar, progressStyle]} />
                    
                    {/* Milestone Markers */}
                    <View style={[styles.milestone, { left: '25%' }]} />
                    <View style={[styles.milestone, { left: '50%' }]} />
                    <View style={[styles.milestone, { left: '75%' }]} />
                  </View>
                </View>
                
                {/* Circular Progress */}
                <ProgressRing 
                  progress={progressPercent}
                  isCompleted={challenge.isCompleted}
                />
              </View>
            </View>
            
            {/* Expanded Details */}
            {isExpanded && (
              <View style={styles.expandedDetails}>
                <View style={styles.separator} />
                
                <View style={styles.detailsGrid}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Commitment</Text>
                    <Text style={styles.detailValue}>{challenge.commitment ?? "-"}</Text>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Timeline</Text>
                    <Text style={styles.detailValue}>{challenge.duration} days total</Text>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Started</Text>
                    <Text style={styles.detailValue}>{formatDate(challenge.startDate)}</Text>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Last Update</Text>
                    <Text style={styles.detailValue}>{formatDate(challenge.lastUpdated)}</Text>
                  </View>
                </View>
                
                {/* Action Button (if not completed) */}
                {!challenge.isCompleted && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => onUpdateProgress(challenge.id)}
                  >
                    <Text style={styles.actionButtonText}>Update Progress</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#064e3b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  challengeCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  nudgedCard: {
    borderWidth: 2,
    borderColor: financeTheme.warning.DEFAULT,
  },
  pulseContainer: {
    position: 'absolute',
    width: 14,
    height: 14,
    left: 12,
    top: '50%',
    marginTop: -7,
  },
  pulseCircle: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 10,
    top: 0,
    left: 0,
  },
  nudgeAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(254, 243, 199, 0.95)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    gap: 8,
  },
  nudgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: financeTheme.warning.dark,
  },
  cardContent: {
    padding: 20,
  },
  cardMainContent: {
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeIcon: {
    marginRight: -4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 6,
    lineHeight: 20,
  },
  progressSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  progressStats: {
    flex: 1,
    marginRight: 10,
  },
  progressText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  progressAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginTop: 4,
    marginBottom: 6,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  milestone: {
    position: 'absolute',
    width: 2,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    top: 0,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(4, 120, 87, 0.7)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 6,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  daysLeftBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 6,
  },
  daysLeftText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  expandedDetails: {
    marginTop: 24,
    gap: 16,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  detailItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default ChallengeCard;