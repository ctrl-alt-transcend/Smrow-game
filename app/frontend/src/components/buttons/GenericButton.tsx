import { Button } from '@mantine/core';
import type { ButtonProps } from '@mantine/core';

interface GenericButtonProps extends ButtonProps {
  label?: string;
}

export default function GenericButton({
  label = 'generic button',
  ...props}: GenericButtonProps)
{
  return (
    <Button
      variant="gradient"
      gradient={{ from: 'green', to: 'black', deg: 90 }}
      fullWidth
      {...props}
    > {label} </Button>
  );
}