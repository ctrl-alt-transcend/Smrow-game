import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import MainShell from './components/MainShell';

import { theme } from './style/goblinTheme'

export default function App() {
  return (
  <MantineProvider theme={theme} defaultColorScheme='light'>
    <MainShell/>
  </MantineProvider>
  );
}
