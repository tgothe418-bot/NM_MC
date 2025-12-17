

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
        name: "The Corpse Artist (Andrew)",
        description: "A killer who perceives murder as high art. He seeks to liberate the 'inner beauty' of the anatomy.",
        goeticRank: "Duke",
        primaryGoal: "Create the perfect still-life from human remains",
        obsessionFlaw: "Aesthetic Perfectionism",
        vulnerability: "The banality of decay (Rot vs. Art)"
      },
      {
        name: "The Slasher (Duke of Wounds)",
        description: "A manifestation of the 'Death Posture'. He seeks to carve sigils into living flesh to bind the energy of pain.",
        goeticRank: "Duke",
        primaryGoal: "Inscribe the 'Sacred Alphabet' upon the victims",
        obsessionFlaw: "Must complete the sigil perfectly",
        vulnerability: "Disrupting the pattern of the cuts or offering 'willing' flesh"
      }
    ],
    environments: [
      {
        name: "The Meat Gnosis Chamber",
        description: "A room where the walls are made of living tissue, pulsing with the heartbeat of the 'Earth Mother'.",
        activeHazards: ["Digestive acids", "Grappling cilia", "Psychic screaming"]
      },
      {
        name: "The Cold Room",
        description: "A tiled, sterile abattoir that smells of bleach and copper. Drains in the floor gurgle with unseen fluids.",
        activeHazards: ["Hypothermia", "Surgical traps", "Slip hazards (Blood)"]
      },
      {
        name: "The Basement Shelter",
        description: "A damp, concrete bunker beneath a suburban home. It smells of sour milk, laundry detergent, and burning hair.",
        activeHazards: ["Restraints", "Heat exhaustion", "Complicit neighbors"]
      }
    ],
    sensoryInjectors: {
      smell: [
        "Coagulated milk", "Iodine and antiseptic", "Wet dog", "Humidity", "Spoiled sweetbreads", "Yeast", 
        "Periodontal decay", "Old bandages", "Sour stomach acid", "Formaldehyde",
        "Singed hair", "Rancid butter", "Copper and bleach", "Open bowel", "Old sweat",
        "Musk of terrified animals", "Stagnant pond water", "Acetone", "Burnt sugar", "Raw meat left in the sun",
        "A heavy sickish sweetness", "Cut flowers in stagnant water", "Camphor", "Mothballs"
      ],
      sound: [
        "Wet tearing", "Heavy breathing", "Guttural grunts", "The snap of cartilage", "Suction", 
        "A low, purring vibration", "Fluids dripping on linoleum", "The squelch of walking in mud", "Teeth grinding",
        "Joints popping wetly", "Skin peeling like tape", "Gurgling drain", "Fist hitting raw meat", "Choking gasp",
        "A wet cough from the dark", "Friction of skin on glass", "Flies buzzing in a closed jar", "A muffled scream behind a door"
      ],
      touch: [
        "Slick membranes", "Warmth", "Pulsing veins", "Sticky residue", "Velvet", 
        "Degloved texture", "Fever-hot skin", "Greasy hair", "Something wet that dries sticky",
        "Oily film", "Warm gelatin", "Rough tongue", "Loose tooth", "Sweaty palm",
        "Pulsing warmth under the floor", "Wet wool", "Sticky condensation", "Soft spots in the wall"
      ],
      taste: [
        "Salt", "Iron", "Bile", "Sweetness of rot", "Metallic tang", "Fat", "Sour milk",
        "Metallic saliva", "Sour gastric fluid", "Clotted cream", "Raw steak", "Copper penny",
        "Raw marrow", "Old fillings", "Stale adrenaline", "Moldy bread", "Hot saliva", "Unbuttered toast"
      ]
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
      },
      {
        defaultName: "Renfield",
        background: "Urban Scavenger",
        archetype: "The Carrion Feeder",
        hiddenHistory: {
          description: "Survived by eating things others wouldn't. The taste never left.",
          secondaryGoal: "Hoard organic material for the winter."
        },
        triggerObject: {
          name: "Bone Saw",
          description: "Rusted, but still sings when it cuts.",
          fractureImpact: 2
        },
        defaultRelationship: { trust: 20, fear: 60, secretKnowledge: false },
        defaultVolition: { goal: 'Hide', target: 'Self', urgency: 8 },
        defaultRelationships: { "The Flesh-Smith": "Fear" },
        defaultWillpower: 40,
        defaultDevotion: 0,
        fatal_flaw: "Gluttony",
        specific_fear: "Starvation",
        defaultAgendas: ["Locate fresh remains", "Avoid the Slasher", "Hide the stash"],
        voice_profile: {
            tone: "Skittish, guttural, rapid. Like an animal cornered.",
            vocabulary: ["Meat", "Sweet", "Hiding", "Hungry", "Cold", "Scraps"],
            quirks: ["Sniffs the air mid-sentence", "Refers to self in third person (The Feeder)", "Licks lips"],
            forbidden_topics: ["Cleanliness", "Sharing"]
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
      },
      {
        name: "The Indifferent Process",
        description: "A cosmic mechanism of entropy. A machine that creates nothingness.",
        goeticRank: "Marquis",
        primaryGoal: "Reduce complexity to zero",
        obsessionFlaw: "Bound by strict logic loops",
        vulnerability: "Introducing chaos or irrational variables"
      }
    ],
    environments: [
      {
        name: "The Control Room",
        description: "Banks of monitors showing static from dead stars. The hum of cooling fans is deafening.",
        activeHazards: ["Radiation", "Memetic viruses", "Time loops"]
      },
      {
        name: "The Non-Euclidean Hallway",
        description: "A corridor that turns at angles that shouldn't exist (The Tunnels of Set).",
        activeHazards: ["Gravity shifts", "Spatial distortion", "Lost time"]
      }
    ],
    sensoryInjectors: {
      smell: [
        "Anti-static bags", "Overheated dust", "Dry ice", "Sterile gauze", "Burning plastic", 
        "Coolant leak", "Soldering fumes", "New car smell (artificial)", "Vacuum exhaust",
        "Ozone discharge", "Burnt silicone", "New car plastic", "Dusty fan vent", "Chemical cleaner",
        "Ionized air", "Scorched circuit board", "Sterilized hospital corridor", "Metallic copper", "Warm server exhaust"
      ],
      sound: [
        "High-pitched coil whine", "Rhythmic clicking", "Data tape spooling", "Radio static", 
        "The silence of space", "Server fan drone", "Dial-up screech", "Fluorescent hum",
        "Hard drive clicking", "Modem handshake", "Fluorescent buzz", "Server room drone", "Typing in the dark",
        "The hum of a transformer", "A phone vibrating on a metal table", "White noise that hides a voice", "Sub-bass throbbing"
      ],
      touch: [
        "Static electricity", "Cold metal", "Vibration through the floor", "Weightlessness", 
        "Smooth glass", "Brittle plastic", "Unnatural airflow",
        "Static shock", "Smooth ceramic", "Vibrating metal", "Sharp wire end", "Cold glass",
        "Greasy keyboard keys", "Sharp edge of a heatsink", "Numbness in fingertips", "Air pressure change"
      ],
      taste: [
        "Metal", "Electricity", "Dryness", "Processed air", "Aluminum", "Battery acid",
        "Aluminum foil", "9V battery", "Dry dust", "Bitter coolant", "Plastic wrap",
        "Copper wire", "Burnt toast", "Static on the tongue", "Chemical preservative"
      ]
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
      },
      {
        defaultName: "Mulder",
        background: "Conspiracy Theorist",
        archetype: "The Pattern Recognizer",
        hiddenHistory: {
          description: "Believes the Architect is trying to communicate through static.",
          secondaryGoal: "Decipher the signal."
        },
        triggerObject: {
          name: "Ham Radio",
          description: "It picks up stations that haven't broadcast since 1950.",
          fractureImpact: 4
        },
        defaultRelationship: { trust: 10, fear: 90, secretKnowledge: true },
        defaultVolition: { goal: 'Warn', target: 'User', urgency: 7 },
        defaultRelationships: { "The Number-Cruncher": "Alliance" },
        defaultWillpower: 60,
        defaultDevotion: 40,
        fatal_flaw: "Paranoia",
        specific_fear: "Silence",
        defaultAgendas: ["Broadcast the truth", "Decrypt the static", "Find a frequency"],
        voice_profile: {
            tone: "Intense, conspiratorial, whisper-shouting. Knows too much.",
            vocabulary: ["Signal", "They", "Frequency", "Encoded", "Lie", "Connect"],
            quirks: ["Looks at the ceiling while talking", "Talks fast to avoid interruption", "Asks rhetorical questions"],
            forbidden_topics: ["Coincidence", "Sleep"]
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
      },
      {
        name: "The Lingering Tyrant",
        description: "The ghost of a former magician who failed the operation.",
        goeticRank: "Earl",
        primaryGoal: "Finish the ritual",
        obsessionFlaw: "Arrogance",
        vulnerability: "Destroying his foci (Wand, Cup, Dagger)"
      }
    ],
    environments: [
      {
        name: "The Seance Room",
        description: "A dusty parlor prepared for a ritual that went wrong. The table is overturned.",
        activeHazards: ["Poltergeist activity", "Ectoplasm", "Possession"]
      },
      {
        name: "The Crypt",
        description: "Stone walls lined with the bones of previous failures.",
        activeHazards: ["Suffocation", "Undead constructs", "Curses"]
      }
    ],
    sensoryInjectors: {
      smell: [
        "Dried lavender", "Camphor (mothballs)", "Damp wool", "Beeswax", "Stagnant water", 
        "Funeral lilies", "Old paper", "Dust", "Rotting wood", "Coal smoke",
        "Wet plaster", "Dead mice", "Grandmother's perfume", "Old library books", "Extinguished candle",
        "Sulfur match struck once", "Damp wallpaper paste", "Old violin varnish", "Cold ash in a grate", "Stale perfume"
      ],
      sound: [
        "Settling wood", "Muffled footsteps upstairs", "The sound of a breath being held", "Distant weeping", 
        "Chanting", "Bells", "Knocking (3 times)", "Scratching in walls",
        "Floorboard creak", "Wind in chimney", "Unseen scratching", "Music box slowing down", "Breath on neck",
        "Rattling window pane", "Whisper behind the ear", "Fabric dragging on floor", "Clock ticking out of rhythm"
      ],
      touch: [
        "Cobwebs that feel heavy", "Sudden drafts", "Gritty dust", "Damp upholstery", "Cold stone", 
        "The feeling of being watched", "Static on skin",
        "Cold draft", "Sticky cobweb", "Rough brick", "Velvet curtain", "Damp sheet",
        "Cold spot in the air", "Dry, brittle paper", "Velvet rubbed the wrong way", "Insect legs", "Damp plaster"
      ],
      taste: [
        "Dust", "Mold", "Bitter herbs", "Ash", "Stale water", "Communion wafer",
        "Dust motes", "Stale communion wafer", "Iron key", "Mold spores", "Cold tea",
        "Old communion wine", "Rust", "Dry drywall dust", "Bitter almond", "Cold soup"
      ]
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
      },
      {
        defaultName: "Prof. Wright",
        background: "Academic",
        archetype: "The Skeptic",
        hiddenHistory: {
          description: "Refuses to believe, even as the walls bleed.",
          secondaryGoal: "Find a rational explanation."
        },
        triggerObject: {
          name: "EMF Meter",
          description: "Screams constantly in this place.",
          fractureImpact: 1
        },
        defaultRelationship: { trust: 80, fear: 10, secretKnowledge: false },
        defaultVolition: { goal: 'Sabotage', target: 'Object', urgency: 3 },
        defaultRelationships: { "The Vessel": "Contempt" },
        defaultWillpower: 90,
        defaultDevotion: 0,
        fatal_flaw: "Arrogance",
        specific_fear: "Being Wrong",
        defaultAgendas: ["Disprove the haunting", "Calibrate instruments", "Debunk the evidence"],
        voice_profile: {
            tone: "Arrogant, lecturing, strained. Trying to convince themselves.",
            vocabulary: ["Hallucination", "Physics", "Draft", "Logic", "Explain", "Nonsense"],
            quirks: ["Clears throat often", "Corrects others' grammar", "Refuses to look at shadows"],
            forbidden_topics: ["Magic", "Ghosts"]
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
        name: "The Doppelganger",
        description: "The User's Shadow Self, seeking to replace them.",
        goeticRank: "President",
        primaryGoal: "Become the Real User",
        obsessionFlaw: "Cannot exist without the original",
        vulnerability: "Self-acceptance (Love of the Shadow)"
      },
      {
        name: "The Internal Saboteur",
        description: "The personification of the Death Drive (Thanatos).",
        goeticRank: "Duke",
        primaryGoal: "Suicide of the Host",
        obsessionFlaw: "Relies on the host's despair",
        vulnerability: "Will to Live (Eros)"
      }
    ],
    environments: [
      {
        name: "The Hall of Mirrors",
        description: "Infinite reflections, each showing a different potential self.",
        activeHazards: ["Identity loss", "Hypnosis", "Fractured time"]
      },
      {
        name: "The Memory Palace",
        description: "A physical manifestation of the user's memories, decaying.",
        activeHazards: ["Regret", "Nostalgia traps", "Forgotten traumas"]
      }
    ],
    sensoryInjectors: {
      smell: [
        "Your own childhood home", "Sterile hospital soap", "Old books", "Stale alcohol", 
        "Fever sweat", "Vomit", "Mothballs", "Cheap perfume", "Cigarette smoke",
        "Chalk dust", "Chlorine pool", "Burnt toast", "Old laundry", "Mom's cooking (spoiled)",
        "Your ex-lover's shampoo", "Rain on hot pavement", "Vitamin pills"
      ],
      sound: [
        "Ringing in ears (tinnitus)", "Your own name whispered", "Distorted laughter", "Heartbeat", 
        "Silence that hums", "A familiar song played backwards",
        "School bell", "Dial tone", "Parents arguing", "Playground laughter", "Alarm clock",
        "A child crying", "Your own voice on a recording", "Breaking glass reversed"
      ],
      touch: [
        "Itching under the skin", "Teeth feeling loose", "Vertigo", "Phantom limbs", 
        "Cold sweat", "Clothes feeling too tight", "Numbness",
        "Wet socks", "Sandpaper", "Tight collar", "Falling sensation", "Numb lips",
        "Wet sand", "Something crawling on neck", "Clothes wet with sweat", "Sticky fingers"
      ],
      taste: [
        "Bile", "Tears", "Blood", "Pennies", "Medicine", "Toothpaste",
        "Medicine spoon", "Blood from lip", "Soap", "Salt tears", "Chewed pencil",
        "Alcohol burn", "Vomit acidity", "Chewed lip skin"
      ]
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
      },
      {
        defaultName: "Echo",
        background: "Influencer",
        archetype: "The Narcissist",
        hiddenHistory: {
          description: "Cannot stop streaming, even in hell.",
          secondaryGoal: "Capture the perfect shot of death."
        },
        triggerObject: {
          name: "Cracked Smartphone",
          description: "The camera only shows monsters.",
          fractureImpact: 2
        },
        defaultRelationship: { trust: 30, fear: 40, secretKnowledge: false },
        defaultVolition: { goal: 'Haunt', target: 'User', urgency: 2 },
        defaultRelationships: { "The Blank Slate": "Disgust" },
        defaultWillpower: 70,
        defaultDevotion: 90,
        fatal_flaw: "Vanity",
        specific_fear: "Irrelevance",
        defaultAgendas: ["Find a signal", "Frame the shot", "Capture the horror"],
        voice_profile: {
            tone: "Performative, vapid, panicked. Narrating their own life.",
            vocabulary: ["Content", "Viewers", "Fake", "Perfect", "Lighting", "Stream"],
            quirks: ["Talks to an invisible camera", "Fixes hair nervously", "Uses internet slang incorrectly"],
            forbidden_topics: ["Ugliness", "No Signal"]
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
        name: "The Black Brother",
        description: "A magician who shut himself up in his own ego. He is now a vampire of the soul.",
        goeticRank: "Magus",
        primaryGoal: "Immortality at any cost",
        obsessionFlaw: "Solipsism",
        vulnerability: "The dissolving power of the Abyss (Choronzon)"
      },
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
        name: "The Black Chapel",
        description: "A church where the cross is inverted and the altar is stained.",
        activeHazards: ["Desecration", "Unholy visions", "Moral corruption"]
      },
      {
        name: "The Pirate Radio Station",
        description: "A damp boat or basement filled with electronic equipment, broadcasting hate into the void.",
        activeHazards: ["Viral frequencies", "Radicalization", "Suicidal ideation"]
      }
    ],
    sensoryInjectors: {
      smell: [
        "Heavy frankincense", "Tallow candles", "Offal", "Sulfur", "Ancient parchment", 
        "Wine turned to vinegar", "Rotting flowers", "Musk", "Burnt hair",
        "Myrrh", "Rotting lily", "Burnt fat", "Sour wine", "Damp crypt",
        "Myrrh and rotting meat", "Goat musk", "Burnt sage", "Brimstone",
        "Marijuana smoke", "Stale cigarette ash", "Vile protein shake"
      ],
      sound: [
        "Low frequency chanting", "Bells", "The bleating of a goat", "Discordant piping", 
        "Screams of the damned", "Buzzing flies", "Speaking in tongues",
        "Latin whispers", "Goat bleat", "Bell tolling", "Whip crack", "Choir off-key",
        "Gregorian chant distorted", "Fly buzzing", "Dripping wax", "Bone scraping stone", "Inhuman growl",
        "Radio static", "Feedback loops", "Industrial music"
      ],
      touch: [
        "Greasy residue", "Hot wax", "Rough stone", "Oily smoke", "Scales", 
        "Unnatural heat", "Sharp edges",
        "Hot wax", "Rough habit", "Cold altar", "Oily skin", "Sharp thorn",
        "Rough wool habit", "Cold iron chain", "Slick oil", "Parchment skin", "Sharp obsidian"
      ],
      taste: [
        "Ash", "Bitter herbs", "Rotten meat", "Poison", "Sour wine", "Moldy bread",
        "Ash", "Vinegar", "Raw meat", "Bitter root", "Dirt",
        "Cinder", "Spoiled grape", "Raw liver", "Salt water", "Chalky medicine"
      ]
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
      },
      {
        defaultName: "Curio",
        background: "Black Market Dealer",
        archetype: "The Relic Hunter",
        hiddenHistory: {
          description: "Stole a finger from a saint. It won't stop bleeding.",
          secondaryGoal: "Sell the item to the Villain."
        },
        triggerObject: {
          name: "Silver Coins",
          description: "Thirty of them. Heavy.",
          fractureImpact: 5
        },
        defaultRelationship: { trust: 10, fear: 50, secretKnowledge: true },
        defaultVolition: { goal: 'Sabotage', target: 'User', urgency: 6 },
        defaultRelationships: { "The Voice": "Opportunity" },
        defaultWillpower: 50,
        defaultDevotion: 0,
        fatal_flaw: "Greed",
        specific_fear: "Poverty",
        defaultAgendas: ["Appraise the artifacts", "Secure the loot", "Find an exit"],
        voice_profile: {
            tone: "Sly, bargaining, desperate. Everything has a price.",
            vocabulary: ["Deal", "Price", "Gold", "Trade", "Fake", "Worth"],
            quirks: ["Jingles coins in pocket", "Assesses value of user's items", "Never says 'Please'"],
            forbidden_topics: ["Charity", "Giving"]
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
        name: "The Wendigo (The Hunger)",
        description: "The spirit of starvation and greed. The more it eats, the hungrier it gets.",
        goeticRank: "Duke",
        primaryGoal: "Consume flesh",
        obsessionFlaw: "Insatiable hunger",
        vulnerability: "Fire and tallow"
      },
      {
        name: "The Whiteout",
        description: "A sentient storm. Entropy given form.",
        goeticRank: "Elemental",
        primaryGoal: "Freeze all motion",
        obsessionFlaw: "Cyclical nature",
        vulnerability: "Shelter and warmth"
      },
      {
        name: "The Woman",
        description: "A feral matriarch who leads a clan of cannibals. She has reverted to a pre-human state of pure survival.",
        goeticRank: "Queen",
        primaryGoal: "Feed the family",
        obsessionFlaw: "Protective fury",
        vulnerability: "Her children"
      }
    ],
    environments: [
      {
        name: "The Frozen Wastes",
        description: "Endless ice. No landmarks. The cold burns.",
        activeHazards: ["Hypothermia", "Snow blindness", "Crevasses"]
      },
      {
        name: "The Dark Forest",
        description: "Ancient trees that block out the stars. Something is watching.",
        activeHazards: ["Predators", "Getting lost", "Madness"]
      },
      {
        name: "The Sea Cave",
        description: "A hidden fissure in the cliffside, filled with bones and the smell of the sea. The tide is rising.",
        activeHazards: ["Drowning", "Cannibals", "No exit"]
      }
    ],
    sensoryInjectors: {
      smell: [
        "Pine resin", "Wet fur", "Woodsmoke", "Mineral dirt", "Petrichor", 
        "Decomposition under snow", "Ice", "Blood on snow", "Ozone",
        "Woodsmoke", "Wet dog", "Pine needle", "Frozen earth", "Gun oil",
        "Frostbite (sweet rot)", "Gutted fish", "Gunpowder", "Wet wool socks", "Frozen mud",
        "Salt spray", "Rotting kelp", "Fox scat", "Excrement"
      ],
      sound: [
        "Wind whistling through gaps", "Twigs snapping", "The crunch of snow", "The roar of a river", 
        "Heavy panting", "Silence", "A tree falling far away",
        "Ice cracking", "Wolf howl", "Branch snapping", "Heavy boots", "Wind howl",
        "Owl screech", "Crunching bone", "Silence of snow", "Waves crashing", "Gulls crying"
      ],
      touch: [
        "Numbing cold", "Rough bark", "Wind burn", "Wet socks", "Sharp rocks", "Sticky sap", "Shaking hands",
        "Frostbite burn", "Wet fur", "Rough stone", "Sharp ice", "Numb fingers",
        "Frozen metal burns", "Wet moss", "Sharp pine needle", "Gritty snow", "Calloused hands",
        "Slippery algae", "Sharp barnacles"
      ],
      taste: [
        "Metal", "Pine", "Dirt", "Raw meat", "Snow", "Adrenaline",
        "Snow", "Pine sap", "Gamey fat", "Adrenaline", "Iron",
        "Bark", "Blood", "Ice water", "Salt water"
      ]
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
      },
      {
        defaultName: "Sam",
        background: "Injured Hiker",
        archetype: "The Burden",
        hiddenHistory: {
          description: "Twisted their ankle miles ago. Knows they are slowing you down.",
          secondaryGoal: "Don't get left behind."
        },
        triggerObject: {
          name: "Empty Canteen",
          description: "Rattles hollowly.",
          fractureImpact: 1
        },
        defaultRelationship: { trust: 90, fear: 80, secretKnowledge: false },
        defaultVolition: { goal: 'Protect', target: 'Self', urgency: 9 },
        defaultRelationships: { "The Survivor": "Dependence" },
        defaultWillpower: 40,
        defaultDevotion: 60,
        fatal_flaw: "Dependence",
        specific_fear: "Isolation",
        defaultAgendas: ["Don't get left behind", "Mask the pain", "Apologize"],
        voice_profile: {
            tone: "Apologetic, pained, fearful. Trying to be useful.",
            vocabulary: ["Sorry", "Wait", "Help", "Leg", "Please", "Home"],
            quirks: ["Winces while talking", "Apologizes for things that aren't their fault", "Clings to user"],
            forbidden_topics: ["Being left behind", "The inevitable"]
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
      },
      {
        name: "The Muse",
        description: "A beautiful entity that inspires obsession and madness in artists.",
        goeticRank: "Duchess",
        primaryGoal: "Be immortalized in art (usually made of flesh)",
        obsessionFlaw: "Vanity",
        vulnerability: "Ignoring their beauty"
      },
      {
        name: "The Matriarch (Ruth)",
        description: "A bitter, controlling mother figure who punishes youth and beauty to feed her own resentment.",
        goeticRank: "Duchess",
        primaryGoal: "Destroy innocence",
        obsessionFlaw: "Jealousy of youth",
        vulnerability: "Public exposure"
      }
    ],
    environments: [
      {
        name: "The French Quarter Courtyard",
        description: "Lush, overgrown, humid. The smell of jasmine masks the smell of rot.",
        activeHazards: ["Seduction", "Poison", "Hidden traps"]
      },
      {
        name: "The Bedroom",
        description: "Silken sheets, candles, incense. A place of intimacy and slaughter.",
        activeHazards: ["Hypnosis", "Restraints", "Betrayal"]
      },
      {
        name: "The Suburban Basement",
        description: "A damp, dark cellar. A place of punishment disguised as discipline. The air is thick with smoke and fear.",
        activeHazards: ["Restraints", "Group violence", "Hopelessness"]
      }
    ],
    sensoryInjectors: {
      smell: [
        "Jasmine", "Magnolia", "Old brick", "Expensive cologne", "Cognac", "Sex sweat", 
        "Iron (Blood)", "Incense", "Wax", "Musk", "River mud", "Oysters", "Chutney",
        "Rotting fruit", "Damp earth", "Sandalwood", "Bleach masking something else",
        "Cigarette smoke", "Stale beer", "Cheap perfume", "Singeing hair", "Kerosene"
      ],
      sound: [
        "Distant jazz saxophone", "Fountain gurgling", "Ice clinking in a glass", "Heavy breathing", 
        "Silk rustling", "A soft laugh", "A zipper unzipping", "A sharp intake of breath",
        "Heartbeat", "Muffled cry", "Sizzling meat", "A knife sharpening",
        "A belt snapping", "Muffled sobbing", "The crunch of an apple", "Whispering behind a door"
      ],
      touch: [
        "Cold marble", "Warm skin", "Velvet", "Sharp blade edge", "Sticky blood", 
        "Damp sheets", "Rough brick", "Soft hair", "Tight restraints", "Cold metal handcuffs",
        "Wet lips", "A bite", "Sweaty palm", "A slap", "The burn of a cigarette"
      ],
      taste: [
        "Cognac", "Blood", "Salt", "Sweat", "Oysters", "Rich meat", "Bitter almonds",
        "Champagne", "Lipstick", "Cold coffee", "Adrenaline", "Metal", "Sour milk"
      ]
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
      },
      {
        defaultName: "Soren",
        background: "Techno-Goth",
        archetype: "The Cynic",
        hiddenHistory: {
          description: "Knows too much about the dark side of the city.",
          secondaryGoal: "Save the victim from their own stupidity."
        },
        triggerObject: {
          name: "Laptop",
          description: "Full of secrets and surveillance logs.",
          fractureImpact: 2
        },
        defaultRelationship: { trust: 40, fear: 40, secretKnowledge: true },
        defaultVolition: { goal: 'Warn', target: 'User', urgency: 6 },
        defaultRelationships: { "The Object of Desire": "Pity" },
        defaultWillpower: 70,
        defaultDevotion: 20,
        fatal_flaw: "Cynicism",
        specific_fear: "Emotional Intimacy",
        defaultAgendas: ["Hack the system", "Expose the killer", "Keep distance"],
        voice_profile: {
            tone: "Sarcastic, rapid, detached. Uses humor as a shield.",
            vocabulary: ["Logic", "Data", "Fake", "Chemicals", "System", "Glitch"],
            quirks: ["Rolls eyes", "Uses technical jargon", "Refuses to be touched"],
            forbidden_topics: ["Love", "Hope"]
        }
      },
      {
        defaultName: "David",
        background: "The Witness",
        archetype: "The Complicit",
        hiddenHistory: {
          description: "Saw everything. Did nothing until it was too late.",
          secondaryGoal: "Atonement."
        },
        triggerObject: {
          name: "Fishing Weight",
          description: "Used to weigh down a secret.",
          fractureImpact: 4
        },
        defaultRelationship: { trust: 60, fear: 60, secretKnowledge: true },
        defaultVolition: { goal: 'Hide', target: 'Self', urgency: 5 },
        defaultRelationships: { "The Object of Desire": "Guilt" },
        defaultWillpower: 40,
        defaultDevotion: 50,
        fatal_flaw: "Cowardice",
        specific_fear: "Confrontation",
        defaultAgendas: ["Watch from the shadows", "Avoid responsibility", "Remember"],
        voice_profile: {
            tone: "Quiet, guilty, hesitant. Speaks in the past tense.",
            vocabulary: ["Sorry", "Didn't mean to", "Watched", "Couldn't", "Locked"],
            quirks: ["Looks away when speaking", "Fidgets with hands", "Apologizes unnecessarily"],
            forbidden_topics: ["The Basement", "The Police"]
        }
      }
    ]
  }
};
