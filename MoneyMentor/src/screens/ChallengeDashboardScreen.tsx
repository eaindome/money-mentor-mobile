import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  ImageBackground
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import colors from '../theme/color';
import { FontAwesome5, MaterialIcons, Ionicons, AntDesign } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing,
  interpolateColor
} from 'react-native-reanimated';
import Confetti from 'react-native-confetti';
import { LinearGradient } from 'expo-linear-gradient';

// Enhanced Theme
const financeTheme = {
  ...colors,
  primary: {
    light: "#50C878", // Achieve's emerald-light shade
    DEFAULT: "#008000", // Achieve's main emerald
    dark: "#006400",
  },
  secondary: {
    DEFAULT: '#14B8A6', // Teal accent for secondary actions
    light: '#CCFBF1',
    dark: '#0F766E',
  },
  success: {
    DEFAULT: '#10B981', // Green for success states
    light: '#D1FAE5',
    dark: '#047857',
  },
  warning: {
    DEFAULT: '#F59E0B', // Amber for warnings/nudges
    light: '#FEF3C7',
    dark: '#B45309',
  },
  info: {
    DEFAULT: '#3B82F6', // Blue for information
    light: '#DBEAFE',
    dark: '#1D4ED8',
  },
  accent: {
    DEFAULT: '#8B5CF6', // Purple for accent elements
    light: '#EDE9FE',
    dark: '#6D28D9',
  },
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  }
};

// Types
type Challenge = {
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
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ChallengeDashboard'>;

// Progress Ring Component
const ProgressRing = ({ 
  progress, 
  size = 60,
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
            {(progress * 100).toFixed(0)}%
          </Text>
        )}
      </View>
    </View>
  );
};

// Badge Component
const Badge = ({ type, text }: { type: 'success' | 'warning' | 'info' | 'neutral'; text: string }) => {
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
    <View style={[
      styles.badge,
      { backgroundColor: colors[type].bg }
    ]}>
      <Text style={[
        styles.badgeText,
        { color: colors[type].text }
      ]}>
        {text}
      </Text>
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
  const cardOpacity = useSharedValue(1);
  
  useEffect(() => {
    progressValue.value = withTiming(
      challenge.currentProgress / challenge.goal,
      { duration: 1200, easing: Easing.bezierFn(0.16, 1, 0.3, 1) }
    );
  }, [challenge.currentProgress]);

  const handlePressIn = () => {
    cardScale.value = withTiming(0.98, { duration: 200 });
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

  const daysRemaining = getTimeRemaining(challenge.startDate, challenge.duration);
  const progressPercent = challenge.goal > 0 &&
  Number.isFinite(challenge.currentProgress) &&
  Number.isFinite(challenge.goal)
    ? getProgressPercentage(challenge.currentProgress, challenge.goal) / 100
    : 0;

  // Card background based on type
  const cardGradient = challenge.type === 'savings' 
    ? ['#0A5687', '#0E7490']
    : ['#0F766E', '#0E7490'];
    
  const typeIcon = challenge.type === 'savings' 
    ? 'piggy-bank' 
    : 'chart-pie';
    
  const typeLabel = challenge.type === 'savings' 
    ? 'Savings' 
    : 'Investment';

  return (
    <Animated.View style={[cardStyle]}>
      <TouchableOpacity 
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onToggleExpand}
      >
        <LinearGradient
          colors={challenge.isCompleted ? ['#047857', '#10B981'] as [string, string] : cardGradient as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.challengeCard,
            challenge.isNudged ? styles.nudgedCard : null
          ]}
        >
          {/* Nudge Alert if needed */}
          {challenge.isNudged && (
            <View style={styles.nudgeAlert}>
              <AntDesign name="clockcircle" size={14} color={financeTheme.warning.dark} />
              <Text style={styles.nudgeText}>Action needed</Text>
            </View>
          )}
          
          <View style={styles.cardContent}>
            <View style={styles.cardMainContent}>
              <View style={styles.cardHeader}>
                <Badge 
                  type={challenge.type === 'savings' ? 'info' : 'neutral'} 
                  text={typeLabel} 
                />
                
                {challenge.isCompleted && (
                  <View style={styles.completedBadge}>
                    <MaterialIcons name="emoji-events" size={16} color={financeTheme.success.light} />
                    <Text style={styles.completedText}>Completed</Text>
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
                    {challenge.currentProgress ?? 0} / GH₵ {challenge.goal}
                  </Text>
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
                    <Text style={styles.detailValue}>{daysRemaining} days left</Text>
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

// Stats Card Component
const StatsCard = ({ stats }: { 
  stats: { 
    active: number; 
    completed: number; 
    totalSaved: number;
    projected: number;
  } 
}) => {
  return (
    <View style={styles.statsContainer}>
      <View style={styles.statsHeader}>
        <Text style={styles.statsTitle}>Financial Summary</Text>
      </View>
      
      <View style={styles.statsContent}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.active}</Text>
            <Text style={styles.statLabel}>Active Challenges</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Completed Challenges</Text>
          </View>
        </View>
        
        <View style={styles.statsDivider} />
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>GH₵ {Number.isNaN(stats.totalSaved) ? 0 : stats.totalSaved}</Text>
            <Text style={styles.statLabel}>Total Saved</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}> GH₵ {Number.isNaN(stats.projected) ? 0 : stats.projected}</Text>
            <Text style={styles.statLabel}>Projected Savings</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// Filter Component
const ChallengeFilters = ({ 
  activeFilter, 
  onFilterChange 
}: { 
  activeFilter: 'all' | 'active' | 'completed'; 
  onFilterChange: (filter: 'all' | 'active' | 'completed') => void;
}) => {
  return (
    <View style={styles.filtersContainer}>
      <TouchableOpacity 
        style={[styles.filterButton, activeFilter === 'all' ? styles.activeFilterButton : null]}
        onPress={() => onFilterChange('all')}
      >
        <Text style={[
          styles.filterText, 
          activeFilter === 'all' ? styles.activeFilterText : null
        ]}>
          All
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.filterButton, activeFilter === 'active' ? styles.activeFilterButton : null]}
        onPress={() => onFilterChange('active')}
      >
        <Text style={[
          styles.filterText, 
          activeFilter === 'active' ? styles.activeFilterText : null
        ]}>
          Active
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.filterButton, activeFilter === 'completed' ? styles.activeFilterButton : null]}
        onPress={() => onFilterChange('completed')}
      >
        <Text style={[
          styles.filterText, 
          activeFilter === 'completed' ? styles.activeFilterText : null
        ]}>
          Completed
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// Utility functions 
const getProgressPercentage = (current: number, goal: number) => {
  return (current / goal) * 100;
};

const getTimeRemaining = (startDateStr: string, durationDays: number) => {
    const startDate = new Date(startDateStr);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + durationDays);
    const today = new Date();
    return Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  };

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? "-" : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatCurrency = (value: number) => {
  if (isNaN(value)) {
    return "GH₵ 0";
  }
  return value.toLocaleString('en-GH', {
    style: 'currency',
    currency: 'GH₵',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

// Import Svg components for the ProgressRing
import Svg, { Circle } from 'react-native-svg';
import { AnimatedProps } from 'react-native-reanimated';
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Main component
const ChallengeDashboardScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiRef = useRef<any>(null);
  
  const { width } = Dimensions.get('window');
  const headerOpacity = useSharedValue(0);
  
  // Animated header effect
  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 800 });
  }, []);
  
  const headerStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
    };
  });

  // Mock data - this would come from your API
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const res = await axios.get('https://347e-102-208-89-6.ngrok-free.app/challenges/');
        const mappedChallenges = res.data.map((c: any) => ({
          id: c.id.toString(),
          title: c.generated_challenge.match(/\*\*Challenge Title:\*\* (.*)/)?.[1] || 'Untitled',
          description: c.generated_challenge.match(/\*\*Daily\/Weekly Task:\*\* (.*)/)?.[1] || '',
          type: c.challenge_type.toLowerCase().includes('savings') ? 'savings' : 'investment',
          goal: typeof c.financial_goal === 'string' ? Number(c.financial_goal.match(/(\d+)/)?.[1]) || 100 : c.financial_goal || 100,
          currentProgress: c.progress,
          duration: c.challenge_duration,
          startDate: c.created_at || new Date().toISOString().split('T')[0],
          lastUpdated: c.last_updated || c.created_at,
          isCompleted: c.status === 'completed',
          isNudged: c.nudged || false,
          commitment: c.commitment_level,
        }));
        setChallenges(mappedChallenges);
      } catch (error) {
        console.error('Failed to fetch challenges:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenges();
  }, []);

  const updateChallengeProgress = async (id: string) => {
    try {
      const res = await axios.post(`http://localhost:8000/challenges/update-progress/${id}`);
      setChallenges(prev =>
        prev.map(c =>
          c.id === id
            ? {
                ...c,
                currentProgress: Number(res.data.progress),
                isCompleted: res.data.status === 'completed',
                lastUpdated: new Date().toISOString().split('T')[0],
                isNudged: false,
              }
            : c
        )
      );
      if (res.data.status === 'completed') {
        setShowConfetti(true);
        confettiRef.current?.startConfetti();
        setTimeout(() => confettiRef.current?.stopConfetti(), 3000);
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  // Filter challenges based on active filter
  const filteredChallenges = challenges.filter(challenge => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'active') return !challenge.isCompleted;
    if (activeFilter === 'completed') return challenge.isCompleted;
    return true;
  });
  
  // Calculate stats
  const totalSaved = challenges.reduce((sum, c) => sum + c.currentProgress, 0);
  const totalGoal = challenges.reduce((sum, c) => sum + c.goal, 0);
  
  const stats = {
    active: challenges.filter(c => !c.isCompleted).length,
    completed: challenges.filter(c => c.isCompleted).length,
    totalSaved: totalSaved,
    projected: totalGoal
  };

  return (
    <View style={styles.container}>
      {/* Confetti component */}
      {showConfetti && <Confetti ref={confettiRef} />}
      
      {/* Modern Finance-inspired Header */}
      <LinearGradient
        colors={[financeTheme.primary.dark, financeTheme.primary.DEFAULT]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Animated.View style={[headerStyle, { width: '100%' }]}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Micro Challenges</Text>
            <TouchableOpacity style={styles.profileButton}>
              <MaterialIcons name="account-circle" size={32} color={financeTheme.primary.light} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.headerContent}>
            <View style={styles.headerStat}>
              <Text style={styles.headerStatLabel}>Current Savings</Text>
              <Text style={styles.headerStatValue}>{formatCurrency(totalSaved)}</Text>
            </View>
            
            <View style={styles.headerGraph}>
              <LinearGradient
                colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)']}
                style={styles.headerGraphBg}
              >
                <Text style={styles.headerGraphLabel}>Goal Progress</Text>
                <Text style={styles.headerGraphValue}>
                  {
                    (totalGoal > 0 && Number.isFinite(totalSaved) && Number.isFinite(totalGoal))
                      ? Math.round((totalSaved / totalGoal) * 100)
                      : 0
                  }%                </Text>
              </LinearGradient>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>
      
      {/* Content */}
      <ScrollView 
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={financeTheme.primary.DEFAULT} />
            <Text style={styles.loadingText}>Loading your challenges...</Text>
          </View>
        ) : challenges.length > 0 ? (
          <>
            {/* Stats Overview */}
            <StatsCard stats={stats} />
            
            {/* Challenge Filters */}
            <ChallengeFilters 
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />
            
            {/* Challenge Cards */}
            <View style={styles.challengesList}>
              {filteredChallenges.length > 0 ? (
                filteredChallenges.map(challenge => (
                  <ChallengeCard 
                    key={challenge.id}
                    challenge={challenge}
                    isExpanded={expandedCard === challenge.id}
                    onToggleExpand={() => setExpandedCard(
                      expandedCard === challenge.id ? null : challenge.id
                    )}
                    onUpdateProgress={updateChallengeProgress}
                  />
                ))
              ) : (
                <View style={styles.emptyFilterContainer}>
                  <AntDesign name="infocirlceo" size={40} color={financeTheme.neutral[400]} />
                  <Text style={styles.emptyFilterTitle}>No {activeFilter} challenges</Text>
                  <Text style={styles.emptyFilterText}>
                    {activeFilter === 'active' 
                      ? "You've completed all your challenges! Create a new one."
                      : "You haven't completed any challenges yet."}
                  </Text>
                </View>
              )}
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="piggy-bank" size={60} color={financeTheme.neutral[300]} />
            <Text style={styles.emptyTitle}>No {activeFilter} challenges yet</Text>
            <Text style={styles.emptyText}>
              Start your financial journey by creating your first challenge!
            </Text>
          </View>
        )}
      </ScrollView>
      
      {/* New Challenge Button - Modern Floating Action Button */}
      <View style={styles.fabContainer}>
        <TouchableOpacity 
          style={styles.newChallengeButton}
          onPress={() => navigation.navigate('ChallengeSetup' as never)}
        >
          <LinearGradient
            colors={[financeTheme.secondary.DEFAULT, financeTheme.secondary.dark]}
            style={styles.fabGradient}
          >
            <AntDesign name="plus" size={26} color="white" />
          </LinearGradient>
        </TouchableOpacity>
        
        <Text style={styles.fabLabel}>New Challenge</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f5f9f7', // Light green tint for background
    },
    header: {
      paddingTop: 50,
      paddingBottom: 20,
      paddingHorizontal: 20,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'white',
    },
    profileButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerStat: {
      flex: 1,
    },
    headerStatLabel: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.8)',
      marginBottom: 4,
    },
    headerStatValue: {
      fontSize: 28,
      fontWeight: 'bold',
      color: 'white',
    },
    headerGraph: {
      width: 100,
      alignItems: 'center',
    },
    headerGraphBg: {
      borderRadius: 15,
      padding: 12,
      alignItems: 'center',
      width: '100%',
    },
    headerGraphLabel: {
      fontSize: 12,
      color: 'rgba(255, 255, 255, 0.8)',
      marginBottom: 4,
    },
    headerGraphValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: 'white',
    },
    scrollContent: {
      flex: 1,
    },
    scrollContentContainer: {
      paddingHorizontal: 20,
      paddingBottom: 100,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 40,
    },
    loadingText: {
      marginTop: 12,
      fontSize: 16,
      color: '#047857', // Emerald green for text
    },
    statsContainer: {
      backgroundColor: 'white',
      borderRadius: 16,
      marginTop: 20,
      marginBottom: 20,
      shadowColor: '#047857',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
      overflow: 'hidden',
    },
    statsHeader: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#f1f5f9',
    },
    statsTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#047857', // Emerald green for title
    },
    statsContent: {
      padding: 16,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
      padding: 12,
    },
    statValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#064e3b', // Dark emerald for values
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: '#6b7280',
    },
    statDivider: {
      width: 1,
      backgroundColor: '#e2e8f0',
    },
    statsDivider: {
      height: 1,
      backgroundColor: '#e2e8f0',
      marginVertical: 12,
    },
    filtersContainer: {
      flexDirection: 'row',
      marginBottom: 16,
      backgroundColor: 'white',
      borderRadius: 12,
      padding: 4,
      shadowColor: '#047857',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    filterButton: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderRadius: 8,
    },
    activeFilterButton: {
      backgroundColor: '#10b981', // Medium emerald for active filter
    },
    filterText: {
      fontSize: 14,
      fontWeight: '500',
      color: '#6b7280',
    },
    activeFilterText: {
      color: 'white',
    },
    challengesList: {
      gap: 16,
    },
    challengeCard: {
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 16,
      shadowColor: '#064e3b',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 5,
    },
    nudgedCard: {
      borderWidth: 2,
      borderColor: '#f59e0b',
    },
    nudgeAlert: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(254, 243, 199, 0.9)',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      gap: 6,
    },
    nudgeText: {
      fontSize: 12,
      fontWeight: '500',
      color: '#b45309',
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
    cardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: 'white',
    },
    cardDescription: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.8)',
      marginBottom: 6,
    },
    progressSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 10,
    },
    progressStats: {
      flex: 1,
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
    },
    completedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(4, 120, 87, 0.7)', // Emerald green with opacity
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
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      alignSelf: 'flex-start',
    },
    badgeText: {
      fontSize: 12,
      fontWeight: '500',
    },
    expandedDetails: {
      marginTop: 20,
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
      fontSize: 12,
      color: 'rgba(255, 255, 255, 0.7)',
      marginBottom: 4,
    },
    detailValue: {
      fontSize: 16,
      fontWeight: '500',
      color: 'white',
    },
    actionButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
      marginTop: 8,
    },
    actionButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: 'white',
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
      paddingHorizontal: 20,
    },
    emptyFilterContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
      paddingHorizontal: 20,
      backgroundColor: 'white',
      borderRadius: 16,
      shadowColor: '#047857',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#047857', // Emerald green for title
      marginTop: 16,
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 16,
      color: '#6b7280',
      textAlign: 'center',
    },
    emptyFilterTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#047857', // Emerald green for title
      marginTop: 16,
      marginBottom: 8,
    },
    emptyFilterText: {
      fontSize: 14,
      color: '#6b7280',
      textAlign: 'center',
    },
    fabContainer: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      alignItems: 'center',
    },
    newChallengeButton: {
      borderRadius: 28,
      overflow: 'hidden',
      shadowColor: '#064e3b',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    fabGradient: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
    },
    fabLabel: {
      fontSize: 12,
      fontWeight: '500',
      color: '#047857', // Emerald green for text
      marginTop: 6,
    }
  });
  
 export default ChallengeDashboardScreen;
import { useAnimatedProps } from 'react-native-reanimated';
  