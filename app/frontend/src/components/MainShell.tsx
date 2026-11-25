import CardImage from "./Card";
import { LoginPanel } from "./form/LoginPanel";
import {
  Anchor,
  AppShell,
  BackgroundImage,
  Grid,
  Group,
  Image,
  Text,
  Title,
  Stack,
} from "@mantine/core";

import { notifications } from "@mantine/notifications";

import { useEffect } from "react";
import { Link, Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";

import "@mantine/notifications/styles.css";

export default function MainShell() {
  const { user, authMessage, clearAuthMessage } = useAuth();

  useEffect(() => {
    if (authMessage) {
      const msg = authMessage;
      clearAuthMessage();
      notifications.show({
        title: "Disconnected",
        message: msg,
        color: "Red",
      });
      clearAuthMessage();
    }
  }, [authMessage, clearAuthMessage]);

  if (user) return <Navigate to="/home" replace />;

  return (
    <AppShell
      mih="100vh"
      mode="static"
      header={{ height: { base: 100, md: 200 } }}
      footer={{ height: 60 }}
      padding="xs"
    >
      <AppShell.Header>
        <BackgroundImage
          src="assets/landing.webp"
          h="100%"
          w="100%"
          style={{
            objectFit: "cover",
            position: "absolute",
            inset: 0,
          }}
        >
          <Group h="100%" px="md" justify="center">
            <Title c={"Cream"} fz={{ base: "h3", md: "h1" }}>
              This is Da Game
            </Title>
          </Group>
        </BackgroundImage>
      </AppShell.Header>

      <AppShell.Main>
        <Grid>
          <Grid.Col span={{ base: 12, md: 8 }} order={{ base: 2, md: 1 }}>
            <Title order={1} c={"Red"} fz={{ base: "h3", md: "h1" }}>
              Amazing Catan
            </Title>
            <CardImage />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }} order={{ base: 1, md: 2 }}>
            <Stack gap="md">
              <LoginPanel />
              <Image src="/assets/zuck.webp" radius="md" alt="" />
            </Stack>
          </Grid.Col>
        </Grid>
      </AppShell.Main>

      <AppShell.Footer>
        <Stack h="100%" justify="center" align="flex-start" gap={2} px="md">
          <Text size="md" c="dimmed">
            Legal
          </Text>
          <Group>
            <Anchor component={Link} to="/privacy">
              Privacy Policy
            </Anchor>
            <Anchor component={Link} to="/terms">
              Term of Service
            </Anchor>
          </Group>
        </Stack>
      </AppShell.Footer>
    </AppShell>
  );
}
