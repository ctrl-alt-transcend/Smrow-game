import { useDisclosure } from '@mantine/hooks';
import { Drawer } from '@mantine/core';
import GenericButton from './GenericButton';
import { AuthenticationForm } from '../authentification/AuthenticationForm';

export default function RegisterDrawer() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Drawer offset={8} radius="md" opened={opened} onClose={close}>
        { <AuthenticationForm/> }
      </Drawer>
      <GenericButton label='login' onClick={open}/>
    </>
  );
}