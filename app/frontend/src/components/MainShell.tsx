import CardImage from "./Card";
import { LoginPanel } from "./form/LoginPanel";
import {
  Anchor,
  AppShell,
  BackgroundImage,
  Box,
  Container,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useEffect } from "react";
import { Link, Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";

import "@mantine/notifications/styles.css";

export default function MainShell() {
  const { user, authMessage, clearAuthMessage } = useAuth();
  // Detecta móvil en horizontal o pantallas con poca altura
  const isShortScreen = useMediaQuery("(max-height: 540px)");

  useEffect(() => {
    if (authMessage) {
      const msg = authMessage;
      clearAuthMessage();
      notifications.show({
        title: "Disconnected",
        message: msg,
        color: "Red",
      });
    }
  }, [authMessage, clearAuthMessage]);

  if (user) return <Navigate to="/home" replace />;

  return (
    <AppShell
      mih="100dvh"
      mode="static"
      header={{ height: isShortScreen ? 56 : { base: 90, sm: 120 } }}
      footer={{ height: isShortScreen ? 44 : { base: 64, sm: 60 } }}
      aside={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: true, desktop: Boolean(isShortScreen) },
      }}
      padding={{ base: "xs", sm: "md" }}
    >
      <BackgroundImage
        src="https://raw.githubusercontent.com/makccr/wallpapers/master/wallpapers/psychedelic/Alex%20Grey%20-%20Net%20of%20Being.jpg"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
          pointerEvents: "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <AppShell.Header>
        <BackgroundImage
          src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwallpaperaccess.com%2Ffull%2F117951.jpg&f=1&nofb=1&ipt=b0cd04325308305c02bf1a7d5fe7b202f95ce1e12253a29225022b5eef822969"
          h="100%"
          w="100%"
          style={{
            pointerEvents: "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <Group h="100%" px="md" justify="center">
            <Title c="Cream" ta="center" order={isShortScreen ? 3 : 1}>
              This is Da Game
            </Title>
          </Group>
        </BackgroundImage>
      </AppShell.Header>

      <AppShell.Main
        display="flex"
        style={{ flexDirection: "column", position: "relative", zIndex: 1 }}
      >
        <Container size="md" w="100%" py={{ base: "xs", sm: "md" }}>
          <Stack align="center" gap={isShortScreen ? "sm" : "lg"}>
            <Title order={isShortScreen ? 2 : 1} c="Red" ta="center">
              Amazing Catan
            </Title>

            <Box
              hiddenFrom={isShortScreen ? undefined : "sm"}
              w="100%"
              maw={420}
            >
              <LoginPanel />
            </Box>

            <CardImage />
          </Stack>
        </Container>
      </AppShell.Main>

      {!isShortScreen && (
        <AppShell.Aside
          visibleFrom="sm"
          p="xs"
          zIndex={20}
          style={{ overflowY: "auto" }}
        >
          <LoginPanel />
        </AppShell.Aside>
      )}

      <AppShell.Footer>
        <Group
          h="100%"
          px="md"
          justify="space-between"
          align="center"
          wrap="nowrap"
        >
          <Text size="xs" c="dimmed">
            Legal
          </Text>
          <Group gap="md">
            <Anchor component={Link} to="/privacy" size="xs">
              Privacy Policy
            </Anchor>
            <Anchor component={Link} to="/terms" size="xs">
              Terms of Service
            </Anchor>
          </Group>
        </Group>
      </AppShell.Footer>
    </AppShell>
  );
}
