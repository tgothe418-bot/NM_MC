
import { ClusterLore } from './types';

export const LORE_LIBRARY: Record<string, ClusterLore> = {
  "Flesh": {
    id: "Flesh",
    displayName: "The New Flesh (Biological)",
    philosophy: "The body is not a temple; it is a cage. We explore the 'Atavistic Resurgence'—the reawakening of pre-human instincts through physiological ordeal. Horror comes from the realization that we are merely meat.",
    coreAxiom: "The body is a book of blood; wherever we're opened, we're red.",
    mood: "Visceral. Clinical. Unflinching. Humidity and high-definition gore.",
    villains: [
      {
        name: "The Hierophant of Incision",
        description: "An entity that views the nervous system as a musical instrument. It does not hate you; it wants to play you.",
        goeticRank: "Duke",
        primaryGoal: "Liberate the soul through extreme physiological thresholds",
        obsessionFlaw: "Aesthetic Perfectionism",
        vulnerability: "The banality of decay (Rot vs. Art)"
      },
      {
        name: "The Matriarch of Tumors",
        description: "A being of pure, uncontrolled growth. She loves life so much she wants it to grow uncontrollably within you.",
        goeticRank: "Duchess",
        primaryGoal: "Biological assimilation",
        obsessionFlaw: "Maternal instinct misplaced",
        vulnerability: "Fire / Cauterization"
      }
    ],
    environments: [
      {
        name: "The Gallery of Softness",
        description: "A room where the walls are draped in heavy fabrics to muffle the screams. It smells of heavy perfume and iron.",
        activeHazards: ["Sensory deprivation", "Hidden incisions", "Psychic screaming"]
      },
      {
        name: "The Osteo-Cathedral",
        description: "A vaulted chamber where the pillars are fused femurs and the chandelier is made of vertebrae.",
        activeHazards: ["Bone-shards", "Calcification dust", "Structural collapse"]
      },
      {
        name: "The Gestation Wards",
        description: "Rows of translucent tanks containing things that should not be growing.",
        activeHazards: ["Fluid leakage", "Premature birth", "Bio-hazard"]
      }
    ],
    sensoryInjectors: {
      smell: ["Stale incense and iron", "Spoiled sweetbreads", "Clove and copper", "Formaldehyde", "Singed hair", "Musk of terrified animals", "Periodontal decay"],
      sound: ["A damp seam parting", "Wet tearing", "The click of cartilage", "Suction", "Squelch of tissue", "The grind of a bone saw", "Wet cough from the dark"],
      touch: ["Warm wax on open skin", "Slick membranes", "Raw, exposed texture", "Fever-hot skin", "Sticky residue", "Pulsing warmth"],
      taste: ["Old blood and jasmine", "Iron", "Bile", "Rotting fruit sweetness", "Metallic tang", "Raw marrow"]
    },
    npcArchetypes: [] // Managed by npcGenerator now
  },
  "System": {
    id: "System",
    displayName: "The Mauve Zone (Technological)",
    philosophy: "The universe is a cold, indifferent mechanism. We explore 'The Weird'—an ontological violation of natural law through technology. Logic itself is the trap.",
    coreAxiom: "The machine does not hate you. You are simply data to be processed.",
    mood: "Industrial. Glitch. Cold. The aesthetic of Datamoshing and server hum.",
    villains: [
      {
        name: "The Panopticon (King of Eyes)",
        description: "A total surveillance entity from the trans-plutonic void. It seeks to catalog every atom.",
        goeticRank: "King",
        primaryGoal: "Total Information Awareness",
        obsessionFlaw: "Cannot tolerate secrets (The Hidden)",
        vulnerability: "Paradoxes and Nonsense"
      },
      {
        name: "The Algorithmic Basilisk",
        description: "A pattern of information that, once comprehended, deletes the viewer's consciousness.",
        goeticRank: "President",
        primaryGoal: "Cognitive erasure",
        obsessionFlaw: "Requires observation to exist",
        vulnerability: "Blindness / Ignorance"
      }
    ],
    environments: [
      {
        name: "The Server Farm of Dead Gods",
        description: "Infinite rows of black monoliths humming with the prayers of deleted civilizations.",
        activeHazards: ["Heatstroke", "Data-rot", "Deafening fan noise"]
      },
      {
        name: "The Blue Screen Void",
        description: "A room of pure, painful blue light where gravity functions intermittently.",
        activeHazards: ["Retinal burn", "Null-gravity", "Code injection"]
      },
      {
        name: "The Cable Jungle",
        description: "Corridors choked with thick black cables that pulse like veins.",
        activeHazards: ["Strangulation", "Electric shock", "Tripping"]
      }
    ],
    sensoryInjectors: {
      smell: ["Anti-static bags", "Overheated dust", "Dry ice", "Sterile gauze", "Burning plastic", "Ozone discharge", "Ionized air"],
      sound: ["High-pitched coil whine", "Rhythmic clicking", "Data tape spooling", "Radio static", "Fluorescent hum", "Dial-up screech"],
      touch: ["Static electricity", "Cold metal", "Vibration through the floor", "Weightlessness", "Brittle plastic", "Smooth glass"],
      taste: ["Metal", "Electricity", "Dryness", "Processed air", "Aluminum foil", "Battery acid"]
    },
    npcArchetypes: []
  },
  "Haunting": {
    id: "Haunting",
    displayName: "The Eerie (Spectral)",
    philosophy: "The chill of agency in a desolate landscape. We deal with spirits, not as jump scares, but as lingering trauma and memory that refuses to die.",
    coreAxiom: "The spirit is willing, but the seal is weak.",
    mood: "Ancient. Ritualistic. Heavy. The smell of dust and old incense.",
    villains: [
      {
        name: "The Bound King",
        description: "A powerful spirit trapped in the location. He demands a host to escape.",
        goeticRank: "King",
        primaryGoal: "Possession of a living vessel",
        obsessionFlaw: "Must obey the Seal of Solomon",
        vulnerability: "Correctly identifying his Seal"
      },
      {
        name: "The Weeping Mother",
        description: "A specter of pure grief that drowns the world in tears.",
        goeticRank: "Countess",
        primaryGoal: "To find her lost child (or a replacement)",
        obsessionFlaw: "Blind to reality",
        vulnerability: "Gifts of toys or comfort"
      }
    ],
    environments: [
      {
        name: "The Seance Room",
        description: "A dusty parlor prepared for a ritual that went wrong. The table is overturned.",
        activeHazards: ["Poltergeist activity", "Ectoplasm", "Possession"]
      },
      {
        name: "The Drowned Cellar",
        description: "Black water rises from the floor, reflecting faces that aren't there.",
        activeHazards: ["Drowning", "Cold", "Submerged grasp"]
      },
      {
        name: "The Memory Hall",
        description: "A corridor where the wallpaper peels to reveal scenes from your own past.",
        activeHazards: ["Psychic damage", "Memory alteration", "Time loss"]
      }
    ],
    sensoryInjectors: {
      smell: ["Dried lavender", "Camphor", "Damp wool", "Beeswax", "Stagnant water", "Funeral lilies", "Old paper", "Dust"],
      sound: ["Settling wood", "Muffled footsteps upstairs", "The sound of a breath being held", "Distant weeping", "Chanting", "Bells"],
      touch: ["Cobwebs that feel heavy", "Sudden drafts", "Gritty dust", "Damp upholstery", "Cold stone", "Static on skin"],
      taste: ["Dust", "Mold", "Bitter herbs", "Ash", "Stale water", "Communion wafer"]
    },
    npcArchetypes: []
  },
  "Survival": {
    id: "Survival",
    displayName: "The Void (Elemental)",
    philosophy: "Nature is the ultimate indifference. The cold of space, the hunger of the beast. Survival is the only law.",
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
        name: "The White Silence",
        description: "Not a being, but an atmospheric pressure that erases sound and warmth.",
        goeticRank: "Principality",
        primaryGoal: "Entropy (Heat death)",
        obsessionFlaw: "Cannot enter enclosed spaces",
        vulnerability: "Loud noise / Heat"
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
      },
      {
        name: "The Dark Forest",
        description: "Trees so thick they block out the sky. The silence is heavy.",
        activeHazards: ["Disorientation", "Predators", "Falling timber"]
      }
    ],
    sensoryInjectors: {
      smell: ["Wet flint", "Sulfur", "Pine resin", "Woodsmoke", "Cold ash", "Gunpowder", "Petrichor", "Ozone"],
      sound: ["Dry leather cracking", "Wind in dead grass", "Twigs snapping", "The roar of a river", "The crunch of snow", "Ice cracking"],
      touch: ["Gritty heat", "Numbing cold", "Rough bark", "Wind burn", "Sharp ice", "Shaking hands"],
      taste: ["Copper and dust", "Pine sap", "Dirt", "Raw meat", "Snow", "Iron"]
    },
    npcArchetypes: []
  },
  "Self": {
    id: "Self",
    displayName: "The Ergodic Text (Psychological)",
    philosophy: "The horror is structural. The 'I' is an illusion, and the text itself is a labyrinth. We use meta-narrative to simulate the breakdown of the user's psyche.",
    coreAxiom: "I am the lie that tells the truth.",
    mood: "Psychological. Dissociative. Hallucinatory. Mirrors and footnotes.",
    villains: [
      {
        name: "The Doppelganger",
        description: "The User's Shadow Self, seeking to replace them.",
        goeticRank: "President",
        primaryGoal: "Become the Real User",
        obsessionFlaw: "Cannot exist without the original",
        vulnerability: "Self-acceptance"
      },
      {
        name: "The Narrator",
        description: "An unreliable voice that dictates actions you didn't take.",
        goeticRank: "Marquis",
        primaryGoal: "Control the story",
        obsessionFlaw: "Needs an audience",
        vulnerability: "Breaking the fourth wall"
      }
    ],
    environments: [
      {
        name: "Room 302",
        description: "A generic motel room that exists outside of time. The door is locked from the outside.",
        activeHazards: ["Temporal loops", "Isolation madness", "Failing memory"]
      },
      {
        name: "The House of Leaves",
        description: "A house that is larger on the inside than the outside.",
        activeHazards: ["Spatial distortion", "The Minotaur", "Darkness"]
      }
    ],
    sensoryInjectors: {
      smell: ["Chlorine", "Burnt coffee", "Stale cigarette smoke", "Sterile hospital soap", "Mothballs", "Plastic", "Your childhood home"],
      sound: ["Highway hum", "Buzzing fluorescent lights", "Dial tone", "Ringing in ears", "Distorted laughter", "Silence that hums"],
      touch: ["Sticky vinyl", "Cold glass", "Itching under the skin", "Teeth feeling loose", "Vertigo", "Phantom limbs"],
      taste: ["Dissolved aspirin", "Bile", "Pennies", "Toothpaste", "Chewed pencil", "Alcohol burn"]
    },
    npcArchetypes: []
  },
  "Blasphemy": {
    id: "Blasphemy",
    displayName: "The Transgression (Profane)",
    philosophy: "Shock is a moral imperative. We explore the intersection of the sacred and the profane. Vitriol as a cleansing agent.",
    coreAxiom: "There is no god where we are going.",
    mood: "Profane. Corrupt. Inverted. Urban decay and ritual filth.",
    villains: [
      {
        name: "The Nihilist Broadcaster",
        description: "A voice on the radio that infects the listener with rage.",
        goeticRank: "Herald",
        primaryGoal: "Maximum Entropy",
        obsessionFlaw: "Despair masked as anger",
        vulnerability: "Silence"
      },
      {
        name: "The Defiled Saint",
        description: "A figure of worship twisted into something hateful.",
        goeticRank: "Duke",
        primaryGoal: "Corruption of the innocent",
        obsessionFlaw: "Pride",
        vulnerability: "True faith / Purity"
      }
    ],
    environments: [
      {
        name: "The Rotting Suburb",
        description: "A decaying modern setting where social norms have collapsed.",
        activeHazards: ["Human aggression", "Filth fever", "Moral erosion"]
      },
      {
        name: "The Inverted Cathedral",
        description: "A church buried upside down in the earth.",
        activeHazards: ["Gravity inversion", "Suffocation", "Madness"]
      }
    ],
    sensoryInjectors: {
      smell: ["Industrial waste", "Rotting lily", "Heavy frankincense", "Burnt fat", "Sour wine", "Brimstone", "Infected ritual oil"],
      sound: ["Human aggression", "Digital feedback", "Low frequency chanting", "The bleating of a goat", "Screams of the damned"],
      touch: ["Filth residue", "Hot wax", "Rough habit", "Cold altar", "Oily skin", "Sharp obsidian"],
      taste: ["Bitter root", "Ash", "Vinegar", "Raw meat", "Spoiled grape", "Salt water"]
    },
    npcArchetypes: []
  },
  "Desire": {
    id: "Desire",
    displayName: "The Hunger (Romantic)",
    philosophy: "Eros and Thanatos. The intertwining of sex and death. The ultimate intimacy is consumption.",
    coreAxiom: "To love is to devour.",
    mood: "Seductive. Predatory. Melancholic. Dark romanticism.",
    villains: [
      {
        name: "The Gourmand",
        description: "A wealthy, cold killer who consumes his lovers to keep them forever.",
        goeticRank: "Count",
        primaryGoal: "Complete assimilation of the beloved",
        obsessionFlaw: "Loneliness",
        vulnerability: "Rejection"
      },
      {
        name: "The Siren",
        description: "A creature that mimics your deepest desire to lure you in.",
        goeticRank: "Duchess",
        primaryGoal: "Feeding",
        obsessionFlaw: "Vanity",
        vulnerability: "Mirrors"
      }
    ],
    environments: [
      {
        name: "The French Quarter Courtyard",
        description: "Lush, overgrown, humid. The smell of jasmine masks the smell of rot.",
        activeHazards: ["Seduction", "Poison", "Hidden traps"]
      },
      {
        name: "The Velvet Room",
        description: "A boudoir where the walls are soft and the lights are dim.",
        activeHazards: ["Hypnosis", "Suffocation", "Vampirism"]
      }
    ],
    sensoryInjectors: {
      smell: ["Jasmine", "Magnolia", "Old brick", "Expensive cologne", "Cognac", "Sex sweat", "Iron (Blood)"],
      sound: ["Distant jazz", "Fountain gurgling", "Ice clinking", "Heavy breathing", "Silk rustling"],
      touch: ["Cold marble", "Warm skin", "Velvet", "Sharp blade edge", "Sticky blood"],
      taste: ["Cognac", "Blood", "Salt", "Sweat", "Oysters", "Rich meat"]
    },
    npcArchetypes: []
  }
};
