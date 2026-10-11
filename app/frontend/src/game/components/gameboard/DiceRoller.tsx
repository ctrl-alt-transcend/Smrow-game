import Dice from 'modern-react-dice-roll';

export function DiceRoller() {
  const handleRoll = (value: number) => {
    console.log(`You rolled a ${value}!`);
  };

  return (
    <div>
      <Dice onRoll={handleRoll} size={80}/>
    </div>
  );
}