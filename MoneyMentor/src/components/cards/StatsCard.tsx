import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { financeTheme } from './theme';

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

const styles = StyleSheet.create({
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
});

export default StatsCard;