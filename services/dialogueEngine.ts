
import { NpcState, DialogueEntry, KnowledgeNode, SocialManeuver, DialogueMemory, DialogueState } from '../types';
import { LORE_LIBRARY } from '../loreLibrary';
import { STYLE_GUIDE } from './styleGuide';
import { constructMemoryContext } from './memorySystem';

/**
 * THE DIALOGUE ENGINE V5.0 (MOSAIC AWARE)
 * 
 * Generates high-fidelity "Acting Notes" for the LLM based on 
 * psychological vectors, linguistic signatures, and environmental resonance.
 */

export const getDefaultDialogueState = (background: string = ""): DialogueState => ({
    voice_profile: {
        tone: "Neutral",
        vocabulary: [],
        quirks: [],
        forbidden_topics: []
    },
    memory: {
        short_term_buffer: [],
        long_term_summary: background || "No prior history recorded.",
        episodic_logs: [],
        known_facts: []
    },
    last_social_maneuver: 'OBSERVE',
    mood_state: "Neutral",
    current_social_intent: 'OBSERVE',
    conversation_history: []
});

// --- 1. LINGUISTIC FINGERPRINTING ---

const getLinguisticInstructions = (voice: any): string => {
    if (!voice) return "Speak naturally.";

    const rhythm = voice.rhythm || 'Measured';
    const complexity = voice.syntax_complexity || 'Simple';
    
    let instructions = "";

    // Rhythm Mapping
    switch (rhythm) {
        case 'Staccato': instructions += "Use short, punchy sentences. Avoid conjunctions. Stop abruptly. "; break;
        case 'Lyrical': instructions += "Use flowing, poetic sentence structures. Focus on rhythm and cadence. "; break;
        case 'Breathless': instructions += "Use ellipses (...) frequently. Run-on sentences. Convey panic or exhaustion. "; break;
        case 'Monotone': instructions += "Use flat, declarative statements. No exclamations. Minimal emotional inflection. "; break;
        case 'Erratic': instructions += "Switch abruptly between short and long sentences. Lose your train of thought. "; break;
        case 'Rapid': instructions += "Speak quickly. Chain thoughts together without pause. "; break;
        case 'Whispering': instructions += "Implore the user. Use soft, hushed phrasing. Intimate and secretive. "; break;
        case 'Booming': instructions += "Use authoritative, commanding language. Take up space with your words. "; break;
        default: instructions += "Maintain a measured, conversational pace. "; break;
    }

    // Complexity Mapping
    switch (complexity) {
        case 'Academic': instructions += "Use elevated vocabulary and technical precision. Intellectualize trauma. "; break;
        case 'Broken': instructions += "Use fragmented grammar. Incomplete thoughts. Struggle to find words. "; break;
        case 'Flowery': instructions += "Use excessive adjectives and metaphors. "; break;
        case 'Street': instructions += "Use colloquialisms, slang, and rough phrasing. Unfiltered. "; break;
        case 'Vague': instructions += "Avoid direct answers. Speak in riddles or generalities. "; break;
        case 'Precise': instructions += "Be hyper-specific. Correct the user's terminology. "; break;
        case 'Technical': instructions += "Focus on the mechanics of the situation. Ignore the emotional weight. "; break;
        default: instructions += "Use standard, accessible English. "; break;
    }

    return instructions;
};

// --- 2. THEMATIC INFECTION ---

const getClusterMetaphors = (clusterName?: string): string => {
    if (!clusterName || clusterName === 'None') return "";
    
    // Find matching key in LORE_LIBRARY
    const key = Object.keys(LORE_LIBRARY).find(k => clusterName.includes(k));
    if (!key) return "";

    const lore = LORE_LIBRARY[key];
    const style = STYLE_GUIDE.cluster_palettes[key as keyof typeof STYLE_GUIDE.cluster_palettes];
    
    if (!style) return "";

    const concepts = style.key_concepts.slice(0, 5).join(", ");
    const verbs = style.preferred_verbs.slice(0, 5).join(", ");

    return `
    THEMATIC RESONANCE (${key.toUpperCase()}):
    - When describing feelings or surroundings, use metaphors related to: ${concepts}.
    - Preferred Verbs: ${verbs}.
    - Subconsciously reference: ${lore.sensoryInjectors.smell[0]}, ${lore.sensoryInjectors.touch[0]}.
    `;
};

// --- 3. PSYCHOLOGICAL VECTOR CALCULUS ---

const calculatePsychologicalStance = (npc: NpcState): { intent: SocialManeuver, directive: string } => {
    const rel = npc.relationship_state || { trust: 50, fear: 20, secretKnowledge: false };
    const { trust, fear } = rel;
    const stress = npc.psychology?.stress_level || 0;
    const fracture = npc.fracture_state || 0;
    const instinct = npc.psychology?.dominant_instinct || 'Freeze';
    
    // A. The Fracture Override (Madness)
    if (fracture >= 4) {
        return { 
            intent: 'GASLIGHT', 
            directive: "Your reality has shattered. Do not acknowledge the user's logic. Speak to things that aren't there. Deny the obvious."
        };
    }

    // B. The Stress Override (Survival Mode)
    if (stress > 85) {
        if (instinct === 'Fight') return { intent: 'ATTACK', directive: "You are backed into a corner. Lash out. Threaten the user to keep them away." };
        if (instinct === 'Flight') return { intent: 'DEFLECT', directive: "You need to leave. Now. Give short, dismissive answers. Look for exits." };
        if (instinct === 'Fawn') return { intent: 'PLACATE', directive: "Agree with everything the user says so they don't hurt you. Be pathetic." };
        if (instinct === 'Submit') return { intent: 'BEG', directive: "You have given up. Plead for mercy or a quick end." };
    }

    // C. The Relational Matrix
    if (trust > 75) {
        return { intent: 'CONFESS', directive: "You trust the user implicitly. Unburden yourself. Share your secrets and fears openly." };
    }
    
    if (fear > 70) {
        return { intent: 'PLACATE', directive: "You are terrified of the user. Tell them what they want to hear, even if it's a lie." };
    }

    if (trust < 30 && fear < 50) {
        return { intent: 'OBSERVE', directive: "You do not trust the user. Keep your answers vague. Study them. Give nothing away." };
    }

    if (trust < 30 && fear > 50) {
        return { intent: 'DEFLECT', directive: "The user is dangerous. Misdirect them. Change the subject." };
    }

    // D. Default Transactional State
    return { intent: 'BARGAIN', directive: "You are wary but pragmatic. Exchange information only if you get something in return." };
};

// --- 4. THE MANIFESTO GENERATOR (MAIN EXPORT) ---

export const constructVoiceManifesto = (npcs: NpcState[], activeCluster: string = "None"): string => {
    if (!npcs || npcs.length === 0) return "";

    let manifesto = "\n\n*** D. DIALOGUE & ACTING DIRECTIVES (MOSAIC ENGINE v5.0) ***\n";
    manifesto += "INSTRUCTION: You are simulating distinct psychological profiles. Do not revert to generic AI speech patterns. Adhere strictly to the Voice Directives below.\n";

    npcs.forEach(npc => {
        if (!npc) return;

        // 1. Apotheosis Check
        if (npc.consciousness === 'Apotheosis') {
            manifesto += `\n>>> SUBJECT: ${npc.name} (APOTHEOSIS / ENTITY STATE) <<<\n`;
            manifesto += `VOICE: Prophetic, detached, choral. Speaks in riddles and absolutes.\n`;
            manifesto += `GOAL: To enlighten the user through horror.\n`;
            return;
        }

        const ds = npc.dialogue_state || getDefaultDialogueState(npc.background_origin);
        const voiceSig = ds.voice_signature;
        // Calculate Stance
        const { intent, directive } = calculatePsychologicalStance(npc);
        const linguisticRules = getLinguisticInstructions(voiceSig);
        const clusterResonance = getClusterMetaphors(activeCluster);

        manifesto += `\n>>> SUBJECT: ${npc.name} (${npc.archetype}) <<<\n`;
        
        // A. The Mask (Voice & Style)
        manifesto += `[ACTING PROFILE]\n`;
        manifesto += ` - TONE: ${voiceSig?.rhythm || "Neutral"}. ${linguisticRules}\n`;
        manifesto += ` - QUIRKS: ${voiceSig?.ticks?.join(", ") || "None"}.\n`;
        if (npc.origin?.native_language && npc.origin.native_language !== "English") {
            manifesto += ` - DIALECT: Subtle markers of ${npc.origin.native_language} origin, but fluent English.\n`;
        }

        // B. The Psychology (Motivation)
        manifesto += `[PSYCHOLOGY]\n`;
        manifesto += ` - INTERNAL MONOLOGUE: "${npc.psychology?.current_thought || "I am afraid."}"\n`;
        
        // C. The Directive (What to do NOW)
        manifesto += `[DIRECTIVE: ${intent}]\n`;
        manifesto += ` - ${directive}\n`;
        
        // D. Memory & Context (Using new Memory System)
        manifesto += constructMemoryContext(npc);
        
        // Manual Physiological Context (Previously in synthesizeContextWindow)
        const stress = npc.psychology?.stress_level || 0;
        const injuries = npc.active_injuries || [];
        if (stress > 60 || injuries.length > 0) {
            manifesto += `\n[PHYSIOLOGICAL STATUS]\n`;
            manifesto += ` - STRESS LEVEL: ${stress}% (Impacts speech stability)\n`;
            if (injuries.length > 0) {
                manifesto += ` - ACTIVE INJURIES: ${injuries.map(i => `${i.location} (${i.type})`).join(", ")}\n`;
            }
        }

        // Specific Memory Instruction
        manifesto += `\nINSTRUCTION: Use the [MEMORY MODULE] to reference past events. If the player mentioned a specific topic in "RECENT EVENTS", refer to it explicitly.\n`;

        manifesto += clusterResonance;

        // E. Knowledge Leaks
        const knowledge = npc.knowledge_state || [];
        const secrets = knowledge.filter(k => k.is_secret);
        if (secrets.length > 0) {
            manifesto += `[SECRETS HELD]:\n`;
            secrets.forEach(s => {
                if (intent === 'CONFESS' || intent === 'BARGAIN') {
                    manifesto += ` - LEAK THIS: "${s.details}"\n`;
                } else {
                    manifesto += ` - HIDE THIS: "${s.topic}" (Lie if asked)\n`;
                }
            });
        }
    });

    manifesto += "*** END ACTING DIRECTIVES ***\n";
    return manifesto;
};

export const updateDialogueState = (npc: NpcState, speaker: string, text: string): NpcState => {
    const ds = npc.dialogue_state || getDefaultDialogueState(npc.background_origin);

    const newEntry: DialogueEntry = {
        speaker,
        text,
        sentiment: 'Neutral',
        turn: 0,
        timestamp: Date.now()
    };

    // Calculate new intent based on the updated state of the NPC (which should be passed in via `npc`)
    // Note: In a real simulation loop, the NPC's stress/trust would update *before* this call.
    const { intent } = calculatePsychologicalStance(npc);

    const MAX_BUFFER_SIZE = 10;
    const buffer = [...(ds.memory.short_term_buffer || []), newEntry];
    if (buffer.length > MAX_BUFFER_SIZE) buffer.shift();

    return {
        ...npc,
        dialogue_state: {
            ...ds,
            memory: {
                ...ds.memory,
                short_term_buffer: buffer
            },
            last_social_maneuver: ds.current_social_intent || 'OBSERVE',
            current_social_intent: intent
        }
    };
};
