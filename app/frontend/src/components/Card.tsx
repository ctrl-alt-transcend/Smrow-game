import { Card, Divider, Image, Text, Title } from "@mantine/core";

export default function CardImage() {
  return (
    <Card withBorder radius="md" p="md" m="sm">
      <Title
        order={1}
        c="Red"
        fz={{ base: "h3", md: "h1" }}
        ta="center"
        mb="sm"
      >
        Amazing Catan
      </Title>
      <Card.Section>
        <Divider color="black" />
      </Card.Section>
      <Card.Section>
        <Image src="/assets/catan.webp" alt="Game preview" />
      </Card.Section>

      <Text c="dimmed" mt="md">
        Build your colony, gather resources and trade with up to three other
        players to be the first to reach the victory points. Pick a preset or
        tweak every rule to make each game unique.
      </Text>
    </Card>
  );
}
