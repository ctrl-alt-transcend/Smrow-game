import { useState } from "react";
import {
  IconChevronDown,
  IconFileText,
  IconLock,
  IconLogout,
} from "@tabler/icons-react";
import cx from "clsx";
import {
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
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import classes from "./HeaderTabs.module.css";
import { Link, useLocation } from "react-router";
import { navLinks } from "./navLinks";
import { useAuth } from "../../hooks/useAuth";

// const user = {
//   name: 'Mr. Goblin',
//   email: 'goblins@fighter.dev',
//   image: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-5.png',
// };

export function HeaderTabs() {
  const theme = useMantineTheme();
  const location = useLocation();
  const [opened, { toggle, close }] = useDisclosure(false);
  const [userMenuOpened, setUserMenuOpened] = useState(false);

  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      logout();
      localStorage.clear();
    } catch (errorMessage: any) {
      console.error(errorMessage);
    }
  };

  return (
    <div className={classes.header}>
      <Container className={classes.mainSection} size="md">
        <Group justify="space-between">
          <Text>Amazing Catan</Text>

          <Group gap="xs" visibleFrom="sm" component="nav">
            {navLinks.map((link) => (
              <Button
                key={link.to}
                component={Link}
                to={link.to}
                variant={location.pathname === link.to ? "light" : "subtle"}
              >
                {link.label}
              </Button>
            ))}
          </Group>

          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="sm"
            size="sm"
            aria-label="Toggle navigation"
          />

          <Menu
            width={260}
            position="bottom-end"
            transitionProps={{ transition: "pop-top-right" }}
            onClose={() => setUserMenuOpened(false)}
            onOpen={() => setUserMenuOpened(true)}
            withinPortal
          >
            <Menu.Target>
              <UnstyledButton
                visibleFrom="sm"
                className={cx(classes.user, {
                  [classes.userActive]: userMenuOpened,
                })}
              >
                <Group gap={7}>
                  {/* <Avatar src={user.image} alt="" radius="xl" size={20} /> */}
                  <Text fw={500} size="sm" lh={1} mr={3}>
                    {user?.name}
                  </Text>
                  <IconChevronDown size={12} stroke={1.5} />
                </Group>
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Legal</Menu.Label>

              <Menu.Item
                component={Link}
                to="/privacy"
                leftSection={
                  <IconLock
                    size={16}
                    color={theme.colors.dark[6]}
                    stroke={1.5}
                  />
                }
              >
                Privacy Policy
              </Menu.Item>
              <Menu.Item
                component={Link}
                to="/terms"
                leftSection={
                  <IconFileText
                    size={16}
                    color={theme.colors.dark[6]}
                    stroke={1.5}
                  />
                }
              >
                Terms of Service
              </Menu.Item>

              <Menu.Divider />
              <Menu.Item
                onClick={handleLogout}
                leftSection={
                  <IconLogout
                    size={16}
                    stroke={1.5}
                    color={theme.colors.red[6]}
                  />
                }
              >
                Logout
              </Menu.Item>
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
        hiddenFrom="sm"
        zIndex={1000000}
      >
        <ScrollArea h="calc(100vh - 80px)" mx="-md">
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
          <Divider my="sm" mx="md" color="gray.3" />
          <Link to="/privacy" className={classes.drawerLink} onClick={close}>
            Privacy Policy
          </Link>
          <Link to="/terms" className={classes.drawerLink} onClick={close}>
            Terms of Service
          </Link>
          <UnstyledButton
            className={classes.drawerLink}
            c="red"
            w="100%"
            p="md"
            fz="sm"
            fw={500}
            onClick={() => {
              close();
              handleLogout();
            }}
          >
            Logout
          </UnstyledButton>
        </ScrollArea>
      </Drawer>
    </div>
  );
}
