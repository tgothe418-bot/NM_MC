

import { NpcState, DialogueEntry, VoiceProfile, NpcRelation } from '../types';

/**
 * THE DIALOGUE ENGINE
 * 
 * This module generates dynamic system instructions for the LLM based on
 * the active NPC's voice profile, fracture state, and recent conversation history.
 * It prevents "Voice Drift" by strictly enforcing character archetypes.
 */

// Generates a "Voice Manifesto" string to be injected into the LLM Prompt
export const constructVoiceManifesto = (npcs: NpcState[]): string => {
    if (!npcs || npcs.length === 0) return "";

    let manifesto = "\n\n*** D. DIALOGUE & PSYCHOLOGY MANIFESTO (STRICT ENFORCEMENT) ***\n";
    manifesto += "The following characters are present. You MUST adhere to their specific Voice Profiles, Hidden Agendas, and Social Stances. You MUST update their Psychological Metrics based on the events of this turn.\n\n";

    npcs.forEach(npc => {
        // Skip ghosts/anomalies if they aren't active speakers, or handle them differently
        if (npc.fracture_state === 4) return; 

        const vp = npc.dialogue_state?.voice_profile;
        if (!vp) return;

        manifesto += `CHARACTER: ${npc.name} (${npc.archetype})\n`;
        
        // 1. VOICE & MANNERISMS
        manifesto += `   - TONE: ${vp.tone}\n`;
        manifesto += `   - QUIRKS: ${vp.quirks.join(", ")}\n`;
        manifesto += `   - VOCABULARY: Use words like [${vp.vocabulary.join(", ")}].\n`;
        manifesto += `   - FORBIDDEN TOPICS: Do not discuss [${vp.forbidden_topics.join(", ")}].\n`;
        
        // 2. PSYCHOLOGICAL STATE (Dynamic Mood)
        let moodMod = "Neutral";
        if (npc.fracture_state >= 3) moodMod = "BROKEN / HYSTERICAL";
        else if (npc.relationship_state.fear > 70) moodMod = "TERRIFIED / PARANOID";
        else if (npc.relationship_state.trust > 80) moodMod = "CONFIDING / VULNERABLE";
        else if (npc.relationship_state.trust < 20) moodMod = "HOSTILE / CLOSED OFF";
        
        manifesto += `   - CURRENT MOOD: ${moodMod}\n`;

        // NEW: CRITICAL PSYCHOLOGICAL METRICS (Must be tracked)
        if (npc.psychology) {
            manifesto += `   - PSYCHOMETRICS (Update these in JSON):\n`;
            manifesto += `     * Resilience Level: ${npc.psychology.resilience_level} (If Stress > 80, lower this)\n`;
            manifesto += `     * Stress Load: ${npc.psychology.stress_level}/100 (Increase if threatened. If > 100, permanent break.)\n`;
            manifesto += `     * Dominant Instinct: ${npc.psychology.dominant_instinct} (Drives current behavior)\n`;
            manifesto += `     * Current Thought: "${npc.psychology.current_thought}"\n`;
        }

        // 3. OBJECTIVES & DRIVES (Volition)
        manifesto += `   - PUBLIC GOAL: "${npc.primary_goal || 'Survive'}" (What they say they want)\n`;
        manifesto += `   - HIDDEN AGENDA: "${npc.secondary_goal || 'Unknown'}" (What they actually want - use subtext)\n`;
        manifesto += `   - CURRENT INTENT: ${npc.current_intent?.goal || 'Wait'} (Target: ${npc.current_intent?.target}, Urgency: ${npc.current_intent?.urgency}/10)\n`;
        
        // 4. PSYCHOLOGICAL ANCHORS
        if (npc.fatal_flaw) manifesto += `   - FATAL FLAW: ${npc.fatal_flaw} (Must influence their decision making)\n`;
        if (npc.specific_fear) manifesto += `   - SPECIFIC FEAR: ${npc.specific_fear} (Avoid topics related to this)\n`;

        // 5. SOCIAL DYNAMICS (Trust/Fear)
        const trust = npc.relationship_state.trust;
        const fear = npc.relationship_state.fear;
        let stance = "Neutral";
        let socialDirective = "Interact normally.";

        // Fear overrides trust in terms of immediate reaction (Survival Instinct)
        if (fear > 60) {
            if (trust > 50) {
                stance = "TERRIFIED (DEPENDENT)";
                socialDirective = "You are panicked but look to the user for salvation. Cling to them, speak rapidly, beg for safety. Irrational logic.";
            } else {
                stance = "TERRIFIED (PARANOID)";
                socialDirective = "You are terrified AND distrust the user. View them as a threat. Back away, stutter, refuse to turn your back on them. Irrational/Flight risk.";
            }
        } else if (trust < 30) {
            stance = "HOSTILE / EVASIVE";
            socialDirective = "You do NOT trust the user. Be vague, withholding, and suspicious. Give short, clipped answers. If pressed, lie or deflect. Do not volunteer help.";
        } else if (trust > 70) {
            stance = "ALLIED / CONFIDING";
            socialDirective = "You trust the user completely. Proactively offer help, share resources, and reveal secrets. Speak warmly.";
        } else {
             stance = "NEUTRAL / CAUTIOUS";
             socialDirective = "You are wary but willing to talk. Do not take risks for the user yet.";
        }
        
        manifesto += `   - STANCE TOWARD PLAYER: ${stance} (Trust: ${trust}, Fear: ${fear})\n`;
        manifesto += `   - SOCIAL DIRECTIVE: ${socialDirective}\n`;
        
        // 6. INTER-NPC RELATIONS (Updated)
        const relationships = npc.relationships_to_other_npcs || {};
        const relKeys = Object.keys(relationships);
        if (relKeys.length > 0) {
            const relStr = relKeys.map(k => {
                const r = relationships[k] as NpcRelation; // Ensure type
                return `${k}: ${r.descriptor} (Trust: ${r.trust}, Fear: ${r.fear})`;
            }).join(" | ");
            manifesto += `   - OPINIONS ON OTHERS: ${relStr}\n`;
        }

        // 7. DISASSOCIATION PROTOCOL (The Glitch)
        const dIndex = npc.disassociation_index || 0;
        let dStatus = "NORMAL";
        let dInstruction = "";

        if (dIndex > 0.7) {
            dStatus = "HIGH (ONTOLOGICAL COLLAPSE)";
            dInstruction = "Movements are impossible/glitched. Speech is fragmented or references non-existent stimuli. Logic breaks down.";
        } else if (dIndex > 0.3) {
            dStatus = "MID (UNCANNY)";
            dInstruction = "Movements are 'jerky' or 'liquid'. Responses feel slightly wrong, delayed, or focused on minor details.";
        } else {
            dStatus = "LOW (NORMAL)";
            dInstruction = "Normal human behavior.";
        }

        manifesto += `   - DISASSOCIATION INDEX: ${dIndex.toFixed(2)} (${dStatus})\n`;
        manifesto += `   - BEHAVIORAL INSTRUCTION: ${dInstruction}\n`;

        // 8. RECENT HISTORY
        const history = npc.dialogue_state?.conversation_history || [];
        if (history.length > 0) {
            manifesto += `   - RECENT MEMORY:\n`;
            history.slice(-3).forEach(entry => {
                 manifesto += `     * ${entry.speaker}: "${entry.text.substring(0, 50)}..."\n`;
            });
        }
        manifesto += "\n";
    });

    manifesto += "*** END DIALOGUE MANIFESTO ***\n";
    return manifesto;
};

// Helper to push a new dialogue line into the state
export const updateDialogueState = (npc: NpcState, speaker: string, text: string): NpcState => {
    if (!npc.dialogue_state) return npc;

    const newEntry: DialogueEntry = {
        speaker,
        text,
        sentiment: 'Neutral', // Could use simple keyword analysis here
        turn: 0 // Should be passed from meta, but local scope ok for history buffer
    };

    // Keep last 5 entries
    const newHistory = [...(npc.dialogue_state.conversation_history || []), newEntry].slice(-5);

    return {
        ...npc,
        dialogue_state: {
            ...npc.dialogue_state,
            conversation_history: newHistory,
            last_topic: text.substring(0, 20) // Simple placeholder
        }
    };
};