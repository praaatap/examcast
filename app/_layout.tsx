import { Colors } from '@/constants/theme';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

export const unstable_settings = {
  anchor: '(tabs)',
};

const ExamCastTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.primary,
    background: Colors.background,
    card: Colors.surface,
    text: Colors.text,
    border: Colors.surfaceLight,
    notification: Colors.danger,
  },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={ExamCastTheme}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="teacher" />
        <Stack.Screen name="student" />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
