import { AppShell, BackgroundImage, Burger, Group, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import MainGrid from './MainGrid';
import MainNavbar from './MainNavbar';
import AddsStack from './AddsStack';
import GenericButton from './buttons/GenericButton';

export default function MainShell()
{
  const [opened, { toggle }] = useDisclosure();
  return (
    <AppShell
      mode="static"
      header={{ height: 200 }}
      navbar={{ width: 200, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      aside={{ width: 200, breakpoint: 'sm'}}
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
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            Header
          </Group>
        </BackgroundImage>
      </AppShell.Header>
      <AppShell.Navbar>
        <AppShell.Section p="xs">Navbar header</AppShell.Section>
          <MainNavbar/>
        <AppShell.Section p="md">Navbar footer – always at the bottom</AppShell.Section>
      </AppShell.Navbar>
      <AppShell.Main>
        <Text  >
          Cras maximus mauris a nisl maximus porta efficitur ac lacus. Donec eget sapien magna. Suspendisse a orci tempus, viverra lacus a, tempus felis. In hac habitasse platea dictumst. Etiam et sodales sapien. Integer non eleifend odio. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum aliquam justo ac suscipit consequat. Vivamus porta ac dolor eget tincidunt. Vestibulum mollis eros lorem, a sodales arcu dapibus id. Duis imperdiet enim vitae augue venenatis, a rhoncus magna egestas. Nam id eleifend ligula, in iaculis velit.
        </Text>
        <GenericButton label='PLAY DA GAME' h={150} mt={30} mb={30}/>
        <MainGrid/>
        <GenericButton label='PLAY DA GAME' h={150} mt={30} mb={30}/>
        <Text  >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer at rhoncus massa. Duis laoreet dapibus ipsum at luctus. Nulla sit amet erat sit amet felis consectetur vestibulum. Vestibulum pulvinar faucibus euismod. Integer ultricies ac justo sit amet dignissim. Curabitur ipsum quam, sodales id tempor aliquet, elementum vitae erat. In posuere et metus eu venenatis. Sed lorem nibh, tincidunt ut diam vel, volutpat blandit ex. Etiam vel justo feugiat, feugiat ante congue, dictum risus. Proin interdum dictum elit eu varius. Nulla tristique cursus odio, sit amet viverra nisi condimentum in. Nam nec laoreet eros, sed malesuada dolor. Praesent ullamcorper sodales ex, et vulputate diam tristique id. Suspendisse id egestas nulla. Pellentesque libero mauris, mattis eu semper vel, sodales ut mauris.
          Cras maximus mauris a nisl maximus porta efficitur ac lacus. Donec eget sapien magna. Suspendisse a orci tempus, viverra lacus a, tempus felis. In hac habitasse platea dictumst. Etiam et sodales sapien. Integer non eleifend odio. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum aliquam justo ac suscipit consequat. Vivamus porta ac dolor eget tincidunt. Vestibulum mollis eros lorem, a sodales arcu dapibus id. Duis imperdiet enim vitae augue venenatis, a rhoncus magna egestas. Nam id eleifend ligula, in iaculis velit.
          Sed ultricies, velit in dapibus pellentesque, nisl nulla vestibulum nulla, a vehicula nisl elit in ligula. Nam maximus risus odio. Phasellus in lacus sed leo sagittis euismod. Integer faucibus luctus mauris et ultricies. Aenean ut nibh gravida, imperdiet sapien ut, interdum lectus. Sed dapibus lacus eu nisl dapibus consectetur. Sed egestas lectus vel mi viverra vestibulum. Nullam maximus metus nibh, ac pellentesque felis pulvinar et. Pellentesque sem lectus, dignissim eu laoreet nec, euismod quis nunc. Morbi porttitor faucibus tellus, a bibendum lorem tincidunt eu. Vestibulum faucibus interdum ipsum et venenatis. Vestibulum porta semper dictum.
          Cras efficitur tristique tortor in pellentesque. Donec eu accumsan elit. Curabitur pulvinar nulla nisl, eget semper purus placerat quis. Mauris sagittis efficitur convallis. Vestibulum pretium in nisl nec commodo. Maecenas eu vulputate sem. Pellentesque lobortis lectus ornare quam ornare egestas. Fusce id ante at sem accumsan vulputate in eu turpis. Curabitur id tincidunt erat, et mattis leo.
          Morbi id nisi non nibh pharetra dapibus eu id augue. Nullam vel ornare nibh, vel rhoncus lorem. Pellentesque non ornare lacus. Mauris vel blandit urna. Aliquam tincidunt eros vel lorem pharetra, eget rhoncus nibh condimentum. Aliquam in elementum arcu. Praesent non ante volutpat, faucibus nibh nec, lacinia eros. Etiam venenatis, ante vel congue fringilla, ipsum augue hendrerit odio, non rhoncus orci risus eget enim. Nullam quam erat, hendrerit at vulputate ut, vestibulum ut ante. Mauris eget consequat nunc, a elementum augue. Nam iaculis convallis justo vitae hendrerit.
        </Text>
      </AppShell.Main>
      <AppShell.Aside>
        <AppShell.Section p="xs">AddsStack header</AppShell.Section>
          <AddsStack/>
        <AppShell.Section p="md">AddsStack footer – always at the bottom</AppShell.Section>
      </AppShell.Aside>
    </AppShell>
  );
}