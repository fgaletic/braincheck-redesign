import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PhoneFrame } from './src/components/PhoneFrame';
import { InstructionsScreen } from './src/screens/InstructionsScreen';
import { MainScreen } from './src/screens/MainScreen';
import { NewTestScreen } from './src/screens/NewTestScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { ResultScreen } from './src/screens/ResultScreen';
import { ScanScreen } from './src/screens/ScanScreen';
import { TimerScreen } from './src/screens/TimerScreen';
import { AppProvider, useApp } from './src/state/store';

function Router() {
  const { top } = useApp();
  switch (top.name) {
    case 'onboarding':
      return <OnboardingScreen />;
    case 'main':
      return <MainScreen />;
    case 'newTest':
      return <NewTestScreen />;
    case 'instructions':
      return <InstructionsScreen />;
    case 'timer':
      return <TimerScreen />;
    case 'scan':
      return <ScanScreen />;
    case 'result':
      return <ResultScreen id={top.id} />;
  }
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <PhoneFrame>
          <Router />
        </PhoneFrame>
        <StatusBar style="dark" />
      </AppProvider>
    </SafeAreaProvider>
  );
}
