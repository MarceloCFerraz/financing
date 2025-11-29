import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function pickWinner(
  scenario1?: number,
  scenario2?: number,
  scenario3?: number,
): number {
  let winner = 0;

  if (!scenario1 || !scenario2 || !scenario3) {
    return winner;
  }

  switch (Math.max(scenario1, scenario2, scenario3)) {
    case scenario1:
      winner = 1;
      break;
    case scenario2:
      winner = 2;
      break;
    case scenario3:
      winner = 3;
      break;
  }

  return winner;
}
