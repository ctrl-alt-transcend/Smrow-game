import { MantineProvider } from '@mantine/core';
import { RouterProvider } from 'react-router/dom';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications'
import { router } from './routes/routes';
import { theme } from './style/goblinTheme'

export default function App() {
  return (

  <MantineProvider theme={theme} defaultColorScheme='light'>
    <Notifications />
    <ModalsProvider>
      <RouterProvider router={router}/>
    </ModalsProvider>
  </MantineProvider>
  );
}
