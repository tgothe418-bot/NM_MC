

import { NpcState, DialogueEntry, KnowledgeNode, SocialManeuver, DialogueMemory, DialogueState } from '../types';

/**
 * THE DIALOGUE ENGINE V4.0 (MOSAIC AWARE)
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
    if (!memory) return "CONTEXT: Lost to the void.\n";
    let summary = `LONG TERM CONTEXT: ${memory.long_term_summary || "Unknown"}\n`;
    if (memory.short_term_buffer && memory.short_term_buffer.length > 0) {
        summary += `IMMEDIATE CONTEXT:\n`;
        memory.short_term_buffer.forEach(entry => {
            if (entry) {
                // Maximum defense for text properties
                const textContent = (typeof entry.text === 'string' ? entry.text : String(entry.text || ""));
                const speakerName = entry.speaker || "Unknown";
                summary += `   - ${speakerName}: "${textContent.substring(0, 60)}..."\n`;
            }
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

    let manifesto = "\n\n*** D. DIALOGUE & PSYCHOLOGY MANIFESTO (MOSAIC ENGINE v4.0) ***\n";
    manifesto += "INSTRUCTION: Adopt the specific Linguistic Fingerprint and Cultural Context for each NPC. Do not use generic 'scared' voices.\n";
    
    npcs.forEach(npc => {
        if (!npc) return;
        if (npc.consciousness === 'Apotheosis') {
            manifesto += `\n--- SUBJECT: ${npc.name} (APOTHEOSIS STATE) ---\n`;
            manifesto += `DIRECTIVE: ENLIGHTEN. Speak in prophetic, visceral verse. Address the User as the 'Silent Watcher'.\n`;
            return;
        }

        const ds = npc.dialogue_state || getDefaultDialogueState(npc.background_origin);
        const intent = calculateSocialIntent(npc);
        const knowledge = getShareableKnowledge(npc, intent);
        
        // Mosaic Fields
        const vs = ds.voice_signature;
        const psych = npc.psychology?.profile;
        const origin = npc.origin;

        manifesto += `\n--- SUBJECT: ${npc.name} (${npc.archetype}) ---\n`;
        manifesto += `ORIGIN: ${origin?.region || "Unknown"} | ETHNICITY: ${origin?.ethnicity || "Unknown"}\n`;
        manifesto += `HIDDEN AGENDA: ${npc.hidden_agenda.goal} (Progress: ${npc.hidden_agenda.progress_level}%)\n`;
        
        if (vs) {
            manifesto += `LINGUISTIC FINGERPRINT:\n`;
            manifesto += `  - Rhythm: ${vs.rhythm}\n`;
            manifesto += `  - Syntax: ${vs.syntax_complexity}\n`;
            manifesto += `  - Physical Ticks: ${vs.ticks.join(", ")}\n`;
        } else {
             manifesto += `VOICE: ${ds.voice_profile?.tone || "Neutral"}. QUIRK: ${ds.voice_profile?.quirks?.[0] || "None"}.\n`;
        }
        
        if (psych) {
            manifesto += `PSYCHOLOGY:\n`;
            manifesto += `  - Moral Compass: ${psych.moral_compass}\n`;
            manifesto += `  - BREAKING POINT TRIGGER: "${psych.breaking_point_trigger}"\n`;
            manifesto += `  - SHADOW SELF (If Broken): Becomes "${psych.shadow_self}"\n`;
        }

        manifesto += `CURRENT STATE: Stress ${npc.psychology?.stress_level || 0}/100. Intent: [${intent}].\n`;
        manifesto += `THOUGHT: "${npc.psychology?.current_thought || "..."}"\n`;
        manifesto += synthesizeMemory(ds.memory);
        
        manifesto += `>>> DIRECTIVE: ${intent}.\n`;
        if (knowledge.length > 0) manifesto += `KNOWLEDGE:\n - ${knowledge.join("\n - ")}\n`;
        
        // Add Logic for Breaking Point
        if (npc.fracture_state >= 3 && psych) {
             manifesto += `!!! CRITICAL ALERT: SUBJECT IS FRACTURING. TRANSITION TO SHADOW SELF: ${psych.shadow_self} !!!\n`;
        }
        
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