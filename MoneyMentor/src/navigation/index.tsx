// src/navigation/index.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreens';
import SimulationInputScreen from '../screens/SimulationInputScreen';
import SimulationResultsScreen from '../screens/SimulationResultsScreen';
import ChallengeSetupScreen from '../screens/ChallengeSetupScreen';

export type RootStackParamList = {
  Home: undefined;
  Quiz: undefined;
  SimulationInput: undefined;
  SimulationResults: {
    amount: number;
    investmentType: string;
    days: number;
    deposits: number;
    frequency: number
  }
  ChallengeSetup: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="SimulationInput" component={SimulationInputScreen} />
      <Stack.Screen name="SimulationResults" component={SimulationResultsScreen} />
      <Stack.Screen name="ChallengeSetup" component={ChallengeSetupScreen} />
    </Stack.Navigator>
  );
};

export default RootNavigator;