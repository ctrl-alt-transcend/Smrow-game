import { MantineProvider } from '@mantine/core';
import { RouterProvider } from 'react-router/dom';
import { ModalsProvider } from '@mantine/modals';
import { router } from './routes';
import { theme } from './style/goblinTheme'

export default function App() {
  return (

  <MantineProvider theme={theme} defaultColorScheme='light'>
    <ModalsProvider>
      <RouterProvider router={router}/>
    </ModalsProvider>
  </MantineProvider>
  );
}
