import { Card, Image, Text, Badge, Box } from "@mantine/core";
import { useState } from "react";

interface CardProps {
  name: string;
  imageUrl: string;
  count: number;
  color: string;
  description: string;
}

export function CardModel({
  name,
  imageUrl,
  count,
  color,
  description,
}: CardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <Box
      onClick={() => setFlipped((prev) => !prev)}
      style={{
        width: 180,
        height: 240,
        perspective: "1000px",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      <Box
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          transformStyle: "preserve-3d",
          transition: "transform 0.6s ease",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* FRONT */}
        <Card
          shadow="md"
          padding={0}
          radius="lg"
          withBorder
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            overflow: "hidden",
            borderColor: `var(--mantine-color-${color}-5)`,
          }}
        >
          <Box bg={`${color}.1`} p="xs" style={{ textAlign: "center" }}>
            <Text
              fw={700}
              size="lg"
              c={`${color}.9`}
              style={{ letterSpacing: "1px" }}
            >
              {name.toUpperCase()}
            </Text>
          </Box>
          <Image src={imageUrl} height={190} alt={name} fit="cover" />
          <Box
            style={{
              position: "absolute",
              bottom: 10,
              left: 10,
            }}
          >
            <Badge
              size="xl"
              circle
              color={count > 0 ? color : "gray"}
              variant={count > 0 ? "filled" : "outline"}
              style={{
                boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                fontSize: "1rem",
                width: 36,
                height: 36,
              }}
            >
              {count}
            </Badge>
          </Box>
        </Card>

        {/* BACK */}
        <Card
          shadow="md"
          padding="md"
          radius="lg"
          withBorder
          bg={`${color}.0`}
          style={{
            position: "absolute",
            inset: 0,
            transform: "rotateY(180deg)",
            backfaceVisibility: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            borderColor: `var(--mantine-color-${color}-5)`,
          }}
        >
          <Text fw={800} size="lg" c={`${color}.9`} mb="sm">
            {name.toUpperCase()}
          </Text>

          <Text size="sm" c="dimmed" lh={1.5}>
            {description}
          </Text>

          <Text size="xs" c="dimmed" mt="lg">
            Click to flip back {/* Translate */}
          </Text>
        </Card>
      </Box>
    </Box>
  );
}
