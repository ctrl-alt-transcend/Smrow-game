import GenericButton from './buttons/GenericButton';
import CardImage from './Card';

import {
  AppShell,
  BackgroundImage,
  Burger,
  Group,
  Text,
  Title
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

export default function MainShell()
{
  const [opened, { toggle }] = useDisclosure();
  return (
    <AppShell

      mode="static"
      header={{ height: 200 }}
      aside={{ width: 300, breakpoint: 'sm'}}
      padding="xs"
      style={{
      '--app-shell-border-color': 'var(--mantine-color-dark-4)',
      '--app-shell-border-width': '2px' }}
    >
      <AppShell.Header>

        <BackgroundImage
          src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwallpaperaccess.com%2Ffull%2F117951.jpg&f=1&nofb=1&ipt=b0cd04325308305c02bf1a7d5fe7b202f95ce1e12253a29225022b5eef822969"
          h="100%"
          w="100%"
          style={{
            objectFit: 'cover',
            position: 'absolute',
            inset: 0
          }}>
          <Group h="100%" px="md" justify='center'>
            <Title c={ 'Cream' }>
              This is Da Game
            </Title>
          </Group>
        </BackgroundImage>
      </AppShell.Header>

      <AppShell.Main>
        <Title order={1} c={ 'Red' }>
          Amazing Catan
        </Title>
        <CardImage></CardImage>
        <Text>
          Cras maximus mauris a nisl maximus porta efficitur ac lacus. Donec eget sapien magna. Suspendisse a orci tempus, viverra lacus a, tempus felis. In hac habitasse platea dictumst. Etiam et sodales sapien. Integer non eleifend odio. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum aliquam justo ac suscipit consequat. Vivamus porta ac dolor eget tincidunt. Vestibulum mollis eros lorem, a sodales arcu dapibus id. Duis imperdiet enim vitae augue venenatis, a rhoncus magna egestas. Nam id eleifend ligula, in iaculis velit.
        </Text>

        <GenericButton label='PLAY DA GAME' h={150} mt={30} mb={30}/>
        
      </AppShell.Main>

      <AppShell.Aside
        h="100%"
        p="xs"
        zIndex={20}>
        <Group px="md">
          <AppShell.Section p="xs">Login Panel</AppShell.Section>
        </Group>
      </AppShell.Aside>
      
      <AppShell.Footer>
        <Text>
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Deserunt aliquam aut quis ad, fuga impedit eveniet obcaecati nesciunt atque accusantium voluptatum harum sit voluptates molestias tenetur molestiae assumenda itaque deleniti!
        </Text>
      </AppShell.Footer>

    </AppShell>
  );
}