import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import colors from '../theme/color';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';
import Confetti from 'react-native-confetti';

// You may need to install: 
// npm install react-native-reanimated react-native-confetti @expo/vector-icons

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

const ChallengeDashboardScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  let confettiRef = useRef<any>(null);

  // Mock data - this would come from your API
  useEffect(() => {
    // Simulating API call
    setTimeout(() => {
      setChallenges([
        {
          id: '1',
          title: 'Save for Coffee Break',
          description: 'Skip a daily coffee and save that money in DigiSave',
          type: 'savings',
          goal: 20,
          currentProgress: 10,
          duration: 7,
          startDate: '2025-03-22',
          lastUpdated: '2025-03-27',
          isCompleted: false,
          isNudged: true,
          commitment: 'Daily',
        },
        {
          id: '2',
          title: 'Try Eurobond Mini',
          description: 'Invest a small amount in Eurobond to see how it grows',
          type: 'investment',
          goal: 50,
          currentProgress: 50,
          duration: 14,
          startDate: '2025-03-15',
          lastUpdated: '2025-03-28',
          isCompleted: true,
          isNudged: false,
          commitment: 'Weekly',
        },
        {
          id: '3',
          title: 'Phone Fund Starter',
          description: 'Start saving towards your new phone goal',
          type: 'savings',
          goal: 100,
          currentProgress: 25,
          duration: 30,
          startDate: '2025-03-20',
          lastUpdated: '2025-03-26',
          isCompleted: false,
          isNudged: false,
          commitment: 'Weekly',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const updateChallengeProgress = (id: string) => {
    // This would be a POST request to your API
    setChallenges(prevChallenges => 
      prevChallenges.map(challenge => {
        if (challenge.id === id) {
          const newProgress = Math.min(challenge.currentProgress + 5, challenge.goal);
          const isNewlyCompleted = newProgress === challenge.goal && challenge.currentProgress !== challenge.goal;
          
          if (isNewlyCompleted) {
            setShowConfetti(true);
            if (confettiRef.current) {
              confettiRef.current.startConfetti();
              setTimeout(() => {
                confettiRef.current.stopConfetti();
                setShowConfetti(false);
              }, 3000);
            }
          }
          
          return {
            ...challenge,
            currentProgress: newProgress,
            lastUpdated: new Date().toISOString().split('T')[0],
            isCompleted: newProgress === challenge.goal,
            isNudged: false,
          };
        }
        return challenge;
      })
    );
  };

  const getProgressPercentage = (current: number, goal: number) => {
    return (current / goal) * 100;
  };

  const getTimeRemaining = (startDateStr: string, durationDays: number) => {
    const startDate = new Date(startDateStr);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + durationDays);
    
    const today = new Date();
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    
    return daysRemaining;
  };

  const getChallengeIcon = (type: 'savings' | 'investment') => {
    return type === 'savings' 
      ? <FontAwesome5 name="piggy-bank" size={24} color={colors.emerald.DEFAULT} />
      : <FontAwesome5 name="chart-line" size={24} color={colors.emerald.DEFAULT} />;
  };

  const renderChallengeCard = (challenge: Challenge) => {
    const progressValue = useSharedValue(0);
    const isExpanded = expandedCard === challenge.id;
    
    useEffect(() => {
      progressValue.value = withTiming(
        getProgressPercentage(challenge.currentProgress, challenge.goal) / 100,
        { duration: 1000, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }
      );
    }, [challenge.currentProgress]);

    const progressStyle = useAnimatedStyle(() => {
      return {
        width: `${progressValue.value * 100}%`,
        backgroundColor: challenge.isCompleted 
          ? colors.emerald.DEFAULT
          : `rgba(80, 200, 120, ${0.5 + progressValue.value * 0.5})`,
      };
    });

    const daysRemaining = getTimeRemaining(challenge.startDate, challenge.duration);

    return (
      <TouchableOpacity 
        key={challenge.id}
        style={[
          styles.challengeCard, 
          challenge.isCompleted ? styles.completedCard : null,
          challenge.isNudged ? styles.nudgedCard : null
        ]}
        onPress={() => setExpandedCard(isExpanded ? null : challenge.id)}
        activeOpacity={0.8}
      >
        {/* Nudge Alert if needed */}
        {challenge.isNudged && (
          <View style={styles.nudgeAlert}>
            <Text style={styles.nudgeText}>Hey, keep going!</Text>
          </View>
        )}
        
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            {getChallengeIcon(challenge.type)}
            <Text style={styles.cardTitle}>{challenge.title}</Text>
          </View>
          {challenge.isCompleted && (
            <View style={styles.completedBadge}>
              <MaterialIcons name="emoji-events" size={24} color={colors.emerald.DEFAULT} />
            </View>
          )}
        </View>
        
        <Text style={styles.cardDescription}>{challenge.description}</Text>
        
        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[styles.progressBar, progressStyle]}
          />
        </View>
        
        <View style={styles.progressStats}>
          <Text style={styles.progressText}>
            {challenge.currentProgress} / {challenge.goal} GHS
          </Text>
          <Text style={styles.progressText}>
            {getProgressPercentage(challenge.currentProgress, challenge.goal).toFixed(0)}%
          </Text>
        </View>
        
        {/* Expanded Details */}
        {isExpanded && (
          <View style={styles.expandedDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Type:</Text>
              <Text style={styles.detailValue}>{challenge.type}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Commitment:</Text>
              <Text style={styles.detailValue}>{challenge.commitment}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Days Remaining:</Text>
              <Text style={styles.detailValue}>{daysRemaining} days</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Last Updated:</Text>
              <Text style={styles.detailValue}>{challenge.lastUpdated}</Text>
            </View>
          </View>
        )}
        
        {/* Action Button (if not completed) */}
        {!challenge.isCompleted && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => updateChallengeProgress(challenge.id)}
          >
            <Text style={styles.actionButtonText}>Mark Progress</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Confetti component */}
      {showConfetti && <Confetti ref={confettiRef} />}
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Challenges</Text>
        <Text style={styles.headerSubtitle}>Track your financial growth journey</Text>
      </View>
      
      {/* Content */}
      <ScrollView style={styles.scrollContent}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.emerald.DEFAULT} />
            <Text style={styles.loadingText}>Loading your challenges...</Text>
          </View>
        ) : challenges.length > 0 ? (
          <>
            {/* Stats Section */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Active</Text>
                <Text style={styles.statValue}>
                  {challenges.filter(c => !c.isCompleted).length}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Completed</Text>
                <Text style={styles.statValue}>
                  {challenges.filter(c => c.isCompleted).length}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total Saved</Text>
                <Text style={styles.statValue}>
                  {challenges.reduce((sum, c) => sum + c.currentProgress, 0)} GHS
                </Text>
              </View>
            </View>
            
            {/* Challenge Cards */}
            {challenges.map(renderChallengeCard)}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="tasks" size={50} color={colors.gray.DEFAULT} />
            <Text style={styles.emptyTitle}>No challenges yet</Text>
            <Text style={styles.emptyText}>
              Start your financial journey by creating your first challenge!
            </Text>
          </View>
        )}
      </ScrollView>
      
      {/* New Challenge Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.newChallengeButton}
          onPress={() => navigation.navigate('ChallengeSetup' as never)}
        >
          <MaterialIcons name="add-circle-outline" size={24} color="white" />
          <Text style={styles.newChallengeText}>Create New Challenge</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray.light
  },
  header: {
    backgroundColor: colors.emerald.DEFAULT,
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: colors.white,
    fontSize: 14,
    opacity: 0.8
  },
  scrollContent: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  loadingText: {
    marginTop: 8,
    color: colors.gray.DEFAULT,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2.22,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray.light,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.emerald.DEFAULT,
  },
  challengeCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  completedCard: {
    borderWidth: 2,
    borderColor: colors.emerald.light,
  },
  nudgedCard: {
    borderWidth: 2,
    borderColor: colors.yellow.light,
  },
  nudgeAlert: {
    backgroundColor: colors.yellow.light,
    position: 'absolute',
    top: -12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  nudgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.black,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gray.dark,
  },
  completedBadge: {
    backgroundColor: colors.emerald.light,
    padding: 4,
    borderRadius: 20,
  },
  cardDescription: {
    fontSize: 14,
    color: colors.gray.dark,
    marginTop: 4,
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 16,
    backgroundColor: colors.gray.light,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 20,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray.dark,
  },
  expandedDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray.light,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.gray.dark,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray.dark,
    textTransform: 'capitalize',
  },
  actionButton: {
    backgroundColor: colors.emerald.DEFAULT,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: 'flex-end',
  },
  actionButtonText: {
    color: colors.white,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '500',
    color: colors.gray.dark,
  },
  emptyText: {
    color: colors.gray.light,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  buttonContainer: {
    padding: 16,
  },
  newChallengeButton: {
    backgroundColor: colors.emerald.DEFAULT,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  newChallengeText: {
    color: colors.white,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default ChallengeDashboardScreen;