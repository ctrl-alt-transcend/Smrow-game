import { Button, Group } from "@mantine/core";

export const VISIBLE_ROWS = 6;

type ShowMoreButtonProps = {
  total: number;
  expanded: boolean;
  onToggle: () => void;
};

// Hidden when there is nothing more to show
export default function ShowMoreButton({
  total,
  expanded,
  onToggle,
}: ShowMoreButtonProps) {
  if (total <= VISIBLE_ROWS) return null;

  return (
    <Group justify="center" mt="sm">
      <Button variant="subtle" size="xs" onClick={onToggle}>
        {expanded ? "Show less" : `Show more (${total - VISIBLE_ROWS})`}
      </Button>
    </Group>
  );
}
