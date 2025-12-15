
import { GameState } from "./types";

export const parseResponse = (responseText: string): { gameState: GameState | null, storyText: string } => {
  let gameState: GameState | null = null;
  let storyText = responseText;

  // Strategy 1: Regex for Markdown Code Blocks (Most reliable for AI output)
  // Matches ```json { ... } ``` or ``` { ... } ```
  const codeBlockRegex = /```(?:json)?\s*(\{[\s\S]*?\})\s*```/;
  const match = responseText.match(codeBlockRegex);

  if (match) {
    try {
      const parsed = JSON.parse(match[1]);
      if (parsed && typeof parsed === 'object' && 'meta' in parsed) {
        gameState = parsed as GameState;
        // Remove the entire code block from the text
        storyText = responseText.replace(match[0], '').trim();
        return { gameState, storyText };
      }
    } catch (e) {
      // JSON parse failed inside code block, fall through to fallback strategy
      console.warn("Found code block but failed to parse JSON:", e);
    }
  }

  // Strategy 2: Fallback Brace Counting (For raw JSON or malformed fences)
  let currentIndex = 0;
  while (currentIndex < responseText.length) {
    const openBraceIndex = responseText.indexOf('{', currentIndex);
    if (openBraceIndex === -1) break;

    let braceCount = 0;
    let endIndex = -1;
    let inString = false;
    let escaped = false;

    for (let i = openBraceIndex; i < responseText.length; i++) {
      const char = responseText[i];
      if (escaped) { escaped = false; continue; }
      if (char === '\\') { escaped = true; continue; }
      if (char === '"') { inString = !inString; }

      if (!inString) {
        if (char === '{') braceCount++;
        else if (char === '}') {
          braceCount--;
          if (braceCount === 0) {
            endIndex = i;
            break;
          }
        }
      }
    }

    if (endIndex !== -1) {
      const potentialJson = responseText.substring(openBraceIndex, endIndex + 1);
      try {
        const parsed = JSON.parse(potentialJson);
        if (parsed && typeof parsed === 'object' && 'meta' in parsed) {
          gameState = parsed as GameState;
          
          // Cleanup: Remove the JSON string
          // Also try to remove any lingering ``` marks around it if Strategy 1 missed them
          let cleanText = responseText.replace(potentialJson, '');
          
          // Aggressive cleanup of potential leftover fences
          cleanText = cleanText.replace(/```json/g, '').replace(/```/g, '');
          
          storyText = cleanText.trim();
          break; // Found valid state, stop
        }
      } catch (e) {
        // Continue searching
      }
    }
    currentIndex = openBraceIndex + 1;
  }

  return { gameState, storyText };
};

export const cleanPercentage = (val: any): number => {
  if (!val) return 0;
  const strVal = String(val);
  return parseInt(strVal.replace('%', ''), 10) || 0;
};
