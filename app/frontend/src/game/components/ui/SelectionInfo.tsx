import { useSelectionDisplay } from '../../hooks/useSelectionDisplay';
import type { GameBoardSelection } from '../../types/gameboard.types';
import { BuildSelectionButton } from './BuildSelectionButton';

interface SelectionInfoProps {
  selected: GameBoardSelection;
}

export const SelectionInfo: React.FC<SelectionInfoProps> = ({ selected }) => {
  const items = useSelectionDisplay(selected);

  return (
    <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#eee', borderRadius: '4px' }}>
      <strong>Current selection:</strong>
      {items.length > 0 ? (
        items.map((item, idx) => <div key={idx}>• {item.label}</div>)
      ) : (
        <div>No selection</div>
      )}
      <BuildSelectionButton selected={selected} faction={null}/>
    </div>
  );
};