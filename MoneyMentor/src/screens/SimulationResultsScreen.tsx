import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

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

type SimulationResultsRouteProp = RouteProp<RootStackParamList, 'SimulationResults'>;
type SimulationResultsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SimulationResults'
>;

// Investment type definitions with volatility and daily rates
const INVESTMENT_TYPES = {
  conservative: { label: 'Conservative (Low Risk)', volatility: 0.001, dailyRate: 0.0002 },
  balanced: { label: 'Balanced (Medium Risk)', volatility: 0.002, dailyRate: 0.0004 },
  aggressive: { label: 'Aggressive (High Risk)', volatility: 0.004, dailyRate: 0.0007 },
};

// Helper function to format currency
const formatCurrency = (value: number): string => {
  return `GHS ${value.toFixed(2)}`;
};

// Helper function to format percentage
const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(2)}%`;
};

const SimulationResultsScreen = () => {
  const navigation = useNavigation<SimulationResultsScreenNavigationProp>();
  const route = useRoute<SimulationResultsRouteProp>();
  const { amount, investmentType, days, deposits, frequency } = route.params;
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  const [activeTab, setActiveTab] = useState('realistic'); // 'ideal' or 'realistic'
  const [showInfoModal, setShowInfoModal] = useState(false);
  
  // Calculated results
  const [idealResults, setIdealResults] = useState({
    finalAmount: 0,
    totalGain: 0,
    returnRate: 0,
    growthChart: [] as {amount: number, day: number}[],
  });
  
  const [realisticResults, setRealisticResults] = useState({
    finalAmount: 0,
    totalGain: 0,
    returnRate: 0,
    growthChart: [] as {amount: number, day: number}[],
    worstDay: { day: 0, amount: 0 },
    bestDay: { day: 0, amount: 0 },
  });

  // Animate on component mount
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
    
    // Calculate simulation results
    calculateResults();
  }, []);

  // Simulation calculation
  const calculateResults = () => {
    const investmentInfo = INVESTMENT_TYPES[investmentType as keyof typeof INVESTMENT_TYPES];
    const { dailyRate, volatility } = investmentInfo;
    
    // Initialize data
    let idealCurrent = amount;
    let realisticCurrent = amount;
    const idealChart: {amount: number, day: number}[] = [{amount, day: 0}];
    const realisticChart: {amount: number, day: number}[] = [{amount, day: 0}];
    
    let worstDay = { day: 0, amount: realisticCurrent };
    let bestDay = { day: 0, amount: realisticCurrent };
    
    // Calculate daily growth
    for (let day = 1; day <= days; day++) {
      // Add periodic deposits
      if (frequency > 0 && day % frequency === 0) {
        idealCurrent += deposits;
        realisticCurrent += deposits;
      }
      
      // Apply daily growth (ideal - straight line)
      idealCurrent *= (1 + dailyRate);
      
      // Apply daily growth with randomized volatility (realistic)
      const dailyVolatility = (Math.random() * 2 - 1) * volatility;
      const realDailyRate = dailyRate + dailyVolatility;
      realisticCurrent *= (1 + realDailyRate);

       // Validate values before adding to the chart
      if (isNaN(idealCurrent) || !isFinite(idealCurrent)) {
        idealCurrent = 0; // Reset to 0 or a default value
      }
      if (isNaN(realisticCurrent) || !isFinite(realisticCurrent)) {
        realisticCurrent = 0; // Reset to 0 or a default value
      }
      
      // Update charts at intervals to avoid too many points
      const interval = Math.max(1, Math.floor(days / 20)); // Max 20 points on chart
      if (day % interval === 0 || day === days) {
        idealChart.push({amount: idealCurrent, day});
        realisticChart.push({amount: realisticCurrent, day});
      }
      
      // Track best and worst days
      if (realisticCurrent < worstDay.amount) {
        worstDay = { day, amount: realisticCurrent };
      }
      if (realisticCurrent > bestDay.amount) {
        bestDay = { day, amount: realisticCurrent };
      }
    }
    
    // Calculate returns
    const totalDeposits = amount + (Math.floor(days / frequency) * deposits);
    const idealGain = idealCurrent - totalDeposits;
    const realisticGain = realisticCurrent - totalDeposits;
    
    const idealReturn = idealGain / totalDeposits;
    const realisticReturn = realisticGain / totalDeposits;
    
    // Set results
    setIdealResults({
      finalAmount: idealCurrent,
      totalGain: idealGain,
      returnRate: idealReturn,
      growthChart: idealChart,
    });
    
    setRealisticResults({
      finalAmount: realisticCurrent,
      totalGain: realisticGain,
      returnRate: realisticReturn,
      growthChart: realisticChart,
      worstDay,
      bestDay,
    });
  };

  // Prepare chart data based on active tab
  const getChartData = () => {
    const chartData = activeTab === 'ideal' 
      ? idealResults.growthChart 
      : realisticResults.growthChart;

    const validData = chartData.filter(point => 
    !isNaN(point.amount) && isFinite(point.amount)
    );
    
    return {
      labels: chartData.map(point => `${point.day}`),
      datasets: [
        {
          data: chartData.map(point => point.amount),
          color: () => colors.emerald.DEFAULT,
          strokeWidth: 2,
        }
      ],
    };
  };

  // Handle retry button
  const handleRetry = () => {
    navigation.goBack();
  };

  // Handle tab switch
  const handleTabSwitch = (tab: 'ideal' | 'realistic') => {
    setActiveTab(tab);
  };

  // Get current results based on active tab
  const currentResults = activeTab === 'ideal' ? idealResults : realisticResults;
  const totalDeposits = amount + (Math.floor(days / frequency) * deposits);
  const investmentTypeInfo = INVESTMENT_TYPES[investmentType as keyof typeof INVESTMENT_TYPES];

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
            <Text style={styles.title}>Simulation Results</Text>
            <Text style={styles.subtitle}>
              Here's how your investment could grow
            </Text>
          </Animated.View>
          
          {/* Card Container */}
          <Animated.View 
            style={[
              styles.card, 
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            {/* Investment Summary */}
            <View style={styles.summaryContainer}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Initial Investment</Text>
                <Text style={styles.summaryValue}>{formatCurrency(amount)}</Text>
              </View>
              
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Investment Type</Text>
                <Text style={styles.summaryValue}>{investmentTypeInfo.label}</Text>
              </View>
              
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Duration</Text>
                <Text style={styles.summaryValue}>{days} days</Text>
              </View>
              
              {frequency > 0 && (
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Regular Deposits</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(deposits)} every {frequency} days
                  </Text>
                </View>
              )}
            </View>
            
            {/* Tab Selector */}
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[
                  styles.tab, 
                  activeTab === 'ideal' && styles.activeTab
                ]}
                onPress={() => handleTabSwitch('ideal')}
              >
                <Text style={[
                  styles.tabText, 
                  activeTab === 'ideal' && styles.activeTabText
                ]}>
                  Ideal Growth
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.tab, 
                  activeTab === 'realistic' && styles.activeTab
                ]}
                onPress={() => handleTabSwitch('realistic')}
              >
                <Text style={[
                  styles.tabText, 
                  activeTab === 'realistic' && styles.activeTabText
                ]}>
                  Realistic Growth
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Growth Chart */}
            {/* <View style={styles.chartContainer}>
              <LineChart
                data={getChartData()}
                width={Dimensions.get('window').width - 60}
                height={220}
                chartConfig={{
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(80, 200, 120, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(100, 100, 100, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: '3',
                    strokeWidth: '2',
                    stroke: colors.emerald.DEFAULT,
                  },
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
              />
              <Text style={styles.chartCaption}>
                {activeTab === 'ideal' 
                  ? 'Ideal Growth (Steady Returns)' 
                  : 'Realistic Growth (With Market Volatility)'}
              </Text>
            </View> */}
            
            {/* Results */}
            <View style={styles.resultsContainer}>
              <View style={styles.resultItem}>
                <Text style={styles.resultItemLabel}>
                  Final Amount 
                  <MaterialCommunityIcons name="cash-multiple" size={16} color={colors.emerald.DEFAULT} />
                </Text>
                <Text style={styles.resultItemValue}>
                  {formatCurrency(currentResults.finalAmount)}
                </Text>
              </View>
              
              <View style={styles.resultItem}>
                <Text style={styles.resultItemLabel}>
                  Total Gain
                  <MaterialCommunityIcons name="trending-up" size={16} color={colors.emerald.DEFAULT} />
                </Text>
                <Text style={[
                  styles.resultItemValue,
                  currentResults.totalGain >= 0 ? styles.positiveValue : styles.negativeValue
                ]}>
                  {currentResults.totalGain >= 0 ? '+' : ''}{formatCurrency(currentResults.totalGain)}
                </Text>
              </View>
              
              <View style={styles.resultItem}>
                <Text style={styles.resultItemLabel}>
                  Return Rate
                  <MaterialCommunityIcons name="percent" size={16} color={colors.emerald.DEFAULT} />
                </Text>
                <Text style={[
                  styles.resultItemValue,
                  currentResults.returnRate >= 0 ? styles.positiveValue : styles.negativeValue
                ]}>
                  {currentResults.returnRate >= 0 ? '+' : ''}{formatPercentage(currentResults.returnRate)}
                </Text>
              </View>
              
              {activeTab === 'realistic' && (
                <>
                  <View style={styles.volatilityContainer}>
                    <View style={styles.volatilityItem}>
                      <MaterialCommunityIcons name="arrow-down-bold" size={20} color="#e53e3e" />
                      <Text style={styles.volatilityLabel}>Lowest Point</Text>
                      <Text style={styles.volatilityValue}>
                        {formatCurrency(realisticResults.worstDay.amount)}
                      </Text>
                      <Text style={styles.volatilityDay}>
                        Day {realisticResults.worstDay.day}
                      </Text>
                    </View>
                    
                    <View style={styles.volatilityItem}>
                      <MaterialCommunityIcons name="arrow-up-bold" size={20} color="#38a169" />
                      <Text style={styles.volatilityLabel}>Highest Point</Text>
                      <Text style={styles.volatilityValue}>
                        {formatCurrency(realisticResults.bestDay.amount)}
                      </Text>
                      <Text style={styles.volatilityDay}>
                        Day {realisticResults.bestDay.day}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.infoBox}>
                    <MaterialCommunityIcons name="information-outline" size={22} color={colors.emerald.DEFAULT} />
                    <Text style={styles.infoText}>
                      Markets naturally go up and down over time. Temporary drops are normal, even in healthy markets. Long-term investing helps smooth out these fluctuations.
                    </Text>
                  </View>
                </>
              )}
            </View>
            
            {/* Learning Bite */}
            <View style={styles.learningBite}>
              <View style={styles.biteHeader}>
                <MaterialCommunityIcons name="lightbulb-outline" size={22} color={colors.emerald.DEFAULT} />
                <Text style={styles.biteTitle}>Jargon-Free Bite</Text>
              </View>
              <Text style={styles.biteContent}>
                {investmentType === 'conservative'
                  ? "Conservative investments are like driving slowly - less exciting but fewer bumps along the way. They're perfect for short-term goals or if you don't like ups and downs."
                  : investmentType === 'balanced'
                  ? "Balanced investments mix safety and growth potential - like a middle lane on the highway. They're ideal for medium-term goals or if you can handle some ups and downs."
                  : "Aggressive investments aim for high growth - like a sports car that goes fast but can experience sharp turns. They're best for long-term goals when you have time to recover from dips."}
              </Text>
            </View>
            
            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <Button
                title="Try Different Values" 
                onPress={handleRetry}
                variant="secondary"
                size="medium"
              />
              
              <Button
                title="Take My First Step" 
                onPress={() => {/* Link to real product */}}
                variant="primary"
                size="medium"
              />
            </View>
          </Animated.View>
          
          {/* Helper Text */}
          <Text style={styles.helperText}>
            This simulation helps build your financial confidence.
            All investments carry risk, but knowledge reduces fear.
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
  summaryContainer: {
    backgroundColor: colors.gray.light,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.gray.dark,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: colors.gray.dark,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: colors.gray.light,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: colors.emerald.DEFAULT,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray.dark,
  },
  activeTabText: {
    color: colors.white,
  },
  chartContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  chartCaption: {
    marginTop: 5,
    fontSize: 14,
    color: colors.gray.DEFAULT,
    textAlign: 'center',
  },
  resultsContainer: {
    marginBottom: 20,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray.light,
  },
  resultItemLabel: {
    fontSize: 16,
    color: colors.gray.dark,
    fontWeight: '500',
  },
  resultItemValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gray.dark,
  },
  positiveValue: {
    color: '#38a169', // green
  },
  negativeValue: {
    color: '#e53e3e', // red
  },
  volatilityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  volatilityItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.gray.light,
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
  },
  volatilityLabel: {
    fontSize: 14,
    color: colors.gray.dark,
    marginTop: 5,
  },
  volatilityValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.gray.dark,
    marginTop: 5,
  },
  volatilityDay: {
    fontSize: 12,
    color: colors.gray.DEFAULT,
    marginTop: 2,
  },
  infoBox: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'rgba(80, 200, 120, 0.1)',
    borderRadius: 12,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: colors.gray.dark,
    flex: 1,
    marginLeft: 10,
  },
  learningBite: {
    backgroundColor: colors.gray.light,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  biteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  biteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.emerald.DEFAULT,
    marginLeft: 8,
  },
  biteContent: {
    fontSize: 14,
    color: colors.gray.dark,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  helperText: {
    textAlign: 'center',
    color: colors.gray.DEFAULT,
    fontSize: 14,
    marginTop: 5,
  },
});

export default SimulationResultsScreen;