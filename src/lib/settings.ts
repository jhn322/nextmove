// Settings utility functions for localStorage

// Define the settings keys
const SETTINGS_KEYS = {
  PIECE_SET: "chess_piece_set",
  WHITE_PIECES_BOTTOM: "chess_white_pieces_bottom",
  SHOW_COORDINATES: "chess_show_coordinates",
  ENABLE_ANIMATIONS: "chess_enable_animations",
  SOUND_ENABLED: "chess_sound_enabled",
  ENABLE_CONFETTI: "chess_enable_confetti",
  TIMEZONE: "chess_timezone",
  CLOCK_FORMAT: "chess_clock_format",
  COUNTRY_FLAG: "chess_country_flag",
  FLAIR: "chess_flair",
};

// Default settings values
const DEFAULT_SETTINGS = {
  pieceSet: "staunty",
  whitePiecesBottom: true,
  showCoordinates: true,
  enableAnimations: true,
  soundEnabled: true,
  enableConfetti: true,
  timezone: "UTC",
  clockFormat: "24" as "12" | "24",
  countryFlag: "",
  flair: "",
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

// Get confetti enabled setting from localStorage
export const getConfettiEnabled = (): boolean => {
  if (typeof window === "undefined") return DEFAULT_SETTINGS.enableConfetti;
  return localStorage.getItem(SETTINGS_KEYS.ENABLE_CONFETTI) !== "false";
};

// Set confetti enabled setting in localStorage
export const setConfettiEnabled = (enable: boolean): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_KEYS.ENABLE_CONFETTI, enable.toString());
};

// Get timezone from localStorage
export const getTimezone = (): string => {
  if (typeof window === "undefined") return DEFAULT_SETTINGS.timezone;
  return (
    localStorage.getItem(SETTINGS_KEYS.TIMEZONE) || DEFAULT_SETTINGS.timezone
  );
};

// Set timezone in localStorage
export const setTimezone = (timezone: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_KEYS.TIMEZONE, timezone);
};

// Get clock format from localStorage
export const getClockFormat = (): "12" | "24" => {
  if (typeof window === "undefined") return DEFAULT_SETTINGS.clockFormat;
  return (localStorage.getItem(SETTINGS_KEYS.CLOCK_FORMAT) ||
    DEFAULT_SETTINGS.clockFormat) as "12" | "24";
};

// Set clock format in localStorage
export const setClockFormat = (format: "12" | "24"): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_KEYS.CLOCK_FORMAT, format);
};

// Get country flag from localStorage
export const getCountryFlag = (): string => {
  if (typeof window === "undefined") return DEFAULT_SETTINGS.countryFlag;
  return (
    localStorage.getItem(SETTINGS_KEYS.COUNTRY_FLAG) ||
    DEFAULT_SETTINGS.countryFlag
  );
};

// Set country flag in localStorage
export const setCountryFlag = (flag: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_KEYS.COUNTRY_FLAG, flag);
};

// Get flair from localStorage
export const getFlair = (): string => {
  if (typeof window === "undefined") return DEFAULT_SETTINGS.flair;
  return localStorage.getItem(SETTINGS_KEYS.FLAIR) || DEFAULT_SETTINGS.flair;
};

// Set flair in localStorage
export const setFlair = (flair: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_KEYS.FLAIR, flair);
};

// Save all settings at once
export const saveAllSettings = (settings: {
  pieceSet?: string;
  whitePiecesBottom?: boolean;
  showCoordinates?: boolean;
  enableAnimations?: boolean;
  soundEnabled?: boolean;
  enableConfetti?: boolean;
  timezone?: string;
  clockFormat?: "12" | "24";
  countryFlag?: string;
  flair?: string;
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

  if (settings.enableConfetti !== undefined) {
    setConfettiEnabled(settings.enableConfetti);
  }

  if (settings.timezone) {
    setTimezone(settings.timezone);
  }

  if (settings.clockFormat) {
    setClockFormat(settings.clockFormat);
  }

  if (settings.countryFlag) {
    setCountryFlag(settings.countryFlag);
  }

  if (settings.flair) {
    setFlair(settings.flair);
  }
};
