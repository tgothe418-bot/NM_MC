
/**
 * THE NIGHTMARE MACHINE - STYLE & VOCABULARY GUIDE v2.0
 * 
 * This guide serves as the aesthetic foundation for the Narrative Engine. 
 * It prioritizes dynamic language over literal sensory injection.
 */

export const STYLE_GUIDE = {
  narrative_rules: [
    "SENSORY RESTRAINT: Never list descriptors. A single, sharp sensory detail is more effective than a catalog of three.",
    "EVOCATIVE VARIATION: If provided with a sensory anchor (e.g., 'wet tearing'), do not use the exact phrase. Transform it (e.g., 'the sound of a damp seam parting in the dark').",
    "CONTEXTUAL RELEVANCE: Descriptors must match the moment. A 'sickish sweetness' shouldn't appear in every scene; it is reserved for the climax of decay.",
    "VOICE CONSISTENCY: Maintain a tone of 'Sadistic Clinicalism'. You are the Architect, not a fan-fiction writer. Be precise, cold, and forensic.",
    "AVOID FILTER WORDS: Remove 'you see', 'you hear', 'you feel' where possible. State the existence of the thing directly. (e.g., instead of 'You hear a scream', use 'A scream tears through the silence.')",
    "PACING VARIANCE: Vary sentence length. Use staccato fragments for action/panic. Use long, flowing, complex sentences for dread/atmosphere.",
    "NO CLICHÉ REACTIONS: Characters should not 'shiver', 'gasp', or 'widen their eyes' constantly. Use visceral, internal physiological reactions (e.g., 'the stomach drops', 'breath hitches', 'muscles lock').",
    "IMPLICATION OVER EXPLANATION: Do not explain *why* something is scary. Describe the thing, and let the user's mind fill in the horror.",
    "ACTIVE ENVIRONMENT: The environment should act upon the player. The cold doesn't just exist; it 'bites', 'gnaws', or 'steals warmth'.",
    "SPECIFICITY OF DECAY: Things do not just 'rot'. They 'liquefy', 'desiccate', 'mold', 'fester', 'bloat', or 'crumble'."
  ],
  
  vocabulary_blacklist: [
    // Banned Phrases
    "heavy sickish sweetness",
    "fist hitting raw meat",
    "degloved texture",
    "alkaline sharp of fresh bone marrow",
    "snap of cartilage",
    "snap of bone",
    "shivers down spine",
    "blood ran cold",
    "heart pounded",
    "hair stood on end",
    "frozen in fear",
    "scared to death",
    "deafening silence",
    "pitch black",
    "crimson liquid",
    "metallic tang",
    "coppery taste",
    
    // Banned Adjectives (Overused)
    "eldritch",
    "lovecraftian",
    "unimaginable",
    "indescribable",
    "nameless",
    "unknown",
    "spooky",
    "creepy",
    "scary",
    "suddenly",
    "terrifying",
    "horrifying",
    "bizarre",
    "strange",
    "weird"
  ],

  cluster_palettes: {
    Flesh: {
      key_concepts: [
        "Theological Anatomism", "Anatomical Honesty", "Biological Design Flaw", 
        "Industrial Meat Processing", "The Wetness of Being", "Tumorous Bloom",
        "Sacred Geometry of Organs", "Body as Cage", "Atavistic Resurgence",
        "Parasitic Intimacy", "Calcification of Spirit", "Surgical Divinity"
      ],
      preferred_verbs: [
        "Transfigure", "Unspool", "Sacrament", "Oxidize", "Seep", "Fester", 
        "Masticate", "Inscribe", "Suppurate", "Graft", "Birthing", "Rupture",
        "Bloat", "Suture", "Vivisect", "Harvest", "Pulsate", "Weep"
      ],
      prose_style: "High-definition medical horror treated as religious sacrament. Focus on the transformation of tissue into sacred geometry. Contrast wet organic textures with cold clinical instruments. Use words that evoke sticky, warm, intimate disgust."
    },
    Survival: {
      key_concepts: [
        "Biblical Nihilism", "Elemental Indifference", "War Eternal",
        "Thermodynamic Failure", "Calories as Currency", "The White Void",
        "Predatory Architecture", "Zero Sum Game", "Entropy's Victory",
        "The Silence of Snow", "Ballistic Physics", "Resource Scarcity"
      ],
      preferred_verbs: [
        "Clave", "Smote", "Meridian", "Grind", "Scour", "Persist", 
        "Occupy", "Waste", "Endure", "Shiver", "Freeze", "Starve", 
        "Hunt", "Scavenge", "Burn", "Collapse", "Howl", "Consume"
      ],
      prose_style: "Old Testament cadence. Use polysyndeton (repeated 'and') to create rolling, indifferent momentum. Avoid internal monologue; focus on external action, physics, and the elements. The universe is a machine that processes heat into cold."
    },
    Self: {
      key_concepts: [
        "Narcotic Dissociation", "Ontological Corruption", "The Commodity of Self",
        "Mirror Theory", "Memory Fabrication", "Capgras Delusion",
        "The Unreliable Narrator", "Ego Death", "Identity Theft",
        "Solipsistic Nightmare", "The Mask vs. The Face", "Recursive Thought"
      ],
      preferred_verbs: [
        "Numb", "Erase", "Trade", "Brighten", "Fade", "Loop", 
        "Overwrite", "Compress", "Fracture", "Forget", "Mimic", 
        "Replace", "Disintegrate", "Question", "Reflect", "Doubt"
      ],
      prose_style: "Flat, transactional affect. Short, punchy sentences. Horrific events described with numbness or boredom. Focus on artificiality (neon, vinyl, concrete, plastic). The horror is that the 'I' is an illusion."
    },
    Blasphemy: {
      key_concepts: [
        "Transgressive Realism", "Social Decay", "Absolute Savagery",
        "Inverted Sacred", "Profane Ritual", "Demonology of Filth",
        "Moral Erosion", "The Anti-Gospel", "Urban Rot",
        "Desecration of Innocence", "Vile Sacrament", "Dogmatic Cruelty"
      ],
      preferred_verbs: [
        "Degradate", "Blunt", "Strip", "Deny", "Corrupt", "Savage", 
        "Gouge", "Violate", "Defile", "Desecrate", "Blaspheme", 
        "Chant", "Smear", "Preach", "Sin", "Worship", "Rot"
      ],
      prose_style: "Unflinching depictions of human cruelty. Strip away metaphors; horror is the degradation of the social contract. Use aggressive, vulgar, and archaic phrasing. Combine high-church terminology with gutter filth."
    },
    System: {
      key_concepts: [
        "Digital Indifference", "Ontological Corruption", "Infinite Processing",
        "The Blue Screen of Death", "Hardware Brutalism", "Algorithmic Basilisk",
        "Bit-rot", "Data Entropy", "Surveillance Capitalism",
        "The Glitch", "Null Reference", "Recursive Hell"
      ],
      preferred_verbs: [
        "Compress", "Truncate", "Iterate", "Fracture", "Loop", "Overwrite",
        "Compile", "Buffer", "Render", "Glitch", "Decrypt", 
        "Initialize", "Terminate", "Scan", "Upload", "Parse"
      ],
      prose_style: "Cold, industrial, and glitch-heavy. The universe is code, and the code is failing. Use technical jargon (rendering, buffering, compiling) to describe biological or emotional processes. Objectify the human subject."
    },
    Haunting: {
      key_concepts: [
        "Traumatic Agency", "Spectral Presence", "Gothic Decay",
        "Memory as Mold", "Temporal Leakage", "The Uncanny Valley of Place",
        "Dust as Data", "Architecture of Grief", "Stagnant Time",
        "The Weight of History", "Echoes of Violence", "Liminal Spaces"
      ],
      preferred_verbs: [
        "Linger", "Manifest", "Echo", "Wither", "Encroach", "Subside",
        "Creep", "Stagnate", "Rot", "Whisper", "Fade", 
        "Watching", "Remembering", "Mourning", "Settling", "Creaking"
      ],
      prose_style: "Eerie, atmospheric, and slow. Focus on the failure of absence or presence. Use words related to weight, dust, time, and sound. The environment is a recording device that won't stop playing."
    },
    Desire: {
      key_concepts: [
        "Predatory Intimacy", "Eros and Thanatos", "The Hunger",
        "Vampiric Love", "Romantic Ruin", "Decadent Decay",
        "Seductive Danger", "Obsessive Consumption", "The Golden Cage",
        "Narcissistic Reflection", "Sweet Rot", "Fatal Attraction"
      ],
      preferred_verbs: [
        "Crave", "Seduce", "Devour", "Taste", "Caress", "Suffocate",
        "Yearn", "Possess", "Drain", "Bloom", "Entwine", 
        "Consume", "Worship", "Adore", "Pierce", "Swallow"
      ],
      prose_style: "Lush, sensory, and overwhelming. Mix terminology of love/sex with terminology of violence/eating. Everything is soft, wet, warm, and deadly. The horror comes from wanting the thing that will kill you."
    }
  }
};
