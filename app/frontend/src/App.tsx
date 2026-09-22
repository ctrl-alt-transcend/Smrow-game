import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { RouterProvider } from 'react-router/dom';
import { router } from './routes';


export default function App() {
  return (
  <MantineProvider defaultColorScheme="dark">
    <RouterProvider router={router}/>
  </MantineProvider>
  );
}