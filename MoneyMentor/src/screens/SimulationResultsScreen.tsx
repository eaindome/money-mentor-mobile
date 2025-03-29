import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-chart-kit';

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
  digiSave: { label: 'DigiSave', volatility: 0.0005, dailyRate: 0.00015, color: '#4299E1', description: "Your money stays safe while growing steadily - perfect for beginners." },
  euroBond: { label: 'Eurobond', volatility: 0.001, dailyRate: 0.0003, color: '#38A169', description: "Like lending to reliable organizations who pay you back with interest." },
  equityFund: { label: 'Equity Fund', volatility: 0.004, dailyRate: 0.0006, color: '#805AD5', description: "Own parts of successful companies. More ups and downs, but potentially higher growth." },
};

// Helper function to format currency
const formatCurrency = (value: number): string => {
  return `GHS ${value.toFixed(2)}`;
};

// Helper function to format percentage
const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};

const SimulationResultsScreen = () => {
  const navigation = useNavigation<SimulationResultsScreenNavigationProp>();
  const route = useRoute<SimulationResultsRouteProp>();
  const { amount, investmentType, days, deposits, frequency } = route.params;
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const chartAnim = useRef(new Animated.Value(0)).current;

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('compare'); // 'compare', 'ideal', or 'real'
  
  // Calculated results
  const [results, setResults] = useState({
    ideal: {
      finalAmount: 0,
      totalGain: 0,
      returnRate: 0,
      growthData: [] as {amount: number, day: number}[],
    },
    real: {
      finalAmount: 0,
      totalGain: 0,
      returnRate: 0,
      growthData: [] as {amount: number, day: number}[],
      worstDay: { day: 0, amount: 0 },
      bestDay: { day: 0, amount: 0 },
    },
    difference: {
      amount: 0,
      percentage: 0,
    }
  });

  // Animate on component mount
  useEffect(() => {
    // Simulate API loading
    setTimeout(() => {
      calculateResults();
      setIsLoading(false);

      // Start animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(chartAnim, {
          toValue: 1,
          duration: 900,
          delay: 200,
          useNativeDriver: false,
        })
      ]).start();
    }, 600);
  }, []);

  // Calculate simulation results
  const calculateResults = () => {
    const investmentInfo = INVESTMENT_TYPES[investmentType as keyof typeof INVESTMENT_TYPES] || INVESTMENT_TYPES.digiSave;
    const { dailyRate, volatility } = investmentInfo;
    
    // Initialize data
    let idealAmount = amount;
    let realAmount = amount;
    const idealData: {amount: number, day: number}[] = [{amount, day: 0}];
    const realData: {amount: number, day: number}[] = [{amount, day: 0}];
    
    let worstDay = { day: 0, amount };
    let bestDay = { day: 0, amount };

    // Track deposit days for markers
    const depositDays: number[] = [];
    
    // Calculate daily growth
    for (let day = 1; day <= days; day++) {
      // Add periodic deposits
      if (frequency > 0 && day % frequency === 0) {
        idealAmount += deposits;
        realAmount += deposits;
        depositDays.push(day);
      }
      
      // Apply daily growth (ideal - straight line)
      idealAmount *= (1 + dailyRate);
      
      // Apply daily growth with randomized volatility (realistic)
      const dailyVolatility = (Math.random() * 2 - 1) * volatility;
      const realDailyRate = dailyRate + dailyVolatility;
      realAmount *= (1 + realDailyRate);

      // Validate values
      if (isNaN(idealAmount) || !isFinite(idealAmount)) idealAmount = amount;
      if (isNaN(realAmount) || !isFinite(realAmount)) realAmount = amount;
      
      // Update data at intervals
      const interval = Math.max(1, Math.floor(days / 12)); // Fewer points for clarity
      if (day % interval === 0 || day === days) {
        idealData.push({amount: idealAmount, day});
        realData.push({amount: realAmount, day});
      }
      
      // Track best and worst days
      if (realAmount < worstDay.amount) {
        worstDay = { day, amount: realAmount };
      }
      if (realAmount > bestDay.amount) {
        bestDay = { day, amount: realAmount };
      }
    }

    // Calculate total deposits
    const totalDeposits = amount + (Math.floor(days / frequency) * deposits);

    // Calculate gains
    const idealGain = idealAmount - totalDeposits;
    const realGain = realAmount - totalDeposits;

    // Calculate returns
    const idealReturn = idealGain / totalDeposits;
    const realReturn = realGain / totalDeposits;

    // Calculate difference
    const difference = realAmount - idealAmount;
    const differencePercentage = (difference / idealAmount);
    
    // Set results
    setResults({
      ideal: {
        finalAmount: idealAmount,
        totalGain: idealGain,
        returnRate: idealReturn,
        growthData: idealData,
      },
      real: {
        finalAmount: realAmount,
        totalGain: realGain,
        returnRate: realReturn,
        growthData: realData,
        worstDay,
        bestDay,
      },
      difference: {
        amount: difference,
        percentage: differencePercentage,
      }
    });
  };

  // Get chart data based on active tab
  const getChartData = () => {
    const { ideal, real } = results;
    const idealColor = INVESTMENT_TYPES[investmentType as keyof typeof INVESTMENT_TYPES]?.color || colors.emerald.DEFAULT;
    const realColor = '#F59E0B'; // Amber
    
    if (activeTab === 'ideal') {
      return {
        labels: ideal.growthData.map(point => `${point.day}`),
        datasets: [{
          data: ideal.growthData.map(point => point.amount),
          color: () => idealColor,
          strokeWidth: 3
        }]
      };
    } else if (activeTab === 'real') {
      return {
        labels: real.growthData.map(point => `${point.day}`),
        datasets: [{
          data: real.growthData.map(point => point.amount),
          color: () => realColor,
          strokeWidth: 3
        }]
      };
    } else {
      // Comparison view (default)
      return {
        labels: ideal.growthData.map(point => `${point.day}`),
        datasets: [
          {
            data: ideal.growthData.map(point => point.amount),
            color: () => idealColor,
            strokeWidth: 3
          },
          {
            data: real.growthData.map(point => point.amount),
            color: () => realColor,
            strokeWidth: 3
          }
        ]
      };
    }
  };

  // Handle retry button
  const handleRetry = () => {
    navigation.goBack();
  };

  // Handle real investment button
  const handleRealInvestment = () => {
    navigation.navigate('Home');
  };

  // Get result icon based on difference
  const getResultIcon = () => {
    if (results.difference.amount > 0) {
      return <MaterialCommunityIcons name="trending-up" size={24} color={colors.emerald.DEFAULT} />;
    } else if (results.difference.amount < 0) {
      return <MaterialCommunityIcons name="trending-down" size={24} color="#E53E3E" />;
    } else {
      return <MaterialCommunityIcons name="minus" size={24} color={colors.gray.DEFAULT} />;
    }
  };

  return (
    <Container>
      <LinearGradient
        colors={['#f0fff4', '#ffffff']}
        style={styles.gradient}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <MaterialCommunityIcons name="finance" size={48} color={colors.emerald.DEFAULT} />
            <Text style={styles.loadingText}>
              Running simulation...
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <Animated.View
              style={[
                styles.header,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
              ]}
            >
              <View style={styles.headerTop}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleRetry}
                >
                  <MaterialCommunityIcons name="chevron-left" size={28} color={colors.emerald.DEFAULT} />
                </TouchableOpacity>
                <Text style={styles.investmentType}>
                  {INVESTMENT_TYPES[investmentType as keyof typeof INVESTMENT_TYPES]?.label || 'Investment'} Preview
                </Text>
              </View>
            </Animated.View>

            {/* Results Card */}
            <Animated.View
              style={[
                styles.resultsCard,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
              ]}
            >
              <View style={styles.resultsSummary}>
                <View style={styles.startedWith}>
                  <Text style={styles.startedLabel}>Started with</Text>
                  <Text style={styles.startedValue}>{formatCurrency(amount)}</Text>
                  {deposits > 0 && (
                    <Text style={styles.depositsValue}>
                      +{formatCurrency(deposits)} every {frequency} days
                    </Text>
                  )}
                </View>

                <View style={styles.resultValues}>
                  <View style={styles.resultItem}>
                    <View style={styles.valueWrapper}>
                      <View style={[styles.colorIndicator, {backgroundColor: INVESTMENT_TYPES[investmentType as keyof typeof INVESTMENT_TYPES]?.color || colors.emerald.DEFAULT}]} />
                      <Text style={styles.resultLabel}>Ideal</Text>
                    </View>
                    <Text style={styles.resultFinalAmount}>{formatCurrency(results.ideal.finalAmount)}</Text>
                  </View>

                  <View style={styles.resultItem}>
                    <View style={styles.valueWrapper}>
                      <View style={[styles.colorIndicator, {backgroundColor: '#F59E0B'}]} />
                      <Text style={styles.resultLabel}>Real</Text>
                    </View>
                    <Text style={styles.resultFinalAmount}>{formatCurrency(results.real.finalAmount)}</Text>
                  </View>
                </View>

                <View style={styles.diffContainer}>
                  <View style={styles.diffLeft}>
                    {getResultIcon()}
                    <Text style={styles.diffLabel}>Difference</Text>
                  </View>

                  <Text style={[
                    styles.diffValue,
                    results.difference.amount >= 0 ? styles.positiveValue : styles.negativeValue
                  ]}>
                    {results.difference.amount >= 0 ? '+' : ''}{formatCurrency(results.difference.amount)} ({results.difference.amount >= 0 ? '+' : ''}{formatPercentage(results.difference.percentage)})
                  </Text>
                </View>
              </View>
            </Animated.View>
            
            {/* Chart Card */}
            <Animated.View
              style={[
                styles.chartCard,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
              ]}
            >
              {/* Chart Tabs */}
              <View style={styles.chartTabs}>
                <TouchableOpacity
                  style={[styles.tab, activeTab === 'compare' && styles.activeTab]}
                  onPress={() => setActiveTab('compare')}
                >
                  <Text style={[styles.tabText, activeTab === 'compare' && styles.activeTabText]}>
                    Compare
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tab, activeTab === 'ideal' && styles.activeTab]}
                  onPress={() => setActiveTab('ideal')}
                >
                  <Text style={[styles.tabText, activeTab === 'ideal' && styles.activeTabText]}>
                    Ideal
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tab, activeTab === 'real' && styles.activeTab]}
                  onPress={() => setActiveTab('real')}
                >
                  <Text style={[styles.tabText, activeTab === 'real' && styles.activeTabText]}>
                    Real
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Chart */}
              <Animated.View style={{ opacity: chartAnim, marginVertical: 8 }}>
                <LineChart
                  data={getChartData()}
                  width={Dimensions.get('window').width - 48}
                  height={180}
                  withInnerLines={false}
                  withOuterLines={false}
                  withHorizontalLabels={true}
                  withVerticalLabels={false}
                  fromZero={false}
                  chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    propsForDots: {
                      r: '3',
                      strokeWidth: '1',
                      stroke: '#ffffff',
                    },
                    propsForBackgroundLines: {
                      strokeDasharray: '5, 5',
                      stroke: '#e0e0e0',
                    },
                  }}
                  bezier
                  style={styles.chart}
                />
              </Animated.View>
              
              {/* Chart Legend */}
              {activeTab === 'compare' && (
                <View style={styles.legendContainer}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: INVESTMENT_TYPES[investmentType as keyof typeof INVESTMENT_TYPES]?.color || colors.emerald.DEFAULT }]} />
                    <Text style={styles.legendText}>Ideal Growth</Text>
                  </View>

                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                    <Text style={styles.legendText}>Real Growth</Text>
                  </View>
                </View>
              )}

              {/* Quick Stats */}
              {activeTab === 'real' && (
                <View style={styles.quickStats}>
                  <View style={styles.statItem}>
                    <MaterialCommunityIcons name="arrow-up-bold" size={16} color="#38A169" />
                    <Text style={styles.statLabel}>High</Text>
                    <Text style={styles.statValue}>{formatCurrency(results.real.bestDay.amount)}</Text>
                  </View>
                  
                  <View style={styles.statSeparator} />

                  <View style={styles.statItem}>
                    <MaterialCommunityIcons name="arrow-down-bold" size={16} color="#E53E3E" />
                    <Text style={styles.statLabel}>Low</Text>
                    <Text style={styles.statValue}>{formatCurrency(results.real.worstDay.amount)}</Text>
                  </View>
                </View>
              )}
            </Animated.View>
            
            {/* Learning Bite Card */}
            <Animated.View
              style={[
                styles.biteCard,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
              ]}
            >
              <View style={styles.biteContent}>
                <MaterialCommunityIcons name="lightbulb-outline" size={22} color={colors.emerald.DEFAULT} />
                <Text style={styles.biteText}>
                  {INVESTMENT_TYPES[investmentType as keyof typeof INVESTMENT_TYPES]?.description ||
                  "Investing is like planting a seed that grows over time. Patience is key!"}
                </Text>
              </View>

              {activeTab === 'real' && (
                <Text style={styles.biteFooter}>
                  Markets naturally go up and down. Temporary drops are normal!
                </Text>
              )}
            </Animated.View>
            
            {/* Action Buttons */}
            <Animated.View
              style={[
                styles.buttonContainer,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
              ]}
            >
              <Button
                title="Try New Values"
                onPress={handleRetry}
                variant="outline"
                size="medium"
              />
              
              <Button
                title="Invest For Real"
                onPress={handleRealInvestment}
                variant="primary"
                size="medium"
              />
            </Animated.View>

          {/* Helper Text */}
          <Text style={styles.helperText}>
            This simulation helps build your financial confidence.
            All investments carry risk, but knowledge reduces fear.
          </Text>
        </ScrollView>
          )}
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.emerald.DEFAULT,
    fontWeight: '500',
    marginTop: 16,
  },
  header: {
    marginTop: 8,
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 4,
  },
  investmentType: {
    fontSize: 20,
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
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  startedWith: {
    alignItems: 'center',
    marginBottom: 16,
  },
  startedLabel: {
    fontSize: 14,
    color: colors.gray.DEFAULT,
    marginBottom: 4,
  },
  startedValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray.dark,
  },
  depositsValue: {
    fontSize: 14,
    color: colors.gray.DEFAULT,
    marginTop: 4,
  },
  resultValues: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  resultItem: {
    alignItems: 'center',
  },
  resultsCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultsSummary: {
    padding: 4,
  },
  valueWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray.dark,
  },
  resultFinalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray.dark,
  },
  diffContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.gray.light,
    paddingTop: 12,
    marginTop: 4,
  },
  diffLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  diffLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray.dark,
    marginLeft: 8,
  },
  diffValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  positiveValue: {
    color: colors.emerald.DEFAULT,
  },
  negativeValue: {
    color: '#E53E3E', // Red
  },
  chartCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTabs: {
    flexDirection: 'row',
    backgroundColor: colors.gray.light,
    borderRadius: 12,
    padding: 4,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: colors.emerald.DEFAULT,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray.dark,
  },
  activeTabText: {
    color: colors.white,
  },
  chart: {
    borderRadius: 8,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: colors.gray.DEFAULT,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    paddingHorizontal: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray.DEFAULT,
    marginLeft: 4,
    marginRight: 8,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.gray.dark,
  },
  statSeparator: {
    width: 1,
    height: '80%',
    backgroundColor: colors.gray.light,
  },
  biteCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  biteContent: {
    flexDirection: 'row',
    backgroundColor: 'rgba(72, 187, 120, 0.1)',
    borderRadius: 12,
    padding: 12,
  },
  biteText: {
    flex: 1,
    fontSize: 15,
    color: colors.gray.dark,
    marginLeft: 12,
    lineHeight: 20,
  },
  biteFooter: {
    fontSize: 13,
    color: colors.gray.DEFAULT,
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 7
  },
  helperText: {
    textAlign: 'center',
    color: colors.gray.DEFAULT,
    fontSize: 14,
    marginTop: 5,
    marginBottom: 20,
  },
});

export default SimulationResultsScreen;