import { createInitialGameState, GAME_STORAGE_KEY, isValidGameState } from "./game-logic.js";

export function loadGameState(storage = window.localStorage) {
  try {
    const raw = storage.getItem(GAME_STORAGE_KEY);
    if (!raw) return createInitialGameState();
    const parsed = JSON.parse(raw);
    return isValidGameState(parsed) ? parsed : createInitialGameState();
  } catch {
    return createInitialGameState();
  }
}

export function saveGameState(state, storage = window.localStorage) {
  const saved = { ...state, savedAt: new Date().toISOString() };
  try {
    storage.setItem(GAME_STORAGE_KEY, JSON.stringify(saved));
  } catch {
    return state;
  }
  return saved;
}

export function clearGameState(storage = window.localStorage) {
  storage.removeItem(GAME_STORAGE_KEY);
  return createInitialGameState();
}
