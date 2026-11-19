import CardImage from "./Card";
import { LoginPanel } from "./form/LoginPanel";
import {
  Anchor,
  AppShell,
  BackgroundImage,
  Group,
  Text,
  Title,
}
from "@mantine/core";

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
      header={{ height: 200 }}
      footer={{ height: 0 }}
      aside={{ width: 300, breakpoint: "sm" }}
      padding="xs"
    >
      <BackgroundImage
        src="https://github.com/makccr/wallpapers/blob/master/wallpapers/psychedelic/Alex%20Grey%20-%20Net%20of%20Being.jpg"
        h={"100%"}
        w={"100%"}
        style={{
          objectFit: "cover",
          position: "absolute",
          inset: 0,
        }}
      />

      <AppShell.Header>
        <BackgroundImage
          src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwallpaperaccess.com%2Ffull%2F117951.jpg&f=1&nofb=1&ipt=b0cd04325308305c02bf1a7d5fe7b202f95ce1e12253a29225022b5eef822969"
          h="100%"
          w="100%"
          style={{
            objectFit: "cover",
            position: "absolute",
            inset: 0,
          }}
        >
          <Group h="100%" px="md" justify="center">
            <Title c={"Cream"}>This is Da Game</Title>
          </Group>
        </BackgroundImage>
      </AppShell.Header>

      <AppShell.Main>
        <Title order={1} c={"Red"}>
          Amazing Catan
        </Title>
        <CardImage />
      </AppShell.Main>

      <AppShell.Aside h="100%" p="xs" zIndex={20}>
        <LoginPanel />
      </AppShell.Aside>

      <AppShell.Footer>
        <Text size="md" c="dimmed">
          Legal
        </Text>
        <Group justify="flex">
          <Anchor component={Link} to="/privacy">
            Privacy Policy
          </Anchor>
          <Anchor component={Link} to="/terms">
            Term of Use
          </Anchor>
        </Group>
      </AppShell.Footer>
    </AppShell>
  );
}
