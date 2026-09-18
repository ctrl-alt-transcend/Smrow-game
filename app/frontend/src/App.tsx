import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import MainShell from './components/MainShell';

export default function App() {
  return (
  <MantineProvider defaultColorScheme="dark">
    <MainShell/>
  </MantineProvider>
  );
}
