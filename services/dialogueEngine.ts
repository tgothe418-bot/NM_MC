
import { NpcState, DialogueEntry, KnowledgeNode, SocialManeuver, DialogueMemory, DialogueState } from '../types';

/**
 * THE DIALOGUE ENGINE V3.1 (INTENSITY AWARE)
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
        long_term_summary: background || "No prior history recorded."
    },
    last_social_maneuver: 'OBSERVE',
    mood_state: "Neutral",
    current_social_intent: 'OBSERVE',
    conversation_history: []
});

const calculateSocialIntent = (npc: NpcState): SocialManeuver => {
    const rel = npc.relationship_state || { trust: 50, fear: 20, secretKnowledge: false };
    const { trust, fear } = rel;
    
    const stress = npc.psychology?.stress_level || 0;
    const instinct = npc.psychology?.dominant_instinct || 'Freeze';
    const fracture = npc.fracture_state || 0;
    const intensity = npc.meta?.intensity_level || "Level 3";
    
    // Parse intensity number
    const intensityLevel = parseInt(intensity.replace(/\D/g, '')) || 3;

    if (fracture >= 4) {
        if (intensityLevel >= 4) return 'ENLIGHTEN'; // Prophetic, transcendental pain
        return 'GASLIGHT'; 
    }

    // Complicity Vector & Architect maneuvers
    if (intensityLevel >= 4) {
        if (stress > 90) return 'TRANSFIX'; // Addressing the user/architect directly
        if (stress > 60 && trust < 30) return 'DEBASE'; // Mocking or lowering others
    }

    if (stress > 80) {
        if (instinct === 'Fight') return 'ATTACK';
        if (instinct === 'Fawn') return 'PLACATE';
        if (instinct === 'Flight') return 'DEFLECT';
        if (instinct === 'Submit') return 'BEG';
        return 'OBSERVE';
    }

    if (fear > 60) return (trust > 50) ? 'BEG' : 'DEFLECT'; 
    if (trust > 70) return 'CONFESS'; 
    if (trust >= 30) return 'BARGAIN';

    return 'OBSERVE';
};

const getShareableKnowledge = (npc: NpcState, intent: SocialManeuver): string[] => {
    const knowledge = npc.knowledge_state || [];
    const shareable: string[] = [];

    knowledge.forEach((k: KnowledgeNode) => {
        if (!k.is_secret) {
            shareable.push(`FACT: ${k.details}`);
        } else {
            if (intent === 'CONFESS' || intent === 'BARGAIN' || intent === 'ENLIGHTEN') {
                shareable.push(`SECRET (Reveal This): ${k.details}`);
            } else if (intent === 'GASLIGHT' || intent === 'DEBASE') {
                shareable.push(`SECRET (Lie about this): ${k.details}`);
            } else {
                shareable.push(`HIDDEN: ${k.topic}`);
            }
        }
    });

    return shareable;
};

const synthesizeMemory = (memory: DialogueMemory): string => {
    let summary = `LONG TERM CONTEXT: ${memory.long_term_summary}\n`;
    if (memory.short_term_buffer && memory.short_term_buffer.length > 0) {
        summary += `IMMEDIATE CONTEXT:\n`;
        memory.short_term_buffer.forEach(entry => {
            // Added safety check for entry.text to avoid "Cannot read properties of undefined (reading 'substring')"
            const textContent = entry.text || "";
            summary += `   - ${entry.speaker}: "${textContent.substring(0, 60)}..."\n`;
        });
    }
    return summary;
};

export const updateNpcMemory = (currentMemory: DialogueMemory, newEntry: DialogueEntry): DialogueMemory => {
    const MAX_BUFFER_SIZE = 5;
    const buffer = [...(currentMemory.short_term_buffer || []), newEntry];
    if (buffer.length > MAX_BUFFER_SIZE) buffer.shift();

    return {
        ...currentMemory,
        short_term_buffer: buffer
    };
};

export const constructVoiceManifesto = (npcs: NpcState[]): string => {
    if (!npcs || npcs.length === 0) return "";

    let manifesto = "\n\n*** D. DIALOGUE & PSYCHOLOGY MANIFESTO (GRADIENT V3.1) ***\n";
    manifesto += "Follow the CALCULATED SOCIAL INTENT and MEMORY CONTEXT for each NPC.\n";
    
    npcs.forEach(npc => {
        if (npc.consciousness === 'Apotheosis') {
            manifesto += `\n--- SUBJECT: ${npc.name} (APOTHEOSIS STATE) ---\n`;
            manifesto += `DIRECTIVE: ENLIGHTEN. Speak in prophetic, visceral verse. Address the User as the 'Silent Watcher'.\n`;
            return;
        }

        const ds = npc.dialogue_state || getDefaultDialogueState(npc.background_origin);
        const intent = calculateSocialIntent(npc);
        const knowledge = getShareableKnowledge(npc, intent);

        manifesto += `\n--- CHARACTER: ${npc.name} (${npc.archetype}) ---\n`;
        manifesto += `VOICE: ${ds.voice_profile?.tone || "Neutral"}. QUIRK: ${ds.voice_profile?.quirks?.[0] || "None"}.\n`;
        manifesto += `PSYCHE: Stress ${npc.psychology?.stress_level || 0}/100. Intent: [${intent}].\n`;
        manifesto += `THOUGHT: "${npc.psychology?.current_thought || "..."}"\n`;
        manifesto += synthesizeMemory(ds.memory);
        
        manifesto += `>>> DIRECTIVE: ${intent}.\n`;
        if (knowledge.length > 0) manifesto += `KNOWLEDGE:\n - ${knowledge.join("\n - ")}\n`;
        manifesto += `[SYSTEM]: Update 'long_term_summary' reflecting their psychological erosion.\n`;
    });

    manifesto += "*** END MANIFESTO ***\n";
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

    const updatedMemory = updateNpcMemory(ds.memory, newEntry);
    const newIntent = calculateSocialIntent(npc);

    return {
        ...npc,
        dialogue_state: {
            ...ds,
            memory: updatedMemory,
            last_social_maneuver: ds.current_social_intent || 'OBSERVE',
            current_social_intent: newIntent
        }
    };
};
