// Settings utility functions for localStorage

// Define the settings keys
const SETTINGS_KEYS = {
  PIECE_SET: "chess_piece_set",
  WHITE_PIECES_BOTTOM: "chess_white_pieces_bottom",
  SHOW_COORDINATES: "chess_show_coordinates",
  ENABLE_ANIMATIONS: "chess_enable_animations",
  SOUND_ENABLED: "chess_sound_enabled",
};

// Default settings values
const DEFAULT_SETTINGS = {
  pieceSet: "staunty",
  whitePiecesBottom: true,
  showCoordinates: true,
  enableAnimations: true,
  soundEnabled: true,
};

// Get piece set from localStorage
export const getPieceSet = (): string => {
  if (typeof window === "undefined") return DEFAULT_SETTINGS.pieceSet;
  return (
    localStorage.getItem(SETTINGS_KEYS.PIECE_SET) || DEFAULT_SETTINGS.pieceSet
  );
};

// Set piece set in localStorage
export const setPieceSet = (pieceSet: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_KEYS.PIECE_SET, pieceSet);
};

// Get white pieces bottom setting from localStorage
export const getWhitePiecesBottom = (): boolean => {
  if (typeof window === "undefined") return DEFAULT_SETTINGS.whitePiecesBottom;
  return localStorage.getItem(SETTINGS_KEYS.WHITE_PIECES_BOTTOM) !== "false";
};

// Set white pieces bottom setting in localStorage
export const setWhitePiecesBottom = (bottom: boolean): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_KEYS.WHITE_PIECES_BOTTOM, bottom.toString());
};

// Get show coordinates setting from localStorage
export const getShowCoordinates = (): boolean => {
  if (typeof window === "undefined") return DEFAULT_SETTINGS.showCoordinates;
  return localStorage.getItem(SETTINGS_KEYS.SHOW_COORDINATES) !== "false";
};

// Set show coordinates setting in localStorage
export const setShowCoordinates = (show: boolean): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_KEYS.SHOW_COORDINATES, show.toString());
};

// Get enable animations setting from localStorage
export const getEnableAnimations = (): boolean => {
  if (typeof window === "undefined") return DEFAULT_SETTINGS.enableAnimations;
  return localStorage.getItem(SETTINGS_KEYS.ENABLE_ANIMATIONS) !== "false";
};

// Set enable animations setting in localStorage
export const setEnableAnimations = (enable: boolean): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_KEYS.ENABLE_ANIMATIONS, enable.toString());
};

// Get sound enabled setting from localStorage
export const getSoundEnabled = (): boolean => {
  if (typeof window === "undefined") return DEFAULT_SETTINGS.soundEnabled;
  return localStorage.getItem(SETTINGS_KEYS.SOUND_ENABLED) !== "false";
};

// Set sound enabled setting in localStorage
export const setSoundEnabled = (enable: boolean): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_KEYS.SOUND_ENABLED, enable.toString());
};

// Save all settings at once
export const saveAllSettings = (settings: {
  pieceSet?: string;
  whitePiecesBottom?: boolean;
  showCoordinates?: boolean;
  enableAnimations?: boolean;
  soundEnabled?: boolean;
}): void => {
  if (typeof window === "undefined") return;

  if (settings.pieceSet) {
    setPieceSet(settings.pieceSet);
  }

  if (settings.whitePiecesBottom !== undefined) {
    setWhitePiecesBottom(settings.whitePiecesBottom);
  }

  if (settings.showCoordinates !== undefined) {
    setShowCoordinates(settings.showCoordinates);
  }

  if (settings.enableAnimations !== undefined) {
    setEnableAnimations(settings.enableAnimations);
  }

  if (settings.soundEnabled !== undefined) {
    setSoundEnabled(settings.soundEnabled);
  }
};
