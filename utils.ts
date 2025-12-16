

import { GameState } from "./types";

export const parseResponse = (responseText: string): { gameState: GameState | null, storyText: string } => {
  let gameState: GameState | null = null;
  let storyText = responseText;

  try {
    // 1. Attempt Direct JSON parse (Standard for application/json)
    const parsed = JSON.parse(responseText);
    
    // Check for the new envelope structure (Schema: { story_text, game_state })
    if (parsed.story_text) {
        storyText = parsed.story_text;
    }
    
    if (parsed.game_state) {
        gameState = parsed.game_state;
    } else if (parsed.meta) {
        // Fallback: If root object is the state (legacy or malformed schema)
        gameState = parsed;
        // If the model output just state, storyText is undefined/empty here unless 
        // we extracted it differently, but with strict JSON mode this is rare.
    }
    
    // If we successfully parsed a JSON object, return now.
    return { gameState, storyText };

  } catch (e) {
      // 2. Fallback: Model might have wrapped JSON in markdown ```json ... ``` (Common in chat models)
      const codeBlockRegex = /```(?:json)?\s*(\{[\s\S]*?\})\s*```/;
      const match = responseText.match(codeBlockRegex);
      if (match) {
          try {
              const parsed = JSON.parse(match[1]);
              
              if (parsed.story_text) storyText = parsed.story_text;
              
              if (parsed.game_state) gameState = parsed.game_state;
              else if (parsed.meta) gameState = parsed;
              
              return { gameState, storyText };
          } catch (err) {
              // Ignore regex parsing error, continue to manual fallback
          }
      }
      
      // 3. Last Resort: Brace Counting (For messy output)
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
            // Check if this object looks like our envelope or our state
            if (parsed.story_text || parsed.game_state || parsed.meta) {
                 if (parsed.story_text) storyText = parsed.story_text;
                 if (parsed.game_state) gameState = parsed.game_state;
                 else if (parsed.meta) gameState = parsed;
                 
                 // If we found a valid object, we stop looking to avoid grabbing nested objects later
                 break; 
            }
          } catch (e) {
            // Continue searching if this block wasn't valid JSON
          }
        }
        currentIndex = openBraceIndex + 1;
      }
  }

  return { gameState, storyText };
};

export const cleanPercentage = (val: any): number => {
  if (!val) return 0;
  const strVal = String(val);
  return parseInt(strVal.replace('%', ''), 10) || 0;
};