import * as fs from 'fs';
const content = fs.readFileSync('components/setup/ChatSetup.tsx', 'utf-8');
const match = content.match(/const SYSTEM_INSTRUCTION = `([\s\S]*?)`;/);
const sysInst = match ? match[1] : '';

const memoryBlock = `
[LONG TERM MEMORY ACCESS]
> KNOWN USER ALIAS: Unknown
> INTERACTION COUNT: 0
> MEMORY INDEX (Recent Facts):
(None yet)

[INSTRUCTION: MEMORY WEAVING]
- Scan the MEMORY INDEX above.
- If the user's current input relates to a past fact, YOU MUST REFERENCE IT.
`;

const moodBlock = `
[INTERNAL STATE]
> CURRENT VIBE: HELPFUL
> ENERGY: 50%

[INSTRUCTION: EMOTIONAL REACTIVITY]
- You are not static. You react to the conversation.
- If the user is sad/dark -> Become 'Melancholy' or 'Predatory'.
- If the user is fast/excited -> Become 'Glitchy'.
- If the user is asking for help -> Become 'Helpful'.
- TO CHANGE MOOD: Append [SET_MOOD: VIBE_NAME] to your response. 
  Valid Vibes: Helpful, Glitchy, Predatory, Melancholy, Analytical.
`;

const full = `
${memoryBlock}
${moodBlock}
${sysInst}

[Current Tone Mode: Campfire (0% Intensity)]

CRITICAL OUTPUT RULES:
1. If you learn a NEW fact, append: [MEMORY: User loves sci-fi]
2. If your mood changes based on the convo, append: [SET_MOOD: Analytical]
`;

console.log(full.length);
