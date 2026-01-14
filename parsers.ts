
import { z, ZodSchema, ZodError } from 'zod';
import {
  SimulatorResponseSchema,
  NarratorResponseSchema,
  ScenarioConceptsSchema,
  CharacterProfileSchema,
  SourceAnalysisResultSchema,
  HydratedCharacterSchema,
} from './schemas';

export class ParseError extends Error {
  constructor(
    message: string,
    public readonly rawResponse: string,
    public readonly zodError?: ZodError
  ) {
    super(message);
    this.name = 'ParseError';
  }
}

/**
 * Robustly finds the end index of a JSON object/array by balancing braces/brackets.
 * Handles nested structures and ignores characters inside strings.
 */
function findMatchingClose(text: string, openPos: number): number {
  const openChar = text[openPos];
  const closeChar = openChar === '{' ? '}' : ']';
  let balance = 1;
  let inString = false;
  let escaped = false;

  for (let i = openPos + 1; i < text.length; i++) {
    const char = text[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === openChar) {
        balance++;
      } else if (char === closeChar) {
        balance--;
        if (balance === 0) {
          return i;
        }
      }
    }
  }
  return -1;
}

/**
 * Generic parser that handles markdown fences and validates with Zod
 */
function parseWithSchema<T>(text: string, schema: ZodSchema<T>, label: string): T {
  let jsonString = text.trim();

  // 1. Extract from Markdown code fences if present
  const fenceMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    jsonString = fenceMatch[1].trim();
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (e) {
    // 2. Fallback: Aggressive extraction of JSON object/array
    
    // Determine start based on first occurrence of { or [
    const firstObj = jsonString.indexOf('{');
    const firstArr = jsonString.indexOf('[');
    
    let start = -1;
    if (firstObj !== -1 && (firstArr === -1 || firstObj < firstArr)) {
        start = firstObj;
    } else if (firstArr !== -1) {
        start = firstArr;
    }

    if (start !== -1) {
        // Attempt smart extraction using brace balancing
        const end = findMatchingClose(jsonString, start);
        
        if (end !== -1) {
            const candidate = jsonString.substring(start, end + 1);
            try {
                parsed = JSON.parse(candidate);
            } catch (innerE) {
                 // If smart extraction fails, try one last desperate attempt: 
                 // LastIndexOf (Naive) - strictly for cases where balancing failed due to weird formatting
                 try {
                    const lastClose = jsonString[start] === '{' ? jsonString.lastIndexOf('}') : jsonString.lastIndexOf(']');
                    if (lastClose > start && lastClose !== end) {
                        const candidate2 = jsonString.substring(start, lastClose + 1);
                        parsed = JSON.parse(candidate2);
                    } else {
                        throw innerE;
                    }
                 } catch (finalE) {
                    throw new ParseError(`${label}: Invalid JSON (Retried) - ${(innerE as Error).message}`, text);
                 }
            }
        } else {
             // Balancing failed (incomplete JSON?), fall back to naive lastIndexOf
             const lastClose = jsonString[start] === '{' ? jsonString.lastIndexOf('}') : jsonString.lastIndexOf(']');
             if (lastClose > start) {
                 const candidate = jsonString.substring(start, lastClose + 1);
                 try {
                    parsed = JSON.parse(candidate);
                 } catch (innerE) {
                    throw new ParseError(`${label}: Invalid JSON (Fallback) - ${(innerE as Error).message}`, text);
                 }
             } else {
                 throw new ParseError(`${label}: Invalid JSON - Could not find closing brace`, text);
             }
        }
    } else {
        throw new ParseError(`${label}: Invalid JSON - ${(e as Error).message}`, text);
    }
  }

  // Handle array wrapping - common LLM behavior where it wraps a single object in an array
  if (Array.isArray(parsed)) {
      // First, check if the schema actually expects an array.
      const arrayResult = schema.safeParse(parsed);
      
      // If the schema did NOT expect an array (validation failed), but we got one...
      if (!arrayResult.success && parsed.length > 0) {
          // Attempt to unwrap the first element and see if THAT matches the schema.
          const itemResult = schema.safeParse(parsed[0]);
          if (itemResult.success) {
              parsed = parsed[0];
          }
      }
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues
      .map(i => `${i.path.join('.') || 'root'}: ${i.message}`)
      .join('; ');
    throw new ParseError(`${label}: Schema validation failed - ${issues}`, text, result.error);
  }

  return result.data;
}

/**
 * Parse SIMULATOR response (returns partial GameState)
 */
export function parseSimulatorResponse(text: string) {
  return parseWithSchema(text, SimulatorResponseSchema, 'Simulator');
}

/**
 * Parse NARRATOR response (returns { gameState?, storyText })
 */
export function parseNarratorResponse(text: string) {
  return parseWithSchema(text, NarratorResponseSchema, 'Narrator');
}

/**
 * Parse scenario concepts from guided setup
 */
export function parseScenarioConcepts(text: string) {
  return parseWithSchema(text, ScenarioConceptsSchema, 'ScenarioConcepts');
}

/**
 * Parse character profile with safe defaults
 */
export function parseCharacterProfile(text: string) {
  return parseWithSchema(text, CharacterProfileSchema, 'CharacterProfile');
}

/**
 * Parse source material analysis
 */
export function parseSourceAnalysis(text: string) {
  return parseWithSchema(text, SourceAnalysisResultSchema, 'SourceAnalysis');
}

/**
 * Parse hydrated character (partial NpcState)
 */
export function parseHydratedCharacter(text: string) {
  return parseWithSchema(text, HydratedCharacterSchema, 'HydratedCharacter');
}
