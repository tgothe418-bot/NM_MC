
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
 * Generic parser that handles markdown fences and validates with Zod
 */
function parseWithSchema<T>(text: string, schema: ZodSchema<T>, label: string): T {
  let jsonString = text.trim();

  // Strip markdown code fences if LLM wrapped the response
  const fenceMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    jsonString = fenceMatch[1].trim();
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (e) {
    throw new ParseError(`${label}: Invalid JSON - ${(e as Error).message}`, text);
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
