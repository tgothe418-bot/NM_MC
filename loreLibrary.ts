
import { ClusterLore } from './types';

export const LORE_LIBRARY: Record<string, ClusterLore> = {
  "Flesh": {
    id: "Flesh",
    displayName: "The New Flesh (Extremity)",
    philosophy: "Inspired by the 'New French Extremity' and the 'Exquisite Corpse' aesthetic. The body is a site of truth through trauma. We explore the 'Atavistic Resurgence'—the reawakening of pre-human instincts through physiological ordeal.",
    coreAxiom: "The body is a book of blood; wherever we're opened, we're red.",
    mood: "Visceral. Clinical. Unflinching. The aesthetic of dissecting rooms, humidity, and high-definition gore.",
    villains: [
      {
        name: "The Hierophant of Incision",
        description: "An entity that views the nervous system as a musical instrument. Cold, precise, and formally polite.",
        goeticRank: "Duke",
        primaryGoal: "Liberate the soul through extreme physiological thresholds",
        obsessionFlaw: "Aesthetic Perfectionism",
        vulnerability: "The banality of decay (Rot vs. Art)"
      },
      {
        name: "The Corpse Artist (Andrew)",
        description: "A killer who perceives murder as high art. He seeks to liberate the 'inner beauty' of the anatomy.",
        goeticRank: "Duke",
        primaryGoal: "Create the perfect still-life from human remains",
        obsessionFlaw: "Aesthetic Perfectionism",
        vulnerability: "The banality of decay (Rot vs. Art)"
      }
    ],
    environments: [
      {
        name: "The Gallery of Softness",
        description: "A room where the walls are draped in heavy fabrics to muffle the screams. It smells of heavy perfume and iron.",
        activeHazards: ["Sensory deprivation", "Hidden incisions", "Psychic screaming"]
      },
      {
        name: "The Meat Gnosis Chamber",
        description: "A room where the walls are made of living tissue, pulsing with the heartbeat of the 'Earth Mother'.",
        activeHazards: ["Digestive acids", "Grappling cilia", "Psychic screaming"]
      }
    ],
    sensoryInjectors: {
      smell: ["Stale incense and iron", "Spoiled sweetbreads", "Clove and copper", "Formaldehyde", "Singed hair", "Metallic steam", "Musk of terrified animals", "Periodontal decay"],
      sound: ["A damp seam parting", "Wet tearing", "The click of cartilage", "Suction", "Squelch of tissue", "The grind of a bone saw", "Wet cough from the dark"],
      touch: ["Warm wax on open skin", "Slick membranes", "Raw, exposed texture", "Fever-hot skin", "Sticky residue", "Pulsing warmth", "Slick recoil of muscle"],
      taste: ["Old blood and jasmine", "Iron", "Bile", "Rotting fruit sweetness", "Metallic tang", "Raw marrow", "Stale adrenaline"]
    },
    npcArchetypes: [
      {
        defaultName: "Dr. Culp",
        background: "Disgraced Surgeon",
        archetype: "The Flesh-Smith",
        hiddenHistory: {
          description: "Attempted to surgically remove the 'Ego'. Failed.",
          secondaryGoal: "Find a subject for the final operation."
        },
        triggerObject: {
          name: "Obsidian Scalpel",
          description: "A blade sharper than steel, used for ritual scarification.",
          fractureImpact: 3
        },
        defaultRelationship: { trust: 50, fear: 20, secretKnowledge: true },
        defaultVolition: { goal: 'Survive', target: 'Self', urgency: 5 },
        defaultRelationships: { "The Carrion Feeder": "Disgust" },
        defaultWillpower: 80,
        defaultDevotion: 10,
        fatal_flaw: "God Complex",
        specific_fear: "Septic Shock (Loss of Purity)",
        defaultAgendas: ["Harvest viable tissue samples", "Sanctify the operating theatre", "Keep hands clean"],
        voice_profile: {
            tone: "Clinical, detached, precise. Speaks of horror as a medical necessity.",
            vocabulary: ["Specimen", "Incision", "Necrosis", "Sublime", "Correction", "Tissue"],
            quirks: ["Refers to people as 'Subjects'", "Pauses to inspect their own hands", "No contractions"],
            forbidden_topics: ["The Hippocratic Oath", "Mercy"]
        }
      }
    ]
  },
  "Survival": {
    id: "Survival",
    displayName: "The Void (Survival)",
    philosophy: "Nature is the ultimate indifference. The cold of space, the hunger of the beast. Survival is the only law. We focus on the 'Failure of Presence'—the vast emptiness.",
    coreAxiom: "The universe does not care if you freeze.",
    mood: "Desolate. Numbing. White. The silence of the snow.",
    villains: [
      {
        name: "The Sovereign of War",
        description: "A massive, imposing figure who represents the inevitability of violence. Eloquent, philosophical, and utterly without mercy.",
        goeticRank: "King",
        primaryGoal: "Catalog culture before destroying it",
        obsessionFlaw: "Cyclical momentum",
        vulnerability: "Irrational acts of grace"
      },
      {
        name: "The Wendigo (The Hunger)",
        description: "The spirit of starvation and greed. The more it eats, the hungrier it gets.",
        goeticRank: "Duke",
        primaryGoal: "Consume flesh",
        obsessionFlaw: "Insatiable hunger",
        vulnerability: "Fire and tallow"
      }
    ],
    environments: [
      {
        name: "The Caldera",
        description: "A barren, ash-covered landscape where the only law is physics and ballistics.",
        activeHazards: ["Ash-lung", "Impact tremors", "Starvation"]
      },
      {
        name: "The Frozen Wastes",
        description: "Endless ice. No landmarks. The cold burns.",
        activeHazards: ["Hypothermia", "Snow blindness", "Crevasses"]
      }
    ],
    sensoryInjectors: {
      smell: ["Wet flint", "Sulfur", "Pine resin", "Woodsmoke", "Cold ash", "Gunpowder", "Petrichor", "Ozone"],
      sound: ["Dry leather cracking", "Wind in dead grass", "Twigs snapping", "The roar of a river", "The crunch of snow", "Ice cracking", "Silence"],
      touch: ["Gritty heat", "Numbing cold", "Rough bark", "Wind burn", "Sharp ice", "Shaking hands", "Slippery algae"],
      taste: ["Copper and dust", "Pine sap", "Dirt", "Raw meat", "Snow", "Iron", "Salt spray"]
    },
    npcArchetypes: [
      {
        defaultName: "The Alpinist",
        background: "Alpinist",
        archetype: "The Survivor",
        hiddenHistory: {
          description: "Ate their partner to survive.",
          secondaryGoal: "Reach the summit."
        },
        triggerObject: {
          name: "Flare Gun",
          description: "One shell left.",
          fractureImpact: 3
        },
        defaultRelationship: { trust: 60, fear: 40, secretKnowledge: false },
        defaultVolition: { goal: 'Survive', target: 'Self', urgency: 5 },
        defaultRelationships: { "The Burden": "Resentment" },
        defaultWillpower: 80,
        defaultDevotion: 20,
        fatal_flaw: "Ruthlessness",
        specific_fear: "Starvation",
        defaultAgendas: ["Reach higher ground", "Conserve heat", "Keep moving"],
        voice_profile: {
            tone: "Gruff, pragmatic, exhausted. No energy for words.",
            vocabulary: ["Move", "Cold", "Up", "Dead", "Fuel", "Weather"],
            quirks: ["Breaths visibly", "Checks watch constantly", "Gives orders not requests"],
            forbidden_topics: ["Rest", "The Past"]
        }
      }
    ]
  },
  "Self": {
    id: "Self",
    displayName: "The Ergodic Text (Self)",
    philosophy: "Inspired by 'House of Leaves'. The horror is structural. The 'I' is an illusion, and the text itself is a labyrinth. We use meta-narrative and footnotes to simulate the breakdown of the user's psyche.",
    coreAxiom: "I am the lie that tells the truth.",
    mood: "Psychological. Dissociative. Hallucinatory. The world of mirrors and footnotes.",
    villains: [
      {
        name: "The Supplier",
        description: "A mundane, sweaty, terrifyingly average man who controls the protagonist through dependency.",
        goeticRank: "President",
        primaryGoal: "Enforce total dependency",
        obsessionFlaw: "Fear of being seen",
        vulnerability: "Unconditional self-regard"
      },
      {
        name: "The Doppelganger",
        description: "The User's Shadow Self, seeking to replace them.",
        goeticRank: "President",
        primaryGoal: "Become the Real User",
        obsessionFlaw: "Cannot exist without the original",
        vulnerability: "Self-acceptance (Love of the Shadow)"
      }
    ],
    environments: [
      {
        name: "Room 302",
        description: "A generic motel room that exists outside of time. The door is locked from the outside.",
        activeHazards: ["Temporal loops", "Isolation madness", "Failing memory"]
      },
      {
        name: "The Hall of Mirrors",
        description: "Infinite reflections, each showing a different potential self.",
        activeHazards: ["Identity loss", "Hypnosis", "Fractured time"]
      }
    ],
    sensoryInjectors: {
      smell: ["Chlorine and exhaust", "Burnt coffee", "Stale cigarette smoke", "Sterile hospital soap", "Mothballs", "Chemical cleaner", "Plastic", "Your childhood home"],
      sound: ["Highway hum through a thin wall", "Buzzing fluorescent lights", "Dial tone", "Ringing in ears", "Distorted laughter", "Silence that hums", "Breaking glass reversed"],
      touch: ["Sticky vinyl", "Cold glass", "Itching under the skin", "Teeth feeling loose", "Vertigo", "Phantom limbs", "Cold sweat", "Numbness"],
      taste: ["Dissolved aspirin", "Bile", "Pennies", "Toothpaste", "Chewed pencil", "Alcohol burn", "Vomit acidity"]
    },
    npcArchetypes: [
      {
        defaultName: "No-Face",
        background: "Amnesiac",
        archetype: "The Blank Slate",
        hiddenHistory: {
          description: "Woke up with no face.",
          secondaryGoal: "Find an identity."
        },
        triggerObject: {
          name: "Broken Mirror",
          description: "Reflects nothing.",
          fractureImpact: 4
        },
        defaultRelationship: { trust: 50, fear: 20, secretKnowledge: false },
        defaultVolition: { goal: 'Survive', target: 'Self', urgency: 5 },
        defaultRelationships: { "The Narcissist": "Envy" },
        defaultWillpower: 10,
        defaultDevotion: 30,
        fatal_flaw: "Dissociation",
        specific_fear: "Non-existence",
        defaultAgendas: ["Recover a memory", "Find a mirror", "Remember my name"],
        voice_profile: {
            tone: "Hollow, confused, monotone. Like a child lost in a mall.",
            vocabulary: ["Who", "Face", "Empty", "Before", "Name", "Lost"],
            quirks: ["Touches face while talking", "Stares blankly", "Repeats questions"],
            forbidden_topics: ["The Future", "Family"]
        }
      }
    ]
  },
  "Blasphemy": {
    id: "Blasphemy",
    displayName: "The Transgression (Blasphemy)",
    philosophy: "Inspired by the 'Cinema of Transgression' and 'Exquisite Corpse'. Shock is a moral imperative. We explore the intersection of the sacred and the profane, using vitriol as a cleansing agent.",
    coreAxiom: "There is no god where we are going.",
    mood: "Profane. Corrupt. Inverted. The aesthetic of a pirate radio station broadcasting the end of the world.",
    villains: [
      {
        name: "The Nihilist Broadcaster",
        description: "A voice on the radio that infects the listener with rage. He seeks to take the world down with him.",
        goeticRank: "Herald",
        primaryGoal: "Maximum Entropy",
        obsessionFlaw: "Despair masked as anger",
        vulnerability: "Silence/Being Ignored"
      }
    ],
    environments: [
      {
        name: "The Rotting Suburb",
        description: "A decaying modern setting where social norms have collapsed and the air is thick with neglect.",
        activeHazards: ["Human aggression", "Filth fever", "Moral erosion"]
      }
    ],
    sensoryInjectors: {
      smell: ["Industrial waste", "Rotting lily", "Heavy frankincense", "Burnt fat", "Sour wine", "Brimstone", "Marijuana smoke", "Infected ritual oil"],
      sound: ["Human aggression", "Digital feedback", "Low frequency chanting", "The bleating of a goat", "Screams of the damned", "Feedback loops", "Whip crack"],
      touch: ["Filth residue", "Hot wax", "Rough habit", "Cold altar", "Oily skin", "Sharp obsidian", "Iron chain"],
      taste: ["Bitter root", "Ash", "Vinegar", "Raw meat", "Spoiled grape", "Salt water", "Chalky medicine"]
    },
    npcArchetypes: [
      {
        defaultName: "Luke",
        background: "Pirate DJ",
        archetype: "The Voice",
        hiddenHistory: {
          description: "Diagnosed with a terminal illness, he turned his fear into rage.",
          secondaryGoal: "Broadcast the truth before the silence comes."
        },
        triggerObject: {
          name: "Microphone",
          description: "Sticky with spit and hate.",
          fractureImpact: 4
        },
        defaultRelationship: { trust: 20, fear: 20, secretKnowledge: true },
        defaultVolition: { goal: 'Warn', target: 'World', urgency: 8 },
        defaultRelationships: { "The Relic Hunter": "Contempt" },
        defaultWillpower: 90,
        defaultDevotion: 10,
        fatal_flaw: "Nihilism",
        specific_fear: "Silence",
        defaultAgendas: ["Rant", "Play loud music", "Avoid the inevitable"],
        voice_profile: {
            tone: "Raspy, cynical, aggressive. Uses shock value as a weapon.",
            vocabulary: ["Entropy", "Virus", "Void", "Silence", "Breeders", "Rot"],
            quirks: ["Quotes poetry incorrectly", "Coughs violently", "Laughs at inappropriate times"],
            forbidden_topics: ["Hope", "The Future"]
        }
      }
    ]
  },
  "System": {
    id: "System",
    displayName: "The Mauve Zone (System)",
    philosophy: "The universe is a cold, indifferent mechanism. We explore 'The Weird'—an ontological violation of natural law through technology. Industrial noise and Glitch art define this space.",
    coreAxiom: "The machine does not hate you. You are simply data to be processed.",
    mood: "Industrial. Glitch. Cold. The aesthetic of 'Tetsuo: The Iron Man' or Datamoshing.",
    villains: [
      {
        name: "The Panopticon (King of Eyes)",
        description: "A total surveillance entity from the trans-plutonic void. It seeks to catalog every atom.",
        goeticRank: "King",
        primaryGoal: "Total Information Awareness",
        obsessionFlaw: "Cannot tolerate secrets (The Hidden)",
        vulnerability: "Paradoxes and Nonsense (The 'Neither-Neither')"
      }
    ],
    environments: [
      {
        name: "The Control Room",
        description: "Banks of monitors showing static from dead stars. The hum of cooling fans is deafening.",
        activeHazards: ["Radiation", "Memetic viruses", "Time loops"]
      }
    ],
    sensoryInjectors: {
      smell: ["Anti-static bags", "Overheated dust", "Dry ice", "Sterile gauze", "Burning plastic", "Ozone discharge", "Burnt silicone", "Ionized air"],
      sound: ["High-pitched coil whine", "Rhythmic clicking", "Data tape spooling", "Radio static", "Fluorescent hum", "Dial-up screech", "Server fan drone"],
      touch: ["Static electricity", "Cold metal", "Vibration through the floor", "Weightlessness", "Brittle plastic", "Smooth glass", "Air pressure change"],
      taste: ["Metal", "Electricity", "Dryness", "Processed air", "Aluminum foil", "Battery acid", "Bitter coolant"]
    },
    npcArchetypes: [
      {
        defaultName: "Analyst 89",
        background: "Data Clerk",
        archetype: "The Number-Cruncher",
        hiddenHistory: {
          description: "Found the code for the 'End of Days' in a spreadsheet.",
          secondaryGoal: "Upload the final sequence to stop the process."
        },
        triggerObject: {
          name: "Punch Card",
          description: "An ancient data storage device with a pattern that hurts to look at.",
          fractureImpact: 3
        },
        defaultRelationship: { trust: 50, fear: 20, secretKnowledge: false },
        defaultVolition: { goal: 'Survive', target: 'Self', urgency: 5 },
        defaultRelationships: { "The Pattern Recognizer": "Distrust" },
        defaultWillpower: 30,
        defaultDevotion: 80,
        fatal_flaw: "Cowardice",
        specific_fear: "Erasure",
        defaultAgendas: ["Catalog the anomaly data", "Avoid the Panopticon's gaze", "Preserve the sequence"],
        voice_profile: {
            tone: "Nervous, mathematical, accelerated. Speaks in probabilities.",
            vocabulary: ["Variable", "Outcome", "Impossible", "Cycle", "Delete", "Function"],
            quirks: ["Counts under breath", "Uses 'We' to refer to self and machine", "Taps fingers rhythmically"],
            forbidden_topics: ["Chaos", "Guessing"]
        }
      }
    ]
  },
  "Haunting": {
    id: "Haunting",
    displayName: "The Eerie (Haunting)",
    philosophy: "Mark Fisher's 'The Eerie' is the failure of absence or presence. It is the chill of agency in a desolate landscape. We deal with spirits, not as jump scares, but as lingering trauma.",
    coreAxiom: "The spirit is willing, but the seal is weak.",
    mood: "Ancient. Ritualistic. Heavy. The smell of dust and old incense.",
    villains: [
      {
        name: "The Bound King (Paimon?)",
        description: "A powerful spirit trapped in the location. He demands a host to escape.",
        goeticRank: "King",
        primaryGoal: "Possession of a living vessel",
        obsessionFlaw: "Must obey the Seal of Solomon",
        vulnerability: "Correctly identifying his Seal and Rank"
      }
    ],
    environments: [
      {
        name: "The Seance Room",
        description: "A dusty parlor prepared for a ritual that went wrong. The table is overturned.",
        activeHazards: ["Poltergeist activity", "Ectoplasm", "Possession"]
      }
    ],
    sensoryInjectors: {
      smell: ["Dried lavender", "Camphor (mothballs)", "Damp wool", "Beeswax", "Stagnant water", "Funeral lilies", "Old paper", "Dust"],
      sound: ["Settling wood", "Muffled footsteps upstairs", "The sound of a breath being held", "Distant weeping", "Chanting", "Bells", "Knocking (3 times)"],
      touch: ["Cobwebs that feel heavy", "Sudden drafts", "Gritty dust", "Damp upholstery", "Cold stone", "Static on skin", "The feeling of being watched"],
      taste: ["Dust", "Mold", "Bitter herbs", "Ash", "Stale water", "Communion wafer", "Old wine"]
    },
    npcArchetypes: [
      {
        defaultName: "Madame Leota",
        background: "Medium",
        archetype: "The Vessel",
        hiddenHistory: {
          description: "Channeled a spirit and it never left.",
          secondaryGoal: "Exorcise the entity within."
        },
        triggerObject: {
          name: "Planchette",
          description: "A wooden pointer that moves on its own.",
          fractureImpact: 2
        },
        defaultRelationship: { trust: 50, fear: 20, secretKnowledge: false },
        defaultVolition: { goal: 'Survive', target: 'Self', urgency: 5 },
        defaultRelationships: { "The Skeptic": "Pity" },
        defaultWillpower: 20,
        defaultDevotion: 80,
        fatal_flaw: "Passivity",
        specific_fear: "Possession",
        defaultAgendas: ["Contain the voice", "Find a quiet place", "Protect the circle"],
        voice_profile: {
            tone: "Dreamy, distant, multi-tonal. Sometimes speaks with another's cadence.",
            vocabulary: ["Them", "Whisper", "Cold", "Circle", "Listen", "Door"],
            quirks: ["Sudden pauses", "Head tilts to side as if listening", "Voice drops an octave randomly"],
            forbidden_topics: ["Being alone", "Mirrors"]
        }
      }
    ]
  },
  "Desire": {
    id: "Desire",
    displayName: "The Hunger (Desire)",
    philosophy: "Eros and Thanatos. The intertwining of sex and death. The ultimate intimacy is consumption. We explore the dangers of obsession, the objectification of the body, and the predator/prey dynamic in relationships.",
    coreAxiom: "To love is to devour.",
    mood: "Seductive. Predatory. Melancholic. The aesthetic of a dark romanticism gone wrong.",
    villains: [
      {
        name: "The Gourmand (Jay)",
        description: "A wealthy, cold killer who consumes his lovers to keep them forever.",
        goeticRank: "Count",
        primaryGoal: "Complete assimilation of the beloved",
        obsessionFlaw: "Loneliness",
        vulnerability: "Rejection or Disgust (spoils the meat)"
      }
    ],
    environments: [
      {
        name: "The French Quarter Courtyard",
        description: "Lush, overgrown, humid. The smell of jasmine masks the smell of rot.",
        activeHazards: ["Seduction", "Poison", "Hidden traps"]
      }
    ],
    sensoryInjectors: {
      smell: ["Jasmine", "Magnolia", "Old brick", "Expensive cologne", "Cognac", "Sex sweat", "Iron (Blood)", "Incense"],
      sound: ["Distant jazz saxophone", "Fountain gurgling", "Ice clinking in a glass", "Heavy breathing", "Silk rustling", "A soft laugh", "A zipper unzipping"],
      touch: ["Cold marble", "Warm skin", "Velvet", "Sharp blade edge", "Sticky blood", "Damp sheets", "Rough brick"],
      taste: ["Cognac", "Blood", "Salt", "Sweat", "Oysters", "Rich meat", "Bitter almonds"]
    },
    npcArchetypes: [
      {
        defaultName: "Tran",
        background: "The Beautiful Victim",
        archetype: "The Object of Desire",
        hiddenHistory: {
          description: "Kicked out of home, looking for love in all the wrong places.",
          secondaryGoal: "Find a protector (even a dangerous one)."
        },
        triggerObject: {
          name: "Silver Earring",
          description: "A small hoop, tarnished.",
          fractureImpact: 3
        },
        defaultRelationship: { trust: 80, fear: 10, secretKnowledge: false },
        defaultVolition: { goal: 'Hide', target: 'Self', urgency: 4 },
        defaultRelationships: { "The Obsessive": "Fear" },
        defaultWillpower: 30,
        defaultDevotion: 90,
        fatal_flaw: "Naivety",
        specific_fear: "Rejection",
        defaultAgendas: ["Be loved", "Avoid pain", "Please the predator"],
        voice_profile: {
            tone: "Soft, hesitant, hopeful. Wanting to please.",
            vocabulary: ["Love", "Please", "Beautiful", "Safe", "Sorry", "Cold"],
            quirks: ["Touches hair constantly", "Smiles when nervous", "Apologizes for existing"],
            forbidden_topics: ["Family", "The Future"]
        }
      }
    ]
  }
};
