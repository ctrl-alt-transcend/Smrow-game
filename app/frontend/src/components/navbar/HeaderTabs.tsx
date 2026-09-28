import { useState } from 'react';
import {
  IconChevronDown,
  IconHeart,
  IconLogout,
  IconMessage,
  IconSettings,
  IconStar,
  IconSwitchHorizontal,
} from '@tabler/icons-react';
import cx from 'clsx';
import {
  Avatar,
  Burger,
  Container,
  Divider,
  Drawer,
  Group,
  Menu,
  ScrollArea,
  Button,
  Text,
  UnstyledButton,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import classes from './HeaderTabs.module.css';
import { Link, useLocation } from 'react-router';
import { navLinks } from './navLinks';

const user = {
  name: 'Mr. Goblin',
  email: 'goblins@fighter.dev',
  image: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-5.png',
};

export function HeaderTabs() {
  const theme = useMantineTheme();
  const location = useLocation();
  const [opened, { toggle, close }] = useDisclosure(false);
  const [userMenuOpened, setUserMenuOpened] = useState(false);

  return (
    <div className={classes.header}>
      <Container className={classes.mainSection} size="md">
        <Group justify="space-between">
          <Text>Build by Goblins</Text>

          <Group gap="xs" visibleFrom="sm" component="nav">
            {navLinks.map((link) => (
              <Button
                key={link.to}
                component={Link}
                to={link.to}
                variant={location.pathname === link.to ? 'light' : 'subtle'}
              >
                {link.label}
              </Button>
            ))}
          </Group>

          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="xs"
            size="sm"
            aria-label="Toggle navigation"
          />

          <Menu
            width={260}
            position="bottom-end"
            transitionProps={{ transition: 'pop-top-right' }}
            onClose={() => setUserMenuOpened(false)}
            onOpen={() => setUserMenuOpened(true)}
            withinPortal
          >
            <Menu.Target>
              <UnstyledButton
                className={cx(classes.user, { [classes.userActive]: userMenuOpened })}
              >
                <Group gap={7}>
                  <Avatar src={user.image} alt="" radius="xl" size={20} />
                  <Text fw={500} size="sm" lh={1} mr={3}>
                    {user.name}
                  </Text>
                  <IconChevronDown size={12} stroke={1.5} />
                </Group>
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconHeart size={16} color={theme.colors.red[6]} stroke={1.5} />}
              >
                Liked posts
              </Menu.Item>
              <Menu.Item
                leftSection={<IconStar size={16} color={theme.colors.yellow[6]} stroke={1.5} />}
              >
                Saved posts
              </Menu.Item>
              <Menu.Item
                leftSection={<IconMessage size={16} color={theme.colors.blue[6]} stroke={1.5} />}
              >
                Your comments
              </Menu.Item>

              <Menu.Label>Settings</Menu.Label>
              <Menu.Item leftSection={<IconSettings size={16} stroke={1.5} />}>
                Account settings
              </Menu.Item>
              <Menu.Item leftSection={<IconSwitchHorizontal size={16} stroke={1.5} />}>
                Change account
              </Menu.Item>
              <Menu.Item leftSection={<IconLogout size={16} stroke={1.5} />}>Logout</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Container>

      <Drawer
        opened={opened}
        onClose={close}
        size="100%"
        padding="md"
        title="Navigation"
        hiddenFrom="xs"
        zIndex={1000000}
      >
        <ScrollArea h="calc(100vh - 80px" mx="-md">
          <Divider my="sm" />
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={classes.drawerLink}
              onClick={close}
            >
              {link.label}
            </Link>
          ))}
        </ScrollArea>
      </Drawer>
    </div>
  );
}