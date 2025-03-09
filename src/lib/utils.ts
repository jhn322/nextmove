import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Character name mappings for full names
const characterNames: Record<string, string> = {
  aang: "Avatar Aang",
  bojack: "BoJack Horseman",
  bubblegum: "Princess Bubblegum",
  finn: "Finn the Human",
  jake: "Jake the Dog",
  marceline: "Marceline the Vampire Queen",
  mordecai: "Mordecai the Blue Jay",
  rigby: "Rigby the Raccoon",
  spongebob: "SpongeBob SquarePants",
  squidward: "Squidward Tentacles",
  patrick: "Patrick Star",
  sandy: "Sandy Cheeks",
  blossom: "Blossom",
  bubbles: "Bubbles",
  buttercup: "Buttercup",
  dexter: "Dexter",
  deedee: "Dee Dee",
  ed: "Ed",
  edd: "Double D",
  eddy: "Eddy",
  gir: "GIR",
  gumball: "Gumball Watterson",
  darwin: "Darwin Watterson",
  rick: "Rick Sanchez",
  morty: "Morty Smith",
  stewie: "Stewie Griffin",
  peter: "Peter Griffin",
  homer: "Homer Simpson",
  bart: "Bart Simpson",
  bender: "Bender Rodriguez",
  fry: "Philip J. Fry",
  zim: "Invader Zim",
  dipper: "Dipper Pines",
  wendy: "Wendy Corduroy",
  catdog: "CatDog",
  courage: "Courage the Cowardly Dog",
  johnny: "Johnny Bravo",
  jimmy: "Jimmy Neutron",
  timmy: "Timmy Turner",
  tom: "Tom Cat",
  jerry: "Jerry Mouse",
  scooby: "Scooby-Doo",
  shaggy: "Shaggy Rogers",
  samurai: "Samurai Jack",
  skips: "Skips",
  benson: "Benson",
  flame: "Flame Princess",
  perry: "Perry the Platypus",
};

export function getCharacterNameFromPath(path: string): string {
  // Extract the filename without extension and path
  const filename = path.split("/").pop()?.split(".")[0] || "";

  // Check if we have a mapping for this character
  if (characterNames[filename]) {
    return characterNames[filename];
  }

  // Fallback to the original formatting if no mapping exists
  return filename
    .replace(/([A-Z])/g, " $1") // Add space before capital letters
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
    .trim(); // Remove any extra spaces
}
