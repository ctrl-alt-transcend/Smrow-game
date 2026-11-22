import { Box, Card, Stack, Text, Title } from "@mantine/core";

function GameMasterLogs({ log }: { log: string | null }) {
  return (
    <Box
      style={{
        flex: 1,
        minWidth: 0,
      }}
    >
      <Card withBorder radius="md" shadow="sm" padding="6px" w="100%" h="100%">
        <Stack
          gap={0}
          align="center"
          justify="center"
          h="100%"
          style={{ overflow: "hidden" }}
        >
          <Title order={6} ta="center">
            Game Master Logs
          </Title>
          <Text size={"lg"} ta="center" lineClamp={2}>
            {log ?? "…"}
          </Text>
        </Stack>
      </Card>
    </Box>
  );
}

export default GameMasterLogs;
