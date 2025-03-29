// src/screens/ChallengeSetupScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Animated, 
  Dimensions,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import Container from '../components/layout/Container';
import Button from '../components/ui/Button';
import colors from '../theme/color';

// Components we'll need to create
import StepIndicator from '../components/ui/StepIndicator';
import FormDropdown from '../components/form/FormDropdown';
import FormSlider from '../components/form/FormSlider';
import QuestCard from '../components/cards/QuestCard';
import ProgressBadge from '../components/ui/ProgressBadge';
import Tip from '../components/ui/Tips';

type RootStackParamList = {
  Home: undefined;
  ChallengeDashboard: undefined;
  ChallengeSetup: undefined;
};

type ChallengeSetupScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ChallengeSetup'
>;

type ChallengeFormData = {
  employmentType: string;
  financialGoal: string;
  investmentPreference: string;
  savingsRate: number;
  spendingBehavior: string;
  debtSituation: string;
  challengeDuration: string;
  challengeType: string;
  commitmentLevel: number;
  financialFear: string;
};

// Form options
const EMPLOYMENT_TYPES = ['Full-Time', 'Part-Time', 'Student', 'Self-Employed', 'Unemployed'];
const FINANCIAL_GOALS = ['Save GHS 500', 'Build Emergency Fund', 'Save for a Trip', 'Start Investing', 'Pay off Debt'];
const INVESTMENT_PREFERENCES = ['Safe', 'Balanced', 'Aggressive'];
const SPENDING_BEHAVIORS = ['Frugal', 'Moderate', 'Big Spender'];
const DEBT_SITUATIONS = ['None', 'Some', 'Lots'];
const CHALLENGE_DURATIONS = ['7 days', '14 days', '30 days', '60 days', '90 days'];
const CHALLENGE_TYPES = ['Savings', 'Investment', 'Expense Tracking', 'Debt Reduction'];
const FINANCIAL_FEARS = ['Losing Money', 'Not Enough Savings', 'Market Volatility', 'Getting into Debt'];

// Step titles and subtitles
const STEPS = [
  { title: "Hero Profile", subtitle: "Who are you as a financial hero?" },
  { title: "Your Quest", subtitle: "Choose your challenge path" },
  { title: "Power Level", subtitle: "How far will you go?" },
  { title: "Ready!", subtitle: "Review and embark" }
];

const ChallengeSetupScreen = () => {
  const navigation = useNavigation<ChallengeSetupScreenNavigationProp>();
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  
  // Initialize form state
  const [formData, setFormData] = useState<ChallengeFormData>({
    employmentType: '',
    financialGoal: '',
    investmentPreference: '',
    savingsRate: 15,
    spendingBehavior: '',
    debtSituation: '',
    challengeDuration: '',
    challengeType: '',
    commitmentLevel: 1,
    financialFear: '',
  });

  // Progress tracking
  const progress = (currentStep + 1) / 4; // 0 -> 0.25, 1 -> 0.5, 2 -> 0.75, 3 -> 1.0
  
  useEffect(() => {
    console.log('Current Step:', currentStep);
    console.log('Progress:', (progress * 100).toFixed(0) + '%');
  }, [currentStep]);

  // Animations for step transitions
  const transitionToNextStep = () => {
    // Bounce animation for button
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
    
    // Fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setCurrentStep(prev => Math.min(prev + 1, 3));
      // Reset slide position
      slideAnim.setValue(30);
      // Fade in with slide
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    });
  };

  const transitionToPrevStep = () => {
    // Fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setCurrentStep(prev => Math.max(prev - 1, 0));
      // Reset slide position for previous step (from opposite direction)
      slideAnim.setValue(-30);
      // Fade in with slide
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    });
  };

  // Handle form updates
  const updateFormData = (field: keyof ChallengeFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Calculate estimated savings based on form data
  const calculateEstimatedSavings = (): string => {
    // Simple calculation for demo purposes
    const savingsPercent = formData.savingsRate / 100;
    const baseAmount = 1000; // Assume GHS 1000 monthly income
    const monthlyAmount = baseAmount * savingsPercent;
    
    // Get duration in days
    const durationMap: { [key: string]: number } = {
      '7 days': 7,
      '14 days': 14,
      '30 days': 30,
      '60 days': 60,
      '90 days': 90
    };
    
    const days = durationMap[formData.challengeDuration] || 30;
    const totalAmount = (monthlyAmount * days) / 30;
    
    return `GHS ${totalAmount.toFixed(0)}`;
  };
  
  // Handle challenge creation
  const createChallenge = () => {
    console.log('Challenge created:', formData);
    // Vibrant animation for submit
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 1.05,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start(() => {
      // TODO: POST to /challenges/ endpoint
      
      // Navigate to dashboard
      // navigation.navigate('ChallengeDashboard');
      navigation.navigate('Home'); // For now
    });
  };

  // Get the icon for each step
  const getStepIcon = (step: number): string => {
    switch(step) {
      case 0: return 'account-outline';
      case 1: return 'map-marker-path';
      case 2: return 'lightning-bolt';
      case 3: return 'flag-checkered';
      default: return 'checkbox-marked-circle-outline';
    }
  };

  // Render step content based on current step
  const renderStepContent = () => {
    switch(currentStep) {
      case 0: // Hero Profile
        return (
          <Animated.View
          >
            <QuestCard title="Build Your Hero Profile" icon="account-outline">
              <Text style={styles.stepDescription}>
                Tell us about yourself, so we can craft the perfect challenge for you.
              </Text>
              
              <FormDropdown
                label="What's your employment status?"
                placeholder="Select employment type"
                options={EMPLOYMENT_TYPES}
                value={formData.employmentType}
                onSelect={(value) => updateFormData('employmentType', value)}
              />
              {formData.employmentType && (
                <Tip
                  text={`Your ${formData.employmentType.toLowerCase()} status helps us match challenges to your income pattern.`}
                />
              )}
              <FormDropdown
                label="How would you describe your spending?"
                placeholder="Select spending behavior"
                options={SPENDING_BEHAVIORS}
                value={formData.spendingBehavior}
                onSelect={(value) => updateFormData('spendingBehavior', value)}
              />
              
              <FormDropdown
                label="What's your debt situation?"
                placeholder="Select debt situation"
                options={DEBT_SITUATIONS}
                value={formData.debtSituation}
                onSelect={(value) => updateFormData('debtSituation', value)}
              />

              <FormDropdown
                label="How do you prefer to invest?"
                placeholder="Select investment preference"
                options={INVESTMENT_PREFERENCES}
                value={formData.investmentPreference}
                onSelect={(value) => {
                  updateFormData('investmentPreference', value);
                }}
              />
              
              {formData.investmentPreference === 'Balanced' && (
                <Tip
                  text="Great choice! Balanced investors have succeeded 85% of the time!"
                  type="success"
                />
              )}
            </QuestCard>
          </Animated.View>
        );
        
      case 1: // Your Quest
        return (
          <Animated.View
          >
            <QuestCard title="Choose Your Quest" icon="map-marker-path">
              <Text style={styles.stepDescription}>
                Select the challenge that fits your financial journey.
              </Text>
              
              <FormDropdown
                label="What's your financial goal?"
                placeholder="Select financial goal"
                options={FINANCIAL_GOALS}
                value={formData.financialGoal}
                onSelect={(value) => updateFormData('financialGoal', value)}
              />
              
              {formData.financialGoal && (
                <View style={styles.goalCard}>
                  <MaterialCommunityIcons name="target" size={20} color={colors.emerald.DEFAULT} />
                  <Text style={styles.goalText}>
                    {formData.financialGoal === 'Save GHS 500' ? "You're 10% there already!" : 
                     formData.financialGoal === 'Build Emergency Fund' ? "65% of heroes succeed!" :
                     formData.financialGoal === 'Start Investing' ? "A wise long-term choice!" :
                     "Great goal! Let's make it happen!"}
                  </Text>
                </View>
              )}
              
              <FormDropdown
                label="What type of challenge interests you?"
                placeholder="Select challenge type"
                options={CHALLENGE_TYPES}
                value={formData.challengeType}
                onSelect={(value) => updateFormData('challengeType', value)}
              />
              
              <FormDropdown
                label="How long do you want your challenge to be?"
                placeholder="Select challenge duration"
                options={CHALLENGE_DURATIONS}
                value={formData.challengeDuration}
                onSelect={(value) => updateFormData('challengeDuration', value)}
              />
              
              {formData.challengeDuration && (
                <Tip
                  text={formData.challengeDuration === '7 days' ? "Quick win! Perfect for beginners." :
                        formData.challengeDuration === '90 days' ? "Epic quest! You'll see major results." :
                        "Great timeframe for building new habits!"}
                  type="info"
                />
              )}
            </QuestCard>
          </Animated.View>
        );
        
      case 2: // Power Level
        return (
          <Animated.View
          >
            <QuestCard title="Set Your Power Level" icon="lightning-bolt">
              <Text style={styles.stepDescription}>
                How far are you willing to go on this quest?
              </Text>
              
              <FormSlider
                label="What percentage of income can you save?"
                value={formData.savingsRate}
                minimumValue={1}
                maximumValue={50}
                step={1}
                formatLabel={(value) => `${value}%`}
                onValueChange={(value) => updateFormData('savingsRate', value)}
              />
              
              {formData.savingsRate > 0 && (
                <View style={styles.savingsEstimate}>
                  <MaterialCommunityIcons 
                    name={formData.savingsRate > 25 ? "trending-up" : "chart-line"} 
                    size={18} 
                    color={colors.emerald.DEFAULT} 
                  />
                  <Text style={styles.savingsEstimateText}>
                    {formData.savingsRate < 10 ? "Every journey starts with small steps!" :
                     formData.savingsRate < 20 ? "Solid savings rate! You're on track." :
                     formData.savingsRate < 30 ? "Impressive! You're outpacing 70% of people." :
                     "Hero mode activated! You're in the top 10%!"}
                  </Text>
                </View>
              )}
              
              <FormSlider
                label="How committed are you to this challenge?"
                value={formData.commitmentLevel}
                minimumValue={1}
                maximumValue={3}
                step={1}
                formatLabel={(value) => {
                  return value === 1 ? "Casual" : value === 2 ? "Dedicated" : "All In";
                }}
                onValueChange={(value) => updateFormData('commitmentLevel', value)}
              />
              
              <FormDropdown
                label="What's your biggest financial fear?"
                placeholder="Select financial fear"
                options={FINANCIAL_FEARS}
                value={formData.financialFear}
                onSelect={(value) => updateFormData('financialFear', value)}
              />
              
              {formData.financialFear && (
                <Tip
                  text="Facing your fears is the first step to conquering them. We'll help you build confidence."
                  type="motivation"
                />
              )}
            </QuestCard>
          </Animated.View>
        );
        
      case 3: // Summary
        return (
          <Animated.View
          >
            <QuestCard title="Your Challenge Awaits" icon="flag-checkered">
              <Text style={styles.stepDescription}>
                Here's the quest you've designed. Ready to begin?
              </Text>
              
              <View style={styles.summaryContainer}>
                <View style={styles.heroCard}>
                  <View style={styles.heroIconCircle}>
                    <MaterialCommunityIcons 
                      name="shield-account" 
                      size={28} 
                      color={colors.white} 
                    />
                  </View>
                  <View style={styles.heroDetails}>
                    <Text style={styles.heroTitle}>Your Hero Profile</Text>
                    <Text style={styles.heroSubtitle}>
                      {formData.employmentType || "Financial Hero"} • {formData.spendingBehavior || "Balanced"} Spender
                    </Text>
                  </View>
                </View>
                
                <View style={styles.questSummary}>
                  <View style={styles.summaryRow}>
                    <View style={styles.summaryIcon}>
                      <MaterialCommunityIcons name="flag" size={16} color={colors.emerald.DEFAULT} />
                    </View>
                    <Text style={styles.summaryLabel}>Goal:</Text>
                    <Text style={styles.summaryValue}>{formData.financialGoal || "Not set"}</Text>
                  </View>
                  
                  <View style={styles.summaryRow}>
                    <View style={styles.summaryIcon}>
                      <MaterialCommunityIcons name="puzzle" size={16} color={colors.emerald.DEFAULT} />
                    </View>
                    <Text style={styles.summaryLabel}>Challenge:</Text>
                    <Text style={styles.summaryValue}>{formData.challengeType || "Not set"}</Text>
                  </View>
                  
                  <View style={styles.summaryRow}>
                    <View style={styles.summaryIcon}>
                      <MaterialCommunityIcons name="calendar-range" size={16} color={colors.emerald.DEFAULT} />
                    </View>
                    <Text style={styles.summaryLabel}>Duration:</Text>
                    <Text style={styles.summaryValue}>{formData.challengeDuration || "Not set"}</Text>
                  </View>
                  
                  <View style={styles.summaryRow}>
                    <View style={styles.summaryIcon}>
                      <MaterialCommunityIcons name="percent" size={16} color={colors.emerald.DEFAULT} />
                    </View>
                    <Text style={styles.summaryLabel}>Savings:</Text>
                    <Text style={styles.summaryValue}>{formData.savingsRate}% of income</Text>
                  </View>
                </View>
                
                <LinearGradient
                  colors={['rgba(72, 187, 120, 0.1)', 'rgba(72, 187, 120, 0.2)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.estimateContainer}
                >
                  <MaterialCommunityIcons name="trophy" size={24} color={colors.emerald.DEFAULT} />
                  <View style={styles.estimateTextContainer}>
                    <Text style={styles.estimateTitle}>Quest Reward</Text>
                    <Text style={styles.estimateText}>
                      You're on track to save approximately {calculateEstimatedSavings()}!
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            </QuestCard>
          </Animated.View>
        );
        
      default:
        return null;
    }
  };

  return (
    <Container>
      <LinearGradient
        colors={['#f0fff4', '#ffffff']}
        style={styles.gradient}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => {
                if (currentStep === 0) {
                  navigation.goBack();
                } else {
                  transitionToPrevStep();
                }
              }}
            >
              <MaterialCommunityIcons name="chevron-left" size={28} color={colors.emerald.DEFAULT} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Hero's Journey</Text>
            <ProgressBadge progress={progress} />
          </View>
          
          {/* Step Title */}
          <View style={styles.stepTitleContainer}>
            <Text style={styles.stepTitle}>{STEPS[currentStep].title}</Text>
            <Text style={styles.stepSubtitle}>{STEPS[currentStep].subtitle}</Text>
          </View>
          
          {/* Step Content */}
          {renderStepContent()}
          
          {/* Navigation Buttons */}
          <View style={styles.navigationContainer}>
            {currentStep < 3 ? (
              <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
                <Button
                  title={currentStep === 2 ? "Review Your Quest" : "Continue"}
                  onPress={transitionToNextStep}
                  variant="primary"
                  size="large"
                  rightIcon="chevron-right"
                />
              </Animated.View>
            ) : (
              <Animated.View style={[
                styles.submitButton, 
                { transform: [{ scale: bounceAnim }] }
              ]}>
                <Button
                  title="Start My Challenge!"
                  onPress={createChallenge}
                  variant="primary"
                  size="large"
                  rightIcon="sword"
                />
              </Animated.View>
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </Container>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingTop: 20,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.emerald.DEFAULT,
  },
  stepTitleContainer: {
    marginBottom: 16,
    marginTop: 8,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray.dark,
  },
  stepSubtitle: {
    fontSize: 16,
    color: colors.gray.DEFAULT,
    marginTop: 4,
  },
  stepDescription: {
    fontSize: 15,
    color: colors.gray.DEFAULT,
    marginBottom: 16,
    lineHeight: 22,
  },
  navigationContainer: {
    marginTop: 24,
    marginBottom: 20,
  },
  submitButton: {
    borderRadius: 12,
  },
  summaryContainer: {
    marginTop: 8,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray.light,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  heroIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.emerald.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  heroDetails: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.gray.dark,
  },
  heroSubtitle: {
    fontSize: 14,
    color: colors.gray.DEFAULT,
    marginTop: 2,
  },
  questSummary: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.gray.light,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  summaryLabel: {
    fontSize: 15,
    color: colors.gray.DEFAULT,
    width: 80,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.gray.dark,
    flex: 1,
  },
  estimateContainer: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  estimateTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  estimateTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.emerald.DEFAULT,
    marginBottom: 2,
  },
  estimateText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.emerald.dark,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(72, 187, 120, 0.1)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  goalText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.emerald.DEFAULT,
    marginLeft: 8,
    flex: 1,
  },
  savingsEstimate: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(72, 187, 120, 0.08)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  savingsEstimateText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.emerald.dark,
    marginLeft: 8,
    flex: 1,
  },
});

export default ChallengeSetupScreen;