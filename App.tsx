import { ScreenContent } from 'components/ScreenContent';
import { ThemeProvider } from "./contexts/ThemeContext"
import { StatusBar } from 'expo-status-bar';

import './global.css';

export default function App() {
  return (
    <>
      <ThemeProvider>
        <ScreenContent />
      </ThemeProvider>
      <StatusBar style="auto" />
    </>
  );
}
