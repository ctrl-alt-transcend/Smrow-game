import { AppShell, Box } from "@mantine/core";
import { Outlet } from "react-router";
import { HeaderTabs } from "../components/navbar/HeaderTabs";

export default function AppLayout() {
  return (
    <AppShell header={{ height: 60 }} padding={{ base: "sm", md: "xl" }}>
      <AppShell.Header>
        <HeaderTabs />
      </AppShell.Header>
      <AppShell.Main>
        <Box mt="xl">
          <Outlet />
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}
