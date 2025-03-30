import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

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

const styles = StyleSheet.create({
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
});

export default ChallengeFilters;