// src/components/form/FormDropdown.tsx
import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  FlatList,
  Animated
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../../theme/color';

interface FormDropdownProps {
  label: string;
  placeholder: string;
  options: string[];
  value: string;
  onSelect: (value: string) => void;
}

const FormDropdown = ({ 
  label, 
  placeholder, 
  options, 
  value, 
  onSelect 
}: FormDropdownProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const handlePress = () => {
    // Pulse animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
    
    setModalVisible(true);
  };
  
  const handleSelect = (option: string) => {
    onSelect(option);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity 
          style={[
            styles.dropdownButton,
            value ? styles.dropdownButtonSelected : null
          ]} 
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <Text 
            style={[
              styles.dropdownButtonText,
              value ? styles.dropdownButtonTextSelected : null
            ]}
          >
            {value || placeholder}
          </Text>
          <MaterialCommunityIcons 
            name="chevron-down" 
            size={20} 
            color={value ? colors.emerald.DEFAULT : colors.gray.DEFAULT} 
          />
        </TouchableOpacity>
      </Animated.View>
      
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons 
                  name="close" 
                  size={24} 
                  color={colors.gray.dark} 
                />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[
                    styles.optionItem,
                    item === value ? styles.optionItemSelected : null
                  ]} 
                  onPress={() => handleSelect(item)}
                >
                  <Text 
                    style={[
                      styles.optionText,
                      item === value ? styles.optionTextSelected : null
                    ]}
                  >
                    {item}
                  </Text>
                  {item === value && (
                    <MaterialCommunityIcons 
                      name="check" 
                      size={20} 
                      color={colors.emerald.DEFAULT} 
                    />
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray.dark,
    marginBottom: 8,
  },
  dropdownButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray.light,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  dropdownButtonSelected: {
    borderColor: colors.emerald.DEFAULT,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: colors.gray.DEFAULT,
  },
  dropdownButtonTextSelected: {
    color: colors.gray.dark,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray.light,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gray.dark,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray.light,
  },
  optionItemSelected: {
    backgroundColor: 'rgba(72, 187, 120, 0.1)',
  },
  optionText: {
    fontSize: 16,
    color: colors.gray.dark,
  },
  optionTextSelected: {
    fontWeight: '500',
    color: colors.emerald.DEFAULT,
  },
});

export default FormDropdown;