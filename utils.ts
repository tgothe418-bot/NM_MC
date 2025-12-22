
import { GameState } from "./types";

export const parseResponse = (responseText: string): { gameState: GameState | null, storyText: string } => {
  let gameState: GameState | null = null;
  let storyText = "The Architect's voice dissolves into static... (Parsing Error)";

  // Defensive check to avoid calling methods on undefined/null
  if (typeof responseText !== 'string' || !responseText) {
    return { gameState, storyText: "The simulation encountered an ontological void." };
  }

  const tryParse = (str: string) => {
    try {
      return JSON.parse(str);
    } catch (e) {
      return null;
    }
  };

  // 1. Full JSON Parse Attempt
  let parsed = tryParse(responseText);

  // 2. Markdown Code Block Fallback
  if (!parsed) {
    const codeBlockRegex = /```(?:json)?\s*(\{[\s\S]*?\})\s*```/;
    const match = responseText.match(codeBlockRegex);
    if (match) parsed = tryParse(match[1]);
  }

  // 3. Brace Extraction Fallback
  if (!parsed) {
    const start = responseText.indexOf('{');
    const end = responseText.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      parsed = tryParse(responseText.substring(start, end + 1));
    }
  }

  // 4. THE SURGICAL DIRTY EXTRACTION (Prevents Code Leaks)
  if (parsed) {
    storyText = parsed.story_text || "";
    gameState = parsed.game_state || null;
    return { gameState, storyText };
  }

  // If all JSON parsing fails, we MUST NOT return the raw string (the leak).
  // We regex for the "story_text" field specifically.
  const storyRegex = /"story_text"\s*:\s*"((?:[^"\\]|\\.)*)"/s;
  const match = responseText.match(storyRegex);

  if (match && match[1]) {
    try {
      // Use the native parser just for the string part to handle escapes (\n, etc)
      storyText = JSON.parse(`"${match[1]}"`);
    } catch (e) {
      // Manual cleanup if even that fails
      storyText = match[1]
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\');
    }
  } else {
    // Final emergency: Strip JSON artifacts to present a "clean" error
    let cleaned = responseText
      .replace(/^\s*\{\s*"story_text"\s*:\s*"/, '')
      .replace(/",\s*"game_state"[\s\S]*$/, '')
      .replace(/"\s*\}\s*$/, '');
    
    // If it still looks like code, hide it.
    if (cleaned.includes('"meta"') || cleaned.length > 2000) {
      storyText = "The simulation encountered an ontological error. Re-stating action...";
    } else {
      storyText = cleaned;
    }
  }

  return { gameState, storyText };
};

export const cleanPercentage = (val: any): number => {
  if (!val) return 0;
  const strVal = String(val);
  return parseInt(strVal.replace('%', ''), 10) || 0;
};
