// src/screens/ChallengeSetupScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Animated, 
  Dimensions 
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
  { title: "Hero Profile", subtitle: "Tell us about your financial journey" },
  { title: "Your Quest", subtitle: "Choose your challenge path" },
  { title: "Power Level", subtitle: "Set your commitment and goals" },
  { title: "Ready to Begin!", subtitle: "Review and start your challenge" }
];

const ChallengeSetupScreen = () => {
  const navigation = useNavigation<ChallengeSetupScreenNavigationProp>();
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  
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

  // Animations for step transitions
  const transitionToNextStep = () => {
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
    // TODO: POST to /challenges/ endpoint
    
    // Navigate to dashboard
    // navigation.navigate('ChallengeDashboard');
    navigation.navigate('Home'); // For now
  };

  // Render step content based on current step
  const renderStepContent = () => {
    switch(currentStep) {
      case 0: // Hero Profile
        return (
          <Animated.View 
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
          >
            <QuestCard title="Build Your Hero Profile" icon="account-outline">
              <FormDropdown
                label="What's your employment status?"
                placeholder="Select employment type"
                options={EMPLOYMENT_TYPES}
                value={formData.employmentType}
                onSelect={(value) => updateFormData('employmentType', value)}
              />
              
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
                  // Show feedback message
                  if (value === 'Balanced') {
                    // TODO: Show toast or feedback
                    console.log("Great choice! Balanced investors have succeeded 85% of the time!");
                  }
                }}
              />
            </QuestCard>
          </Animated.View>
        );
        
      case 1: // Your Quest
        return (
          <Animated.View 
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
          >
            <QuestCard title="Choose Your Quest" icon="map-marker-path">
              <FormDropdown
                label="What's your financial goal?"
                placeholder="Select financial goal"
                options={FINANCIAL_GOALS}
                value={formData.financialGoal}
                onSelect={(value) => updateFormData('financialGoal', value)}
              />
              
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
            </QuestCard>
          </Animated.View>
        );
        
      case 2: // Power Level
        return (
          <Animated.View 
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
          >
            <QuestCard title="Set Your Power Level" icon="lightning-bolt">
              <FormSlider
                label="What percentage of income can you save?"
                value={formData.savingsRate}
                minimumValue={1}
                maximumValue={50}
                step={1}
                formatLabel={(value) => `${value}%`}
                onValueChange={(value) => updateFormData('savingsRate', value)}
              />
              
              <FormSlider
                label="How committed are you to this challenge?"
                value={formData.commitmentLevel}
                minimumValue={1}
                maximumValue={3}
                step={1}
                formatLabel={(value) => {
                  return value === 1 ? "Low" : value === 2 ? "Medium" : "High";
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
            </QuestCard>
          </Animated.View>
        );
        
      case 3: // Summary
        return (
          <Animated.View 
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
          >
            <QuestCard title="Your Challenge Awaits" icon="flag-checkered">
              <View style={styles.summaryContainer}>
                <View style={styles.summarySection}>
                  <Text style={styles.summaryTitle}>Your Profile</Text>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Employment:</Text>
                    <Text style={styles.summaryValue}>{formData.employmentType || "Not set"}</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Spending:</Text>
                    <Text style={styles.summaryValue}>{formData.spendingBehavior || "Not set"}</Text>
                  </View>
                </View>
                
                <View style={styles.summarySection}>
                  <Text style={styles.summaryTitle}>Your Challenge</Text>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Goal:</Text>
                    <Text style={styles.summaryValue}>{formData.financialGoal || "Not set"}</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Type:</Text>
                    <Text style={styles.summaryValue}>{formData.challengeType || "Not set"}</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Duration:</Text>
                    <Text style={styles.summaryValue}>{formData.challengeDuration || "Not set"}</Text>
                  </View>
                </View>
                
                <View style={styles.estimateContainer}>
                  <MaterialCommunityIcons name="cash-multiple" size={24} color={colors.emerald.DEFAULT} />
                  <Text style={styles.estimateText}>
                    You're on track to save approximately {calculateEstimatedSavings()}!
                  </Text>
                </View>
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
            <Text style={styles.headerTitle}>New Challenge</Text>
          </View>
          
          {/* Step Indicator */}
          <StepIndicator 
            steps={STEPS.length}
            currentStep={currentStep}
            labels={STEPS.map(step => step.title)}
          />
          
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
              <Button
                title="Continue"
                onPress={transitionToNextStep}
                variant="primary"
                size="large"
                rightIcon="chevron-right"
              />
            ) : (
              <View style={styles.submitButton}>
                <Button
                  title="Start My Challenge!"
                  onPress={createChallenge}
                  variant="primary"
                  size="large"
                />
              </View>
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
    marginBottom: 20,
    paddingTop: 20,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.emerald.DEFAULT,
    marginLeft: 8,
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
  navigationContainer: {
    marginTop: 24,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: colors.emerald.DEFAULT,
    borderRadius: 12,
  },
  summaryContainer: {
    marginTop: 8,
  },
  summarySection: {
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray.dark,
    marginBottom: 8,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 15,
    color: colors.gray.DEFAULT,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.gray.dark,
  },
  estimateContainer: {
    backgroundColor: 'rgba(72, 187, 120, 0.1)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  estimateText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.emerald.DEFAULT,
    marginLeft: 12,
    flex: 1,
  },
});

export default ChallengeSetupScreen;