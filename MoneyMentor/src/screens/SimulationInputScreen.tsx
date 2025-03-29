import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';

import Container from '../components/layout/Container';
import Button from '../components/ui/Button';
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

const INVESTMENT_TYPES = [
  { label: 'Conservative (Low Risk)', value: 'conservative', volatility: 0.001, dailyRate: 0.0002 },
  { label: 'Balanced (Medium Risk)', value: 'balanced', volatility: 0.002, dailyRate: 0.0004 },
  { label: 'Aggressive (High Risk)', value: 'aggressive', volatility: 0.004, dailyRate: 0.0007 },
];

const DURATIONS = [
  { label: '1 month (30 days)', value: 30 },
  { label: '3 months (90 days)', value: 90 },
  { label: '6 months (180 days)', value: 180 },
  { label: '1 year (365 days)', value: 365 },
];

const FREQUENCIES = [
  { label: 'No recurring deposits', value: 0 },
  { label: 'Daily', value: 1 },
  { label: 'Weekly', value: 7 },
  { label: 'Monthly', value: 30 },
];

const SimulationInputScreen = () => {
  const navigation = useNavigation<SimulationInputScreenNavigationProp>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  const [initialAmount, setInitialAmount] = useState('1000');
  const [investmentType, setInvestmentType] = useState(INVESTMENT_TYPES[1].value);
  const [duration, setDuration] = useState(DURATIONS[1].value);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [depositAmount, setDepositAmount] = useState('100');
  const [depositFrequency, setDepositFrequency] = useState(FREQUENCIES[2].value);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();
  }, []);
  
  const handleSimulate = () => {
    navigation.navigate('SimulationResults', {
      amount: parseFloat(initialAmount),
      investmentType: investmentType,
      days: duration,
      deposits: parseFloat(depositAmount),
      frequency: depositFrequency,
    });
  };

  const isValidInput = () => {
    const amount = parseFloat(initialAmount);
    const deposits = parseFloat(depositAmount);
    return amount > 0 && (!showAdvanced || deposits >= 0);
  };

  return (
    <Container>
      <LinearGradient
        colors={['#f0fff4', '#ffffff']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <Animated.View 
            style={[
              styles.header, 
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <Text style={styles.title}>Investment Simulator</Text>
            <Text style={styles.subtitle}>
              See what your money could do without any risk
            </Text>
          </Animated.View>
          
          {/* Card Container */}
          <Animated.View 
            style={[
              styles.card, 
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            {/* Part 1: Initial Investment */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="cash" size={22} color={colors.emerald.DEFAULT} />
                <Text style={styles.sectionTitle}>Initial Investment</Text>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Amount (GHS)</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={initialAmount}
                  onChangeText={setInitialAmount}
                  placeholder="e.g., 1000"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Investment Type</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={investmentType}
                    onValueChange={(itemValue) => setInvestmentType(itemValue)}
                    style={styles.picker}
                  >
                    {INVESTMENT_TYPES.map((type) => (
                      <Picker.Item 
                        key={type.value} 
                        label={type.label} 
                        value={type.value} 
                      />
                    ))}
                  </Picker>
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Duration</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={duration}
                    onValueChange={(itemValue) => setDuration(itemValue)}
                    style={styles.picker}
                  >
                    {DURATIONS.map((durationOption) => (
                      <Picker.Item 
                        key={durationOption.value} 
                        label={durationOption.label} 
                        value={durationOption.value} 
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>
            
            {/* Advanced Option Toggle */}
            <TouchableOpacity 
              style={styles.advancedToggle}
              onPress={() => setShowAdvanced(!showAdvanced)}
            >
              <Text style={styles.advancedToggleText}>
                {showAdvanced ? 'Hide advanced options' : 'Show advanced options'}
              </Text>
              <MaterialCommunityIcons 
                name={showAdvanced ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color={colors.emerald.DEFAULT} 
              />
            </TouchableOpacity>
            
            {/* Part 2: Recurring Deposits (Advanced) */}
            {showAdvanced && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="calendar-clock" size={22} color={colors.emerald.DEFAULT} />
                  <Text style={styles.sectionTitle}>Recurring Deposits</Text>
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Deposit Amount (GHS)</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    value={depositAmount}
                    onChangeText={setDepositAmount}
                    placeholder="e.g., 100"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Frequency</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={depositFrequency}
                      onValueChange={(itemValue) => setDepositFrequency(itemValue)}
                      style={styles.picker}
                    >
                      {FREQUENCIES.map((freq) => (
                        <Picker.Item 
                          key={freq.value} 
                          label={freq.label} 
                          value={freq.value} 
                        />
                      ))}
                    </Picker>
                  </View>
                </View>
              </View>
            )}
            
            {/* Visual Teaser */}
            <View style={styles.teaser}>
              <Text style={styles.teaserText}>
                What if you invested {initialAmount} GHS today?
              </Text>
              <MaterialCommunityIcons 
                name="chart-line-variant" 
                size={32} 
                color={colors.emerald.light} 
              />
            </View>
            
            {/* Button */}
            <View style={styles.buttonContainer}>
              <Button
                title="Simulate Investment" 
                onPress={handleSimulate}
                variant="primary"
                size="large"
                disabled={!isValidInput()}
              />
            </View>
          </Animated.View>
          
          {/* Helper Text */}
          <Text style={styles.helperText}>
            This simulation uses historical market data to show potential outcomes.
            Remember, past performance doesn't guarantee future results.
          </Text>
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
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.emerald.DEFAULT,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray.DEFAULT,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.emerald.DEFAULT,
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: colors.gray.dark,
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.gray.light,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.gray.light,
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray.light,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray.light,
    marginBottom: 20,
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
  teaser: {
    backgroundColor: 'rgba(80, 200, 120, 0.1)',
    borderRadius: 15,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  teaserText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.emerald.DEFAULT,
    flex: 1,
    marginRight: 10,
  },
  helperText: {
    textAlign: 'center',
    color: colors.gray.DEFAULT,
    fontSize: 14,
    marginTop: 5,
  },
});

export default SimulationInputScreen;