import { Button, Text, Anchor } from '@mantine/core';
import { modals } from '@mantine/modals';
import { GameBoardSelection, Faction } from '../../types/gameboard.types';

interface BuildSelectionButtonProps {
  selected: GameBoardSelection;
  faction: Faction | null;
}

export const BuildSelectionButton: React.FC<BuildSelectionButtonProps> = ({
  selected,
  faction
}) => {

  const handleConfirm = () => {
    if (selected.selectedRoad) {
      faction ? selected.selectedRoad.faction = faction
        : selected.selectedRoad.faction = Faction.DEFAULT;
    }
    if (selected.selectedSettlement) {
      faction ? selected.selectedSettlement.faction = faction
        : selected.selectedSettlement.faction = Faction.DEFAULT;
    }
  };

  const openModal = () => {
    if (!selected.selectedRoad && !selected.selectedSettlement) {
      modals.openConfirmModal({
      title: 'Pick a valid construction location'})
    }
    else {
      modals.openConfirmModal({
      title: 'Confirm construction',
      children: (
        <Text size="sm">
          Are you sure you want to build :{' '}
          {selected.selectedRoad ? (
            <Anchor href="#" onClick={() => console.log('Build road at: ', selected.selectedRoad?.edge.id)}>
              Road ({selected.selectedRoad.edge.id})
            </Anchor>
          ) : (
            <Anchor href="#" onClick={() => console.log('Build settlement at: ', selected.selectedSettlement?.vertex.id)}>
              Settlement ({selected.selectedSettlement?.vertex.id})
            </Anchor>
          )} ?
        </Text>
      ),
      labels: { confirm: 'Confirm', cancel: 'Cancel' },
      onConfirm: handleConfirm,
    });
    }
  };
  return <Button onClick={openModal}>Build selection</Button>;
};