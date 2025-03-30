import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions, Linking } from 'react-native';
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
    simData: {
      fund: string;
      amount: number;
      days: number;
      deposit: string;
      frequency: string;
      ideal: { values: number[]; final: number };
      real: { values: number[]; final: number };
      difference: number;
      desc: string;
    };
  };
};

type SimulationResultsRouteProp = RouteProp<RootStackParamList, 'SimulationResults'>;
type SimulationResultsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SimulationResults'
>;

const INVESTMENT_TYPES = [
  { label: 'DigiSave', value: 'DigiSave', color: '#4299E1', icon: 'shield-check', description: 'A secure savings option with minimal risk.' },
  { label: 'Eurobond', value: 'Eurobond', color: '#38A169', icon: 'scale-balance', description: 'A stable investment in international bonds.' },
  { label: 'GlobalTech', value: 'GlobalTech', color: '#D69E2E', icon: 'rocket-launch', description: 'A high-growth investment in global technology.' },
];

const formatCurrency = (value: number): string => `GHS ${value.toFixed(2)}`;
const formatPercentage = (value: number): string => `${(value * 100).toFixed(1)}%`;

const openAnotherApp = () => {
  const appUrl = 'market://details?id=com.achieve.app'; // Replace with the package name of the app
  Linking.openURL(appUrl).catch((err) => console.error('An error occurred', err));
};

const SimulationResultsScreen = () => {
  const navigation = useNavigation<SimulationResultsScreenNavigationProp>();
  const route = useRoute<SimulationResultsRouteProp>();
  const { simData } = route.params;
  const deposits = simData.deposit ? Number(simData.deposit) : 0;
  const frequency = simData.frequency;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const chartAnim = useRef(new Animated.Value(0)).current;

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('compare');
  const [results, setResults] = useState({
    ideal: { finalAmount: 0, growthData: [] as { amount: number, day: number }[] },
    real: { finalAmount: 0, growthData: [] as { amount: number, day: number }[] },
    difference: { amount: 0, percentage: 0 },
  });

  // Map simData to results
  useEffect(() => {
    setResults({
      ideal: {
        finalAmount: simData.ideal.final,
        growthData: simData.ideal.values.map((value, i) => ({ amount: value, day: i })),
      },
      real: {
        finalAmount: simData.real.final,
        growthData: simData.real.values.map((value, i) => ({ amount: value, day: i })),
      },
      difference: {
        amount: simData.difference,
        percentage: simData.difference / simData.ideal.final, // Local calc
      },
    });
    setIsLoading(false);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      Animated.timing(chartAnim, { toValue: 1, duration: 900, delay: 200, useNativeDriver: false }),
    ]).start();
  }, [simData]);

  // Calculate an appropriate step size based on the number of days
  const step = Math.max(1, Math.floor(simData.days / 6)); // Show about 6 labels on the x-axis

  const getChartData = () => {
    const { ideal, real } = results;
    const investment = INVESTMENT_TYPES.find(type => type.value === simData.fund);
    const idealColor = investment?.color || colors.emerald.DEFAULT;
    const realColor = '#F59E0B';

    // Create labels for x-axis (days)
    const generateLabels = () => {
      // Generate labels at regular intervals plus the last day
      const intervalLabels = [];
      for (let i = 0; i <= simData.days; i += step) {
        if (i <= simData.days) {
          intervalLabels.push(i.toString());
        }
      }
      
      // Make sure the last day is included
      if (!intervalLabels.includes(simData.days.toString())) {
        intervalLabels.push(simData.days.toString());
      }
      
      return intervalLabels;
    };

    if (activeTab === 'ideal') {
      return {
        labels: generateLabels(),
        datasets: [{ 
          data: ideal.growthData.filter((_, i) => i % step === 0 || i === ideal.growthData.length - 1).map(point => point.amount), 
          color: () => idealColor, 
          strokeWidth: 3 
        }],
      };
    } else if (activeTab === 'real') {
      return {
        labels: generateLabels(),
        datasets: [{ 
          data: real.growthData.filter((_, i) => i % step === 0 || i === real.growthData.length - 1).map(point => point.amount), 
          color: () => realColor, 
          strokeWidth: 3 
        }],
      };
    } else {
      // For compare tab, ensure both datasets use the same x-axis points
      return {
        labels: generateLabels(),
        datasets: [
          { 
            data: ideal.growthData.filter((_, i) => i % step === 0 || i === ideal.growthData.length - 1).map(point => point.amount), 
            color: () => idealColor, 
            strokeWidth: 3 
          },
          { 
            data: real.growthData.filter((_, i) => i % step === 0 || i === real.growthData.length - 1).map(point => point.amount), 
            color: () => realColor, 
            strokeWidth: 3 
          },
        ],
      };
    }
  };

  const handleRetry = () => navigation.goBack();
  // const handleRealInvestment = () => navigation.navigate('Home');

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
      <LinearGradient colors={['#f0fff4', '#ffffff']} style={styles.gradient}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <MaterialCommunityIcons name="finance" size={48} color={colors.emerald.DEFAULT} />
            <Text style={styles.loadingText}>Running simulation...</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <View style={styles.headerTop}>
                <TouchableOpacity style={styles.backButton} onPress={handleRetry}>
                  <MaterialCommunityIcons name="chevron-left" size={28} color={colors.emerald.DEFAULT} />
                </TouchableOpacity>
                <Text style={styles.investmentType}>
                  {INVESTMENT_TYPES.find(type => type.value === simData.fund)?.label || 'Investment'} Preview
                </Text>
              </View>
            </Animated.View>

            <Animated.View style={[styles.resultsCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <View style={styles.resultsSummary}>
                <View style={styles.startedWith}>
                  <Text style={styles.startedLabel}>Started with</Text>
                  <Text style={styles.startedValue}>{formatCurrency(simData.amount)}</Text>
                  {simData.deposit && Number(simData.deposit) > 0 && (
                    <Text style={styles.depositsValue}>+{formatCurrency(deposits)} {frequency}</Text>
                  )}
                </View>
                <View style={styles.resultValues}>
                  <View style={styles.resultItem}>
                    <View style={styles.valueWrapper}>
                      <View style={[styles.colorIndicator, { backgroundColor: INVESTMENT_TYPES.find(type => type.value === simData.fund)?.color || colors.emerald.DEFAULT }]} />
                      <Text style={styles.resultLabel}>Ideal</Text>
                    </View>
                    <Text style={styles.resultFinalAmount}>{formatCurrency(results.ideal.finalAmount)}</Text>
                  </View>
                  <View style={styles.resultItem}>
                    <View style={styles.valueWrapper}>
                      <View style={[styles.colorIndicator, { backgroundColor: '#F59E0B' }]} />
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
                  <Text style={[styles.diffValue, results.difference.amount >= 0 ? styles.positiveValue : styles.negativeValue]}>
                    {results.difference.amount >= 0 ? '+' : ''}{formatCurrency(results.difference.amount)} ({results.difference.amount >= 0 ? '+' : ''}{formatPercentage(results.difference.percentage)})
                  </Text>
                </View>
              </View>
            </Animated.View>

            <Animated.View style={[styles.chartCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <View style={styles.chartTabs}>
                <TouchableOpacity style={[styles.tab, activeTab === 'compare' && styles.activeTab]} onPress={() => setActiveTab('compare')}>
                  <Text style={[styles.tabText, activeTab === 'compare' && styles.activeTabText]}>Compare</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, activeTab === 'ideal' && styles.activeTab]} onPress={() => setActiveTab('ideal')}>
                  <Text style={[styles.tabText, activeTab === 'ideal' && styles.activeTabText]}>Ideal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, activeTab === 'real' && styles.activeTab]} onPress={() => setActiveTab('real')}>
                  <Text style={[styles.tabText, activeTab === 'real' && styles.activeTabText]}>Real</Text>
                </TouchableOpacity>
              </View>
              <Animated.View style={{ opacity: chartAnim, marginVertical: 8 }}>
                <LineChart
                  data={getChartData()}
                  width={Dimensions.get('window').width - 48}
                  height={180}
                  withInnerLines={false}
                  withOuterLines={false}
                  withHorizontalLabels={true}
                  withVerticalLabels={true}
                  fromZero={false}
                  chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    propsForDots: { r: '3', strokeWidth: '1', stroke: '#ffffff' },
                    propsForBackgroundLines: { strokeDasharray: '5, 5', stroke: '#e0e0e0' },
                  }}
                  bezier
                  style={styles.chart}
                />
              </Animated.View>
              {activeTab === 'compare' && (
                <View style={styles.legendContainer}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: INVESTMENT_TYPES.find(type => type.value === simData.fund)?.color || colors.emerald.DEFAULT }]} />
                    <Text style={styles.legendText}>Ideal Growth</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                    <Text style={styles.legendText}>Real Growth</Text>
                  </View>
                </View>
              )}
            </Animated.View>

            <Animated.View style={[styles.biteCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <View style={styles.biteContent}>
                <MaterialCommunityIcons name="lightbulb-outline" size={22} color={colors.emerald.DEFAULT} />
                <Text style={styles.biteText}>
                  {INVESTMENT_TYPES.find(type => type.value === simData.fund)?.description ||
                    'Investing is like planting a seed that grows over time. Patience is key!'}
                </Text>
              </View>
              {activeTab === 'real' && (
                <Text style={styles.biteFooter}>Markets naturally go up and down. Temporary drops are normal!</Text>
              )}
            </Animated.View>

            <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <Button title="Try New Values" onPress={handleRetry} variant="outline" size="medium" />
              <Button title="Invest For Real" onPress={openAnotherApp} variant="primary" size="medium" />
            </Animated.View>

            <Text style={styles.helperText}>
              This simulation helps build your financial confidence. All investments carry risk, but knowledge reduces fear.
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