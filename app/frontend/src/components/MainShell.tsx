import CardImage from "./Card";
import { LoginPanel } from "./authentification/LoginPanel";
import { AppShell, BackgroundImage, Group, Text, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { TitleBoxImage } from "./titles/TitleBoxImage"

import { useEffect } from "react";
import { Navigate } from "react-router";
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
      mode="static"
      header={{ height: 200 }}
      aside={{ width: 300, breakpoint: "sm" }}
    >

      <AppShell.Header
        mt="lg"
        mb="lg"
      >
        <BackgroundImage
          src="https://i.pinimg.com/736x/2f/95/d9/2f95d99b1bf9c8da12f7bb61d1e57695.jpg"
          h="100%"
          w="100%"
          style={{
            objectFit: "cover",
            position: "absolute",
            inset: 0,
          }}
        >
          <Group h="100%" px="md" justify="center">
            <Title
            c={"white"}
            >
              This is Da Game
              </Title>
          </Group>
        </BackgroundImage>
      </AppShell.Header>

      <AppShell.Main
      >
        <TitleBoxImage content="Welcome to Catan" />
        <CardImage></CardImage>
        <Text>
          Cras maximus mauris a nisl maximus porta efficitur ac lacus. Donec
          eget sapien magna. Suspendisse a orci tempus, viverra lacus a, tempus
          felis. In hac habitasse platea dictumst. Etiam et sodales sapien.
          Integer non eleifend odio. Pellentesque habitant morbi tristique
          senectus et netus et malesuada fames ac turpis egestas. Vestibulum
          aliquam justo ac suscipit consequat. Vivamus porta ac dolor eget
          tincidunt. Vestibulum mollis eros lorem, a sodales arcu dapibus id.
          Duis imperdiet enim vitae augue venenatis, a rhoncus magna egestas.
          Nam id eleifend ligula, in iaculis velit.
        </Text>
      </AppShell.Main>

      <AppShell.Aside
        h="100%"
        // m="xl"
        p="xs"
        zIndex={20}
      >
        <LoginPanel />
      </AppShell.Aside>

      {/* <AppShell.Footer>
        <Text>
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Deserunt aliquam aut quis ad, fuga impedit eveniet obcaecati nesciunt atque accusantium voluptatum harum sit voluptates molestias tenetur molestiae assumenda itaque deleniti!
        </Text>
      </AppShell.Footer> */}
    </AppShell>
  );
}
