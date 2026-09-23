import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { RouterProvider } from 'react-router/dom';
import { router } from './routes';
import { theme } from './style/goblinTheme'

export default function App() {
  return (

  <MantineProvider theme={theme} defaultColorScheme='light'>
    <RouterProvider router={router}/>
  </MantineProvider>
  );
}
