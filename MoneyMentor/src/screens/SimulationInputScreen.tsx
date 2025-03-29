import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  TouchableOpacity, 
  Animated, 
  Easing,
  Dimensions,
  Pressable
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import Container from '../components/layout/Container';
import colors from '../theme/color';

type RootStackParamList = {
  Home: undefined;
  SimulationInput: undefined;
  SimulationResults: {
    amount: number;
    investmentType: string;
    days: number;
    deposits: number;
    frequency: number;
  };
};

type SimulationInputScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SimulationInput'
>;

const { width } = Dimensions.get('window');

const INVESTMENT_TYPES: {
  label: string;
  value: string;
  volatility: number;
  dailyRate: number;
  performance: string;
  description: string;
  color: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}[] = [
  { 
    label: 'DigiSave', 
    value: 'conservative', 
    volatility: 0.001, 
    dailyRate: 0.0002,
    performance: '12%',
    description: 'Low Risk',
    color: '#4299E1', // Blue shade
    icon: 'shield-check'
  },
  { 
    label: 'EuroBond', 
    value: 'balanced', 
    volatility: 0.002, 
    dailyRate: 0.0004,
    performance: '17%',
    description: 'Medium Risk',
    color: '#38A169', // Green shade
    icon: 'scale-balance'
  },
  { 
    label: 'Global Tech', 
    value: 'aggressive', 
    volatility: 0.004, 
    dailyRate: 0.0007,
    performance: '24%',
    description: 'High Risk',
    color: '#D69E2E', // Gold/amber shade
    icon: 'rocket-launch'
  },
];

const DURATIONS: { labelNumber: string; labelText: string; value: number; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { labelNumber: '1', labelText: "month", value: 30, icon: 'calendar-month' },
  { labelNumber: '3', labelText: "months", value: 90, icon: 'calendar-month' },
  { labelNumber: '6', labelText: "months", value: 180, icon: 'calendar-month' },
  { labelNumber: '12', labelText: "months", value: 365, icon: 'calendar-check' },
];

const FREQUENCIES: { label: string; value: number; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { label: 'None', value: 0, icon: 'close-circle-outline' },
  { label: 'Daily', value: 1, icon: 'calendar-today' },
  { label: 'Weekly', value: 7, icon: 'calendar-week' },
  { label: 'Monthly', value: 30, icon: 'calendar-month' },
];

const SimulationInputScreen = () => {
  const navigation = useNavigation<SimulationInputScreenNavigationProp>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const advancedSlideAnim = useRef(new Animated.Value(0)).current;
  const advancedHeightAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  
  // Investment type animations (one for each option)
  const investmentAnims = useRef(INVESTMENT_TYPES.map(() => new Animated.Value(1))).current;
  
  // Form state
  const [initialAmount, setInitialAmount] = useState('1000');
  const [investmentType, setInvestmentType] = useState(INVESTMENT_TYPES[1].value);
  const [duration, setDuration] = useState(DURATIONS[1].value);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [depositAmount, setDepositAmount] = useState('100');
  const [depositFrequency, setDepositFrequency] = useState(FREQUENCIES[2].value);
  const [inputFocus, setInputFocus] = useState('');
  
  // Derived values for projections
  const selectedFund = INVESTMENT_TYPES.find(type => type.value === investmentType) || INVESTMENT_TYPES[1];
  const estimatedReturn = calculateEstimatedReturn(parseFloat(initialAmount), selectedFund.dailyRate, duration);

  // Initial entrance animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      })
    ]).start();
  }, []);
  
  // Advanced options animation
  useEffect(() => {
    const rotateValue = showAdvanced ? 1 : 0;
  
    Animated.parallel([
      Animated.timing(advancedHeightAnim, {
        toValue: showAdvanced ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
        easing: Easing.inOut(Easing.cubic),
      }),
      Animated.spring(advancedSlideAnim, {
        toValue: showAdvanced ? 0 : 20,
        useNativeDriver: true,
        friction: 7,
        tension: 70,
      }),
      Animated.spring(rotateAnim, {
        toValue: rotateValue,
        useNativeDriver: true,
        friction: 7,
        tension: 70,
      }),
    ]).start();
  
    if (showAdvanced) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [showAdvanced]);
  
  const handleInvestmentTypeChange = (itemValue: string, index: number) => {
    setInvestmentType(itemValue);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Animate the selected card
    Animated.sequence([
      Animated.timing(investmentAnims[index], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(investmentAnims[index], {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
  };
  
  const handleSimulate = () => {
    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.spring(buttonScaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Short delay for the animation to be visible
    setTimeout(() => {
      navigation.navigate('SimulationResults', {
        amount: parseFloat(initialAmount),
        investmentType: investmentType,
        days: duration,
        deposits: parseFloat(depositAmount),
        frequency: depositFrequency,
      });
    }, 200);
  };

  const isValidInput = () => {
    const amount = parseFloat(initialAmount);
    const deposits = parseFloat(depositAmount);
    return amount > 0 && (!showAdvanced || deposits >= 0);
  };
  
  // Calculate a simple estimated return for the preview
  function calculateEstimatedReturn(amount: number, dailyRate: number, days: number) {
    return amount * Math.pow(1 + dailyRate, days);
  }
  
  // Interpolate rotation for the advanced toggle icon
  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  
  // Height interpolation for smooth advanced section animation
  const heightInterpolation = advancedHeightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 260],
  });

  // Format the preview estimated amount
  const formattedEstimate = new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    maximumFractionDigits: 0,
  }).format(estimatedReturn);

  return (
    <Container>
      <LinearGradient
        colors={['#e6fff0', '#f0fffa', '#ffffff']}
        style={styles.gradient}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Animated Header */}
          <Animated.View 
            style={[
              styles.header, 
              { 
                opacity: fadeAnim, 
                transform: [{ translateY: slideAnim }] 
              }
            ]}
          >
            <Text style={styles.title}>Grow Your Money</Text>
            <Text style={styles.subtitle}>Create a personalized investment plan</Text>
          </Animated.View>
          
          {/* Main Card */}
          <Animated.View 
            style={[
              styles.card, 
              { 
                opacity: fadeAnim, 
                transform: [{ translateY: slideAnim }],
                shadowColor: selectedFund.color,
              }
            ]}
          >
            {/* Amount Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.cardTitle}>One-Time Investment</Text>
              <Text style={styles.inputLabel}>How much do you want to invest?</Text>
              <View style={[
                styles.inputWrapper,
                inputFocus === 'amount' && styles.inputWrapperFocused
              ]}>
                <View style={styles.currencyContainer}>
                  <Text style={styles.currencySymbol}>GHS</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={initialAmount}
                  onChangeText={setInitialAmount}
                  placeholder="e.g., 1000"
                  onFocus={() => setInputFocus('amount')}
                  onBlur={() => setInputFocus('')}
                />
              </View>
            </View>
            
            {/* Investment Type Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Choose your investment</Text>
              
              <View style={styles.fundOptionsContainer}>
                {INVESTMENT_TYPES.map((type, index) => {
                  const isSelected = investmentType === type.value;
                  
                  return (
                    <Animated.View 
                      key={type.value}
                      style={{ 
                        transform: [{ scale: investmentAnims[index] }],
                        flex: 1,
                        margin: 4,
                      }}
                    >
                      <TouchableOpacity
                        style={[
                          styles.fundOption,
                          isSelected && { 
                            borderColor: type.color,
                          }
                        ]}
                        onPress={() => handleInvestmentTypeChange(type.value, index)}
                        activeOpacity={0.85}
                      >
                        <View style={[
                          styles.fundIconContainer,
                          { backgroundColor: isSelected ? type.color : '#f3f4f6' }
                        ]}>
                          <MaterialCommunityIcons 
                            name={type.icon} 
                            size={22} 
                            color={isSelected ? '#fff' : '#64748b'} 
                          />
                        </View>
                        
                        <Text style={[
                          styles.fundName, 
                          isSelected && { color: type.color }
                        ]}>
                          {type.label}
                        </Text>
                        
                        <Text style={styles.fundDescription}>
                          {type.description}
                        </Text>
                        
                        <View style={[
                          styles.fundPerformance,
                          { backgroundColor: `${type.color}50` }
                        ]}>
                          <Text style={[
                            styles.fundPerformanceText,
                            { color: type.color }
                          ]}>
                            {type.performance} last year
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })}
              </View>
            </View>
            
            {/* Duration Selection - Enhanced buttons */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Duration</Text>
              <View style={styles.durationButtons}>
                {DURATIONS.map((durationOption) => {
                  const isActive = duration === durationOption.value;
                  
                  return (
                    <TouchableOpacity
                      key={durationOption.value}
                      style={[
                        styles.durationButton,
                        isActive && styles.durationButtonActive
                      ]}
                      onPress={() => {
                        setDuration(durationOption.value);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                    >
                      <View style={styles.durationContent}>
                        <MaterialCommunityIcons 
                          name={durationOption.icon} 
                          size={16} 
                          color={isActive ? colors.emerald.DEFAULT : colors.gray.DEFAULT} 
                          style={styles.durationIcon}
                        />
                        <Text style={[
                          styles.durationButtonText,
                          isActive && styles.durationButtonTextActive
                        ]}>
                          {durationOption.labelNumber}
                        </Text>
                        <Text style={[
                          styles.durationButtonText,
                          isActive && styles.durationButtonTextActive
                        ]}>
                          {durationOption.labelText}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            
            {/* Advanced Toggle - Styled nicely */}
            <TouchableOpacity 
              style={styles.advancedToggle}
              onPress={() => setShowAdvanced(!showAdvanced)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['rgba(56, 178, 172, 0.1)', 'rgba(56, 178, 172, 0.05)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.advancedToggleGradient}
              >
                <Text style={styles.advancedToggleText}>
                  {showAdvanced ? 'Hide advanced options' : 'Show advanced options'}
                </Text>
                <Animated.View style={{ transform: [{ rotate: rotateInterpolation }] }}>
                  <MaterialCommunityIcons 
                    name="chevron-down" 
                    size={24} 
                    color={colors.emerald.DEFAULT} 
                  />
                </Animated.View>
              </LinearGradient>
            </TouchableOpacity>
            
            {/* Advanced Section - Better animation */}
            <Animated.View
              style={[{ 
                height: heightInterpolation,
                opacity: advancedHeightAnim,
                marginTop: 5
              }]}
            >

              <Animated.View
                style={{
                  backgroundColor: 'rgba(237, 242, 247, 0.5)',
                  borderRadius: 12,
                  padding: 15,
                  marginBottom: 10
                }}
              >
                <Text style={styles.cardTitle}>Continuous Investment</Text>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Top up amount</Text>
                  <View style={[
                    styles.inputWrapper,
                    inputFocus === 'deposit' && styles.inputWrapperFocused
                  ]}>
                    <View style={styles.currencyContainer}>
                      <Text style={styles.currencySymbol}>GHS</Text>
                    </View>
                    <TextInput
                      style={styles.textInput}
                      keyboardType="numeric"
                      value={depositAmount}
                      onChangeText={setDepositAmount}
                      placeholder="e.g., 100"
                      onFocus={() => setInputFocus('deposit')}
                      onBlur={() => setInputFocus('')}
                    />
                  </View>
                </View>
                
                <View style={[styles.inputGroup, {marginBottom: 0}]}>
                  <Text style={styles.inputLabel}>Top up frequency</Text>
                  <View style={styles.frequencyButtons}>
                    {FREQUENCIES.map((freq) => {
                      const isActive = depositFrequency === freq.value;
                      
                      return (
                        <TouchableOpacity
                          key={freq.value}
                          style={[
                            styles.frequencyButton,
                            isActive && styles.frequencyButtonActive
                          ]}
                          onPress={() => {
                            setDepositFrequency(freq.value);
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          }}
                        >
                          <MaterialCommunityIcons 
                            name={freq.icon} 
                            size={15} 
                            color={isActive ? colors.emerald.DEFAULT : colors.gray.DEFAULT} 
                            style={styles.frequencyIcon}
                          />
                          <Text style={[
                            styles.frequencyButtonText,
                            isActive && styles.frequencyButtonTextActive
                          ]}>
                            {freq.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </Animated.View>

            </Animated.View>
            
            {/* Simulate Button - Enhanced styling */}
            <View style={styles.buttonContainer}>
              <Animated.View style={{ 
                width: '100%', 
                transform: [{ scale: buttonScaleAnim }] 
              }}>
                <LinearGradient
                  colors={isValidInput() 
                    ? [selectedFund.color, colors.emerald.DEFAULT] 
                    : ['#CBD5E0', '#A0AEC0']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <TouchableOpacity
                    style={[
                      styles.simulateButton,
                      !isValidInput() && styles.disabledButton
                    ]}
                    onPress={handleSimulate}
                    disabled={!isValidInput()}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.simulateButtonText}>
                      Show Me Results
                    </Text>
                    <MaterialCommunityIcons 
                      name="chart-line" 
                      size={22} 
                      color="#fff" 
                      style={{marginRight: 8}}
                    />
                    <MaterialCommunityIcons 
                      name="arrow-right-circle" 
                      size={22} 
                      color="#fff" 
                    />
                  </TouchableOpacity>
                </LinearGradient>
              </Animated.View>
            </View>
          </Animated.View>
          
          {/* Enhanced tip with icon */}
          <View style={styles.tipContainer}>
            <MaterialCommunityIcons 
              name="lightbulb-outline" 
              size={20} 
              color={colors.emerald.DEFAULT} 
            />
            <Text style={styles.helperText}>
              The best time to start investing is today.
            </Text>
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
    padding: 16,
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: colors.emerald.DEFAULT,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray.DEFAULT,
    opacity: 0.8,
    textAlign: 'center',
  },
  cardTitle: {
    fontSize: 16,
    color: "#000",
    opacity: 0.8,
    textAlign: 'center',
    fontWeight: '700',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 12,
    color: colors.gray.dark,
    fontWeight: '500',
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.gray.light,
    borderRadius: 14,
    backgroundColor: '#FAFAFA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden',
  },
  inputWrapperFocused: {
    borderColor: colors.emerald.DEFAULT,
    shadowColor: colors.emerald.DEFAULT,
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  currencyContainer: {
    backgroundColor: 'rgba(237, 242, 247, 0.8)',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: colors.gray.light,
  },
  currencySymbol: {
    fontSize: 16,
    color: colors.gray.dark,
    fontWeight: '600',
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  estimatePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(104, 211, 145, 0.1)',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
  },
  estimatePreviewLabel: {
    fontSize: 14,
    color: colors.gray.dark,
    fontWeight: '500',
  },
  estimatePreviewValue: {
    fontSize: 16,
    color: colors.emerald.DEFAULT,
    fontWeight: '700',
  },
  fundOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fundOption: {
    borderWidth: 1.5,
    borderColor: colors.gray.light,
    borderRadius: 10,
    paddingHorizontal: 1,
    backgroundColor: '#FAFAFA',
    shadowOpacity: 0.05,
    elevation: 1,
    height: 145,
    justifyContent: 'space-between',
    paddingVertical:5
  },
  fundIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    alignSelf: 'center',
  },
  fundName: {
    fontWeight: '700',
    fontSize: 15,
    color: colors.gray.dark,
    textAlign: 'center',
    marginBottom: 4,
  },
  fundDescription: {
    fontSize: 12,
    color: colors.gray.DEFAULT,
    textAlign: 'center',
    marginBottom: 8,
    width: 'auto',
  },
  fundPerformance: {
    borderRadius: 10,
    padding: 6,
    alignItems: 'center',
  },
  fundPerformanceText: {
    fontSize: 12,
    fontWeight: '700',
  },
  durationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  durationButton: {
    flex: 1,
    padding: 8,
    marginHorizontal: 4,
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  durationContent: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationIcon: {
  },
  durationButtonActive: {
    borderColor: colors.emerald.DEFAULT,
  },
  durationButtonText: {
    fontWeight: '600',
    color: colors.gray.DEFAULT,
    fontSize: 12,
  },
  durationButtonTextActive: {
    color: colors.emerald.DEFAULT,
  },
  frequencyButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  frequencyButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 3,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    flexDirection: 'column',
  },
  frequencyIcon: {
    marginBottom: 5,
  },
  frequencyButtonActive: {
    backgroundColor: 'rgba(104, 211, 145, 0.15)',
    borderColor: colors.emerald.DEFAULT,
  },
  frequencyButtonText: {
    fontWeight: '500',
    color: colors.gray.DEFAULT,
    fontSize: 13,
  },
  frequencyButtonTextActive: {
    color: colors.emerald.DEFAULT,
  },
  advancedToggle: {
    marginVertical: 15,
    borderRadius: 14,
    overflow: 'hidden',
  },
  advancedToggleGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  advancedToggleText: {
    color: colors.emerald.DEFAULT,
    fontWeight: '600',
    marginRight: 8,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  buttonGradient: {
    borderRadius: 50,
    width: '100%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  simulateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    width: '100%',
  },
  simulateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginRight: 10,
  },
  disabledButton: {
    opacity: 0.7,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(237, 242, 247, 0.5)',
    borderRadius: 12,
    padding: 10,
  },
  helperText: {
    color: colors.gray.DEFAULT,
    fontSize: 14,
    marginLeft: 8,
    fontStyle: 'italic',
  }
});

export default SimulationInputScreen;