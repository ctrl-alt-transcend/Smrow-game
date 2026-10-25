import { Card, Stack, Title, Text, Group, Button, Anchor, Box } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useSelectionDisplay } from '../../hooks/useSelectionDisplay';
import type { GameBoardSelection } from '../../types/gameboard.types';
import { Faction } from '../../types/gameboard.types';
import { useGameBoard } from '../../contexts/GameBoardContext';
import { useGamemasterLog } from '../../hooks/useGamemasterLog';

interface BuildSelectionButtonProps {
  selected: GameBoardSelection;
  faction: Faction;
}

const BuildSelectionButton: React.FC<BuildSelectionButtonProps> = ({
  selected,
  faction
}) => {
  const { updateRoadFaction, updateSettlementFaction, updateGamemasterLog } = useGameBoard();
  const { refetch } = useGamemasterLog(null);

  const handleConfirm = async () => {
    let log: string | null = "";
    const newFaction = faction ?? Faction.DEFAULT;
    if (selected.selectedRoad) {
      updateRoadFaction(selected.selectedRoad, newFaction);
      log = await refetch('/api/game/build');
    }
    if (selected.selectedSettlement) {
      updateSettlementFaction(selected.selectedSettlement, newFaction);
      log = await refetch('/api/game/build');
    }
    updateGamemasterLog(log ?? '...');
  };

  const openModal = () => {
    if (!selected.selectedRoad && !selected.selectedSettlement) {
      modals.openConfirmModal({
        title: 'Pick a valid construction location',
        labels: { confirm: 'OK', cancel: 'Cancel' },
        centered: true,
      });
    } else {
      modals.openConfirmModal({
        title: 'Confirm construction',
        children: (
          <Text size="sm">
            Are you sure you want to build:{' '}
            {selected.selectedRoad ? (
              <Anchor href="#" onClick={() => console.log('Build road at:', selected.selectedRoad?.edge.id)}>
                Road ({selected.selectedRoad.edge.id})
              </Anchor>
            ) : (
              <Anchor href="#" onClick={() => console.log('Build settlement at:', selected.selectedSettlement?.vertex.id)}>
                Settlement ({selected.selectedSettlement?.vertex.id})
              </Anchor>
            )}?
          </Text>
        ),
        labels: { confirm: 'Confirm', cancel: 'Cancel' },
        onConfirm: handleConfirm,
        centered: true,
      });
    }
  };
  return <Button onClick={openModal}>Build selection</Button>;
};

interface TileSelectionProps {
  selected: GameBoardSelection;
}

export const TileSelection: React.FC<TileSelectionProps> = ({
  selected
}) => {
  const items = useSelectionDisplay(selected);

  return (
    <Box style={{ flex: 1, minWidth: 220, alignContent: "center" }}>
      <Card withBorder radius="md" shadow="sm" h={220}>
        <Stack gap="xs" justify='center' align='center'>
          <Title order={4}>Selection</Title>
            <Group justify='left' gap={'xs'}>
              {items.length > 0 ? (
                items.map((item, idx) => (
                  <Text key={idx} ml="xs">• {item.label}</Text>
                ))
              ) : (
                <Text c="dimmed">No selection</Text>
              )}
            </Group>
          <BuildSelectionButton selected={selected} faction={Faction.DEFAULT} />
        </Stack>
      </Card>
    </Box>
  );
};