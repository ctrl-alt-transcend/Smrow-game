export function updateValue(
  currentValue: number,
  limit: number,
  newValue?: number,
): number {
  if (newValue !== undefined) return newValue;
  if (currentValue + 1 === limit) {
    return 0;
  } else {
    return currentValue + 1;
  }
}

export function funnyRollLog(value: number): string {
  if (value <= 3) {
    return `got an almost useless ${value} in total ...`;
  } else if (value > 3 && value <= 6) {
    return `got a tiny little ${value} in total ...`;
  } else if (value === 7) {
    return `got a damned ${value} in total !`;
  } else if (value > 7 && value <= 9) {
    return `got a solid ${value} in total .`;
  } else if (value > 9 && value <= 12) {
    return `got a huge ${value} in total !`;
  }
  return `rolled a ${value}`;
}
