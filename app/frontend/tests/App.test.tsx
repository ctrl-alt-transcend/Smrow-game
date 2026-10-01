import { MantineProvider } from '@mantine/core';
import { RouterProvider } from 'react-router/dom';
import { router } from '../src/routes';
import { theme } from '../src/style/goblinTheme'

export default function App() {
  return (

  <MantineProvider theme={theme} defaultColorScheme='light'>
    <RouterProvider router={router}/>
  </MantineProvider>
  );
}
