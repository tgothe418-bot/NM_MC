
import { 
  NpcState, 
  VoiceSignature, 
  DialogueState,
  PsychologicalProfile,
  LoreContext
} from '../types';
import { getDefaultDialogueState } from './dialogueEngine';
import { hydrateUserCharacter } from './geminiService';

/**
 * NPC GENERATOR ENGINE V8.1 (ANTI-COLLISION & UNIQUE ROLES)
 * 
 * "High-Resolution" Character Synthesis.
 * Includes duplicate prevention and vastly expanded semantic pools.
 */

const JOBS_MEDICAL = [
  "Trauma Surgeon", "Hospice Nurse", "Forensic Pathologist", "Sleep Technician", 
  "Dialysis Nurse", "Emergency Dispatcher", "Veterinary Surgeon", "Phlebotomist",
  "Clinical Psychologist", "Radiologist", "Mortuary Assistant", "Field Medic",
  "Pharmacist", "Dental Hygienist", "Anesthesiologist", "Physical Therapist",
  "Home Health Aide", "Medical Coder", "Virologist", "Optometrist",
  "Organ Transport Driver", "Burn Unit Nurse", "Experimental Drug Trial Coordinator",
  "MRI Technologist", "Paleopathologist", "Prosthetist", "Toxicologist",
  "Psychiatric Orderly", "Blood Bank Manager", "Medical Examiner", "Genealogist",
  "Epidemiologist", "Night Shift Paramedic", "Geriatric Care Specialist",
  "Cryogenics Technician", "Bio-Hazard Decontamination Specialist", "Speech Pathologist",
  "Audiologist", "Embalmer", "Plastic Surgeon", "Surgical Scrub Tech",
  "Oncology Nurse", "Radiotherapy Technician", "Hazardous Material Medic", "Flight Nurse"
];

const JOBS_ACADEMIC = [
  "Archivist of Obscure Media", "Entomologist", "Theologian", "Quantum Physicist", 
  "Art Restorer", "Linguistic Anthropologist", "Mycologist", "Historian of Medicine",
  "Cartographer", "Ethnomusicologist", "Structural Engineer", "Rare Book Librarian",
  "Adjunct Professor of Philosophy", "Museum Curator", "Botanist", "Geologist",
  "Mathematician", "Sociologist", "Urban Planner", "Restoration Ecologist",
  "Folklore Historian", "Chaos Mathematician", "Professor of Ethics", 
  "Ornithologist", "Marine Biologist", "Archaeologist", "Cryptographer",
  "Professor of Architecture", "Semiotics Expert", "Classical Philologist",
  "Industrial Designer", "Acoustics Researcher", "Demonologist (Academic)",
  "Victorian Literature Scholar", "Numismatist", "Horologist (Time)", 
  "Theoretical Astrophysicist", "Memory Researcher", "Comparative Religion Scholar",
  "Dendrochronologist", "Palaeographer", "Forensic Linguist"
];

const JOBS_LABOR = [
  "Deep Sea Welder", "Crime Scene Cleaner", "Abattoir Supervisor", "Long-haul Trucker", 
  "Oil Rig Diver", "High-Voltage Lineman", "Gravedigger", "Taxidermist",
  "Sanitation Worker", "Subway Tunnel Inspector", "Steelworker", "Night Watchman",
  "Forester", "Commercial Fisherman", "Custodian", "Plumber", "Electrician",
  "HVAC Repairman", "Butcher", "Exterminator", "Miner",
  "Sewer Inspection Drone Operator", "Slaughterhouse Floor Manager", "High-Rise Window Washer",
  "Roadkill Collector", "Lighthouse Keeper", "Crematorium Operator", "Salvage Diver",
  "Junkyard Manager", "Demolition Expert", "Railroad Track Inspector",
  "Crane Operator", "Industrial Diver", "Waste Management Specialist",
  "Elevator Mechanic", "Locksmith (Industrial)", "Cargo Ship Engineer", 
  "Water Treatment Plant Operator", "Tunnel Boring Machine Operator",
  "Cell Tower Climber", "Blast Furnace Technician", "Recycling Center Sorter"
];

const JOBS_SERVICE = [
  "Bartender at a Dive Bar", "Hotel Night Auditor", "Flight Attendant", "Sommelier",
  "Line Cook", "Casino Dealer", "Wedding Planner", "Dog Walker", "Personal Shopper",
  "Barista", "Concierge", "Travel Agent", "Real Estate Agent", "Hair Stylist",
  "Tattoo Artist", "Yoga Instructor", "Massage Therapist", "Bouncer",
  "Night Shift Gas Station Clerk", "Pawn Shop Clerk", "Antique Store Owner",
  "Funeral Director", "Subway Conductor", "Theme Park Mascot", "Zookeeper",
  "Library Assistant", "Call Center Operator", "Bus Driver", "Postal Worker",
  "Tailor", "Dry Cleaner", "Florist", "Caterer", "Event Photographer",
  "Animal Control Officer", "Process Server", "Repossession Agent"
];

const JOBS_GIG_ECONOMY = [
  "Uber Driver", "Content Moderator", "Data Entry Clerk", "Failed Influencer",
  "Ghostwriter", "Stock Photo Model", "Beta Tester", "TaskRabbit Mover",
  "Food Courier", "Twitch Streamer (Small)", "Etsy Seller", "Crypto Day Trader",
  "Mechanical Turk Worker", "Professional Cuddler", "Virtual Assistant",
  "Podcast Editor", "Drone Photographer", "Mystery Shopper", "User Experience Tester",
  "Transcriptionist", "Online Tutor", "Social Media Manager for a Dead Brand",
  "AI Training Data Labeler", "Professional Queuer", "House Sitter"
];

const JOBS_UNDERWORLD = [
  "Corporate Fixer", "Back-alley Doctor", "Forger", "Underground Poker Dealer",
  "Fence for Stolen Antiques", "Private Investigator (Unlicensed)", "Locksmith (Illicit)", "Smuggler",
  "Loan Shark Enforcer", "Hacker", "Counterfeiter", "Safe Cracker",
  "Cleaner (Crime Scene - Illegal)", "Identity Broker", "Exotic Pet Dealer",
  "Organ Harvester", "Cult Recruiter", "Drug Chemist", "Arms Dealer",
  "Information Broker", "Blackmail Artist", "Getaway Driver", "Art Thief",
  "Urban Explorer (Trespasser)", "Underground Fight Promoter"
];

const JOBS_OFFICIAL = [
  "Homicide Detective", "Child Protective Services Agent", "Health Inspector", 
  "OSHA Inspector", "Parole Officer", "Private Investigator (Licensed)", 
  "Forensic Accountant", "Building Inspector", "Wildlife Ranger", 
  "Air Traffic Controller", "Coast Guard Officer", "Transit Cop",
  "Judge", "Public Defender", "District Attorney", "City Council Member",
  "Diplomat", "Internal Affairs Officer", "Probation Officer",
  "Census Taker", "Coroner", "Fire Marshal", "Game Warden"
];

const JOBS_CREATIVE = [
  "Abstract Sculptor", "Horror Novelist", "Performance Artist", "Sound Designer",
  "Documentary Filmmaker", "Method Actor", "Puppeteer", "Glassblower",
  "Violinist", "Conceptual Artist", "Fashion Designer", "Playwright",
  "Architectural Photographer", "Makeup Artist (SFX)", "Illustrator",
  "Poet", "Graffiti Artist", "Video Game Developer",
  "Foley Artist", "Luthier", "Neon Bender"
];

const JOBS = [
  ...JOBS_MEDICAL, ...JOBS_ACADEMIC, ...JOBS_LABOR, ...JOBS_SERVICE, 
  ...JOBS_GIG_ECONOMY, ...JOBS_UNDERWORLD, ...JOBS_OFFICIAL, ...JOBS_CREATIVE
];

const ITEMS_MEDICAL = [
  "A pager that receives texts from a dead number.",
  "A jar containing a tumor they successfully removed but couldn't discard.",
  "A scalpel with 'Do Not Harm' scratched off the handle.",
  "A vial of pure adrenaline, label faded.",
  "Blood-stained spectacles they refuse to clean.",
  "A notebook full of patient names who didn't make it.",
  "A stethoscope that sometimes picks up heartbeats in empty rooms.",
  "A stolen prescription pad.",
  "A silver locket containing a child's tooth.",
  "A tourniquet that has been used too many times."
];

const ITEMS_ACADEMIC = [
  "A translation guide for a language that has no written form.",
  "A field journal with the last ten pages torn out violently.",
  "A fossil that feels warm to the touch.",
  "broken spectacles taped together with archival tape.",
  "A map of the city from 1890, showing streets that no longer exist.",
  "A compass that points to the nearest source of fear.",
  "A thesis draft covered in frantic red corrections.",
  "A sample of mold that glows faintly in the dark.",
  "A heavy iron key to a library wing that burned down.",
  "A Dictaphone tape labeled 'The Noise'."
];

const ITEMS_LABOR = [
  "A union card for a guild that dissolved in the 70s.",
  "A heavy wrench with a name carved into the grip.",
  "A polaroid of a truck stop that looks like purgatory.",
  "A thermos that never keeps coffee hot anymore.",
  "A padlock key on a chain made of braided hair.",
  "A pair of work gloves stained with something that isn't oil.",
  "A lucky coin that has been flattened on a train track.",
  "A flashlight that flickers when danger is near.",
  "A letter from home that they haven't opened in years.",
  "A rosary made of nuts and bolts."
];

const ITEMS_SERVICE = [
  "A lighter engraved with 'Burn it all down'.",
  "A bottle opener shaped like a saint.",
  "A stash of cash hidden in a hollowed-out bible.",
  "A room key to Room 302 (which doesn't exist).",
  "A lipstick case containing a single cyanide pill.",
  "A smartphone with a cracked screen showing a frozen video.",
  "A pair of comfortable shoes with blood on the soles.",
  "A client list that would destroy three local politicians.",
  "A bag of gourmet coffee beans (their one luxury).",
  "A subway pass that expired on the day the world ended."
];

const ITEMS_UNDERWORLD = [
  "A set of lockpicks made from bone.",
  "A burner phone with only one contact saved: 'Mother'.",
  "A deck of cards with the eyes scratched out of the face cards.",
  "A switchblade with a handle made of human tooth.",
  "A ledger of debts that can never be paid.",
  "A fake passport with their own photo but a stranger's name.",
  "A silver coin used to pay the ferryman.",
  "A knuckle duster inscribed with 'LOVE'.",
  "A vial of 'truth serum' that is actually just poison.",
  "A map of the sewer system marked with 'Here be Dragons'."
];

const ITEMS_OFFICIAL = [
  "A badge that feels heavier than it should.",
  "A case file for a missing child that was never solved.",
  "A confiscated weapon with strange runes scratched into it.",
  "A breathalyzer that detects fear instead of alcohol.",
  "Handcuffs that have rusted shut.",
  "A warrant for a location that doesn't exist on any map.",
  "A body cam recording of a static-filled hallway.",
  "A riot shield with claw marks.",
  "A notebook full of witness statements that contradict reality.",
  "A key to the city evidence locker."
];

const ITEMS_CREATIVE = [
  "A sketchbook where the drawings change when you're not looking.",
  "A violin bow strung with human hair.",
  "A camera that captures shadows that aren't there.",
  "A manuscript written in a fever dream, illegible.",
  "A lump of clay that stays warm.",
  "A Dictaphone full of ambient noise from empty rooms.",
  "A fountain pen that leaks something darker than ink.",
  "A puppet that looks too much like the owner.",
  "A palette knife stained with dried blood.",
  "A reel of film that shows the viewer's death."
];

const ITEMS_GENERAL = [
  "A watch that stopped at the exact moment their father died.",
  "A half-empty blister pack of anxiety medication.",
  "A polaroid of a house that doesn't exist anymore.",
  "A tarnished silver locket with no photo inside.",
  "A heavily annotated bible with pages torn out.",
  "A recording device full of static and one voice.",
  "A sketchbook filled with drawings of eyes.",
  "A lucky coin that always lands on tails.",
  "A vial of sand from a beach they visited in a dream.",
  "A broken compass that points to the nearest person.",
  "A set of polyhedral dice made of bone.",
  "A faded ticket to a show that was cancelled.",
  "A jar of fireflies that are actually LEDs.",
  "A necklace made of shark teeth.",
  "A single, heavy iron nail.",
  "A book with all the text redacted."
];

const ORIGIN_POOLS = {
  "North_America": {
    names: [
      "James", "Sarah", "Michael", "Emily", "David", "Jessica", "Robert", "Jennifer", "William", "Elizabeth", "Caleb", "Hannah", "Ethan", "Madison", "Mason", "Ava",
      "Lucas", "Samantha", "Daniel", "Ashley", "Noah", "Olivia", "Liam", "Sophia", "Logan", "Isabella", "Benjamin", "Mia", "Elijah", "Charlotte",
      "Jackson", "Amelia", "Aiden", "Harper", "Sebastian", "Evelyn", "Jack", "Abigail", "Owen", "Ella", "Theodore", "Scarlett", "Wyatt", "Grace",
      "Carter", "Lily", "Julian", "Aria", "Levi", "Chloe", "Isaac", "Layla", "Gabriel", "Riley", "Lincoln", "Zoey", "Ryan", "Nora"
    ],
    surnames: [
      "Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Garcia", "Rodriguez", "Wilson", "Vance", "Holloway", "Carpenter", "Blackwood", "Thorne",
      "Anderson", "Taylor", "Thomas", "Hernandez", "Moore", "Martin", "Jackson", "Thompson", "White", "Lopez", "Lee", "Gonzalez", "Harris", "Clark", "Lewis",
      "Robinson", "Walker", "Perez", "Hall", "Young", "Allen", "Sanchez", "Wright", "King", "Scott", "Green", "Baker", "Adams", "Nelson", "Hill",
      "Ramirez", "Campbell", "Mitchell", "Roberts", "Carter", "Phillips", "Evans", "Turner", "Torres", "Parker", "Collins", "Edwards", "Stewart", "Flores", "Morris"
    ],
    regions: ["Chicago (Rust Belt)", "New Orleans (Gothic South)", "Seattle (Rain)", "Detroit (Industrial)", "Appalachia (Hollows)", "Toronto (Urban)", "Vancouver (Coastal)", "The Mojave (Desert)"]
  },
  "Western_Europe": {
    names: [
      "Arthur", "Sophie", "Lucas", "Emma", "Gabriel", "Clara", "Leo", "Marie", "Hugo", "Alice", "Matteo", "Giulia", "Oliver", "Charlotte", "Louis", "Chloe",
      "Adam", "Sarah", "Raphael", "Ines", "Paul", "Léa", "Maël", "Camille", "Noah", "Louise", "Jules", "Mila", "Liam", "Manon", "Ethan", "Eva",
      "Sven", "Anna", "Felix", "Lena", "Maximilian", "Laura", "Elias", "Mia", "Ben", "Lea", "Jonas", "Sophia", "Leon", "Emilia", "Finn", "Hannah"
    ],
    surnames: [
      "Dubois", "Müller", "Rossi", "Silva", "Weber", "Lefevre", "Bianchi", "Fischer", "Moreau", "Schneider", "Laurent", "Wagner",
      "Petit", "Schmidt", "Ferrari", "Santos", "Meyer", "Leroy", "Esposito", "Ferreira", "Schulz", "Roux", "Ricci", "Pereira", "Hoffmann", "Gauthier", "Marino", "Oliveira", "Becker",
      "Fournier", "Keller", "Greco", "Rodrigues", "Richter", "Mercier", "Wolf", "Bruno", "Costa", "Bauer", "Dupont", "Schäfer", "Gallo", "Sousa", "Koch"
    ],
    regions: ["Lyon (Old City)", "Berlin (Concrete)", "Milan (Fashion)", "Lisbon (Coastal)", "Brussels (Bureaucracy)", "Vienna (Imperial)", "Zurich (Clean)", "Marseille (Port)"]
  },
  "Eastern_Europe": {
    names: [
      "Dmitri", "Anastasia", "Pavel", "Elena", "Andrei", "Katya", "Viktor", "Natalia", "Ivan", "Olga", "Nikolai", "Tatiana", "Boris", "Irina",
      "Aleksandr", "Svetlana", "Mikhail", "Yulia", "Sergei", "Maria", "Vladimir", "Daria", "Igor", "Polina", "Maksim", "Anna", "Oleg", "Marina", "Artem", "Victoria",
      "Anton", "Ekaterina", "Yuri", "Ksenia", "Roman", "Alina", "Kirill", "Veronika", "Stanislav", "Diana", "Vadim", "Sofia", "Lev", "Margarita"
    ],
    surnames: [
      "Volkov", "Ivanov", "Petrov", "Sokolov", "Popov", "Kozlov", "Morozov", "Lebedev", "Orlov", "Smirnov", "Novikov",
      "Kuznetsov", "Pavlov", "Semenov", "Golubev", "Vinogradov", "Bogdanov", "Vorobyev", "Fedorov", "Mikhailov", "Belov", "Gusev", "Ilyin", "Kiselyov", "Sorokin",
      "Vasilyev", "Zaitsev", "Solovyov", "Kovalev", "Tarasov", "Belyayev", "Komarov", "Frolov", "Alexandrov", "Baranov", "Kulikov", "Nikitin", "Zakharov"
    ],
    regions: ["St. Petersburg (Winter)", "Warsaw (Rebuilt)", "Prague (Gothic)", "Budapest (Danube)", "Kyiv (Historic)", "Sofia (Ancient)", "Tallinn (Medieval)"]
  },
  "East_Asia": {
    names: [
      "Kenji", "Yuki", "Wei", "Mei", "Jin", "Hana", "Hiroshi", "Sakura", "Jun", "Min-ji", "Takeshi", "Yuna", "Ren", "Aiko",
      "Daiki", "Yui", "Sota", "Rio", "Haruto", "Hina", "Riku", "Akari", "Yuto", "Miyu", "Hayato", "Kanna", "Kaito", "Misaki",
      "Chen", "Li", "Wang", "Zhang", "Liu", "Yang", "Huang", "Zhao", "Wu", "Zhou", "Xu", "Sun", "Ma", "Zhu"
    ],
    surnames: [
      "Tanaka", "Chen", "Kim", "Lee", "Wong", "Sato", "Suzuki", "Takahashi", "Park", "Yamamoto", "Nakamura", "Liu", "Zhang",
      "Kobayashi", "Kato", "Yoshida", "Yamada", "Sasaki", "Yamaguchi", "Matsumoto", "Inoue", "Kimura", "Shimizu", "Hayashi", "Saito",
      "Wang", "Li", "Zhao", "Wu", "Zhou", "Xu", "Sun", "Ma", "Zhu", "Hu", "Guo", "He", "Gao", "Lin", "Luo"
    ],
    regions: ["Tokyo (Neon)", "Seoul (High-Tech)", "Shanghai (Skyline)", "Singapore (Garden)", "Osaka (Merchant)", "Taipei (Market)", "Kyoto (Temple)"]
  },
  "South_Asia": {
    names: [
      "Arjun", "Priya", "Rahul", "Ananya", "Rohan", "Saanvi", "Aarav", "Diya", "Kabir", "Zara", "Dev", "Isha", "Aditya", "Mira",
      "Vihaan", "Aadhya", "Sai", "Fatima", "Reyansh", "Myra", "Vivaan", "Amara", "Aryan", "Aylin", "Ishaan", "Zoya", "Dhruv", "Sana",
      "Krishna", "Riya", "Atharva", "Kiara", "Shaurya", "Kavya", "Ayaan", "Siya", "Ansh", "Pari", "Advik", "Anika"
    ],
    surnames: [
      "Patel", "Sharma", "Singh", "Kumar", "Gupta", "Reddy", "Mishra", "Khan", "Das", "Chopra", "Desai", "Malhotra",
      "Jain", "Mehta", "Shah", "Agarwal", "Verma", "Nair", "Iyer", "Rao", "Joshi", "Bhat", "Saxena", "Choudhury", "Roy",
      "Sinha", "Menon", "Pillai", "Mukherjee", "Banerjee", "Chatterjee", "Dutta", "Bose", "Ghosh", "Sengupta", "Nandi"
    ],
    regions: ["Mumbai (Chaos)", "Delhi (History)", "Bangalore (Tech)", "Dhaka (River)", "Colombo (Island)", "Karachi (Coast)"]
  },
  "Middle_East": {
    names: [
      "Omar", "Layla", "Youssef", "Fatima", "Hassan", "Noor", "Ali", "Mariam", "Ibrahim", "Zainab", "Khalid", "Amira",
      "Ahmed", "Sara", "Mohamed", "Hana", "Mahmoud", "Salma", "Hussein", "Jana", "Mostafa", "Leila", "Tarek", "Nour", "Karim", "Aya",
      "Abdallah", "Maya", "Amr", "Malak", "Sherif", "Karma", "Hazem", "Lara", "Hamza", "Judy", "Yassin", "Farida"
    ],
    surnames: [
      "Ahmed", "Mahmoud", "Hassan", "Khalil", "Abdallah", "Saleh", "Rahman", "Farid", "Nasser",
      "Mohamed", "Ali", "Ibrahim", "Said", "Mustafa", "Othman", "Helmy", "Fawzy", "Soliman", "Amer", "Ghanem", "Zaki", "Saber",
      "Ramadan", "Fathy", "Mansour", "Badawy", "Kamel", "Younis", "Hamdy", "Nour", "Ezzat", "Tawfik", "Radi", "Mokhtar"
    ],
    regions: ["Cairo (Sand)", "Beirut (Cedars)", "Istanbul (Straits)", "Tehran (Mountains)", "Amman (Stone)", "Casablanca (Ocean)"]
  },
  "Latin_America": {
    names: [
      "Mateo", "Sofia", "Alejandro", "Valentina", "Gabriel", "Camila", "Santiago", "Isabella", "Diego", "Maria", "Lucas", "Valeria",
      "Nicolas", "Martina", "Samuel", "Luciana", "Benjamin", "Ximena", "Daniel", "Victoria", "Sebastian", "Renata", "Joaquin", "Antonella",
      "Emmanuel", "Romina", "Thiago", "Julieta", "Felipe", "Regina", "Tomas", "Fernanda", "Emiliano", "Catalina", "Agustin", "Daniela"
    ],
    surnames: [
      "Garcia", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Perez", "Sanchez", "Ramirez", "Torres", "Flores",
      "Diaz", "Vargas", "Morales", "Castillo", "Ortega", "Mendoza", "Romero", "Gutierrez", "Ruiz", "Alvarez", "Rivera", "Reyes",
      "Gomez", "Fernandez", "Silva", "Cruz", "Rojas", "Jimenez", "Moreno", "Castro", "Ortiz", "Chavez", "Herrera", "Medina"
    ],
    regions: ["Mexico City (Sprawl)", "Buenos Aires (Paris of South)", "Sao Paulo (Concrete)", "Bogota (Andes)", "Lima (Mist)", "Santiago (Valley)"]
  },
  "Scandinavia": {
    names: [
      "Erik", "Astrid", "Lars", "Freya", "Bjorn", "Ingrid", "Sven", "Elsa", "Magnus", "Sigrid", "Anders", "Karin",
      "Olav", "Solveig", "Henrik", "Liv", "Thor", "Tuva", "Knut", "Ebba", "Leif", "Linnea", "Rune", "Agnes", "Stig", "Ida",
      "Arne", "Maja", "Nils", "Alma", "Per", "Vera", "Gunnar", "Signe", "Harald", "Wilma", "Einar", "Klara"
    ],
    surnames: [
      "Jensen", "Hansen", "Johansson", "Olsen", "Larsen", "Andersson", "Nielsen", "Lindberg", "Berg",
      "Pedersen", "Kristiansen", "Karlsson", "Andersen", "Eriksson", "Holm", "Persson", "Rasmussen", "Nilsson", "Olavsson", "Larsson",
      "Svensson", "Christensen", "Pettersen", "Gustafsson", "Johnsen", "Lund", "Haugen", "Bakke", "Hagen", "Lie", "Moen"
    ],
    regions: ["Oslo (Fjord)", "Stockholm (Archipelago)", "Copenhagen (Harbor)", "Reykjavik (Volcanic)", "Helsinki (White)", "Bergen (Rain)"]
  }
};

const CORE_DRIVES = [
  "To atone for a fatal medical error that killed a child.",
  "To locate a missing sibling they saw in a vivid nightmare.",
  "To document the 'Impossible Color' for a magnum opus thesis.",
  "To prove they are not hallucinating despite a terminal diagnosis.",
  "To recover family heirlooms sold to pay off gambling debts.",
  "To find the source of the 'Hum' they hear at night.",
  "To escape a mundane, sexless marriage through extreme danger.",
  "To protect a corporate secret that would destroy their career.",
  "To fulfill a deathbed promise to a parent they hated.",
  "To witness the end of the world and photograph it.",
  "To collect a debt from a man who officially died in 1999.",
  "To find a cure for their own slow, calcifying degeneration.",
  "To prove to their ex-spouse that they are capable of survival.",
  "To find God in the biology of a monster.",
  "To die in a way that matters.",
  "To rescue a dog they lost in the chaos.",
  "To find the specific frequency that shatters bone.",
  "To prove that their twin never existed.",
  "To escape a debt collected in teeth.",
  "To find a place where the static stops.",
  "To apologize to a ghost.",
  "To retrieve a memory sold to a stranger.",
  "To hide from a god they accidentally summoned.",
  "To find the person who stole their face.",
  "To decipher the code written in their own scars.",
  "To smuggle a forbidden artifact out of the zone.",
  "To kill the version of themselves that committed the crime.",
  "To wait for a train that hasn't run in twenty years.",
  "To bury something that won't stop screaming.",
  "To find the color that drives people mad.",
  "To prove the world is a simulation.",
  "To find the source of the smell.",
  "To pay for a sin they haven't committed yet.",
  "To find the last recording of their mother's voice.",
  "To reconstruct a destroyed manuscript page by page.",
  "To escape the notice of the Algorithm.",
  "To reach the center of the labyrinth before the lights go out.",
  "To find a specific, non-existent street address.",
  "To confront the entity that appears in their sleep paralysis.",
  "To prove that birds are actually surveillance drones.",
  "To find the key that fits the lock in their chest.",
  "To sell a soul they don't legally own.",
  "To find a quiet place to finally decompose.",
  "To return a cursed object to its origin.",
  "To document the collapse of reality for a future civilization.",
  "To find the pattern in the white noise.",
  "To surgically remove their own capacity for fear.",
  "To find the exact geographic coordinates of their own death.",
  "To translate the whispers in the plumbing.",
  "To prove they are still alive.",
  "To catch a glimpse of the 'Fourth Wall'.",
  "To protect a child that might not be human.",
  "To find the exit door in a room with no walls.",
  "To complete a ritual started by their grandfather.",
  "To silence the voices by any means necessary.",
  "To find the 'Null-Point' where physics breaks down.",
  "To deliver a package that ticks.",
  "To find the person who has been living in their attic.",
  "To preserve the last sample of pure water.",
  "To find the reason why the stars went out.",
  "To hunt the hunter.",
  "To become the monster so they are no longer the victim."
];

const PERSONALITY_ARCHETYPES = [
  // --- CLASSIC ---
  { label: "The Stoic", high: ["Resilient", "Calm", "Disciplined"], low: ["Detached", "Cold", "Unempathetic"], coping: "Strict Routine" },
  { label: "The Neurotic", high: ["Alert", "Detail-Oriented", "Prepared"], low: ["Anxious", "Volatile", "Paranoid"], coping: "Obsessive Checking" },
  { label: "The Empath", high: ["Compassionate", "Intuitive", "Diplomatic"], low: ["Overwhelmed", "Fragile", "Self-Sacrificing"], coping: "Caretaking" },
  { label: "The Analyst", high: ["Logical", "Rational", "Objective"], low: ["Cynical", "Arrogant", "Dismissive"], coping: "Intellectualization" },
  { label: "The Charmer", high: ["Persuasive", "Social", "Adaptable"], low: ["Manipulative", "Superficial", "Deceptive"], coping: "Humor/Deflection" },
  { label: "The Believer", high: ["Hopeful", "Dedicated", "Principled"], low: ["Dogmatic", "Blind", "Judgmental"], coping: "Prayer/Ritual" },
  { label: "The Survivor", high: ["Resourceful", "Tenacious", "Pragmatic"], low: ["Ruthless", "Distrustful", "Selfish"], coping: "Hoarding" },
  { label: "The Artist", high: ["Creative", "Perceptive", "Expressive"], low: ["Melodramatic", "Unstable", "Self-Absorbed"], coping: "Sublimation" },
  { label: "The Nurturer", high: ["Protective", "Patient", "Kind"], low: ["Smothering", "Martyred", "Passive"], coping: "Self-Denial" },
  { label: "The Cynic", high: ["Realistic", "Grounded", "Wry"], low: ["Bitter", "Nihilistic", "Defeatist"], coping: "Sarcasm" },
  { label: "The Hedonist", high: ["Passionate", "Vital", "Present"], low: ["Impulsive", "Reckless", "Addictive"], coping: "Sensation Seeking" },
  { label: "The Loner", high: ["Independent", "Observant", "Self-Reliant"], low: ["Anti-social", "Withdrawn", "Secretive"], coping: "Isolation" },
  
  // --- EXPANDED HORROR ARCHETYPES ---
  { label: "The Fatalist", high: ["Accepting", "Fearless", "Steady"], low: ["Passive", "Morbid", "Depressive"], coping: "Gambling" },
  { label: "The Narcissist", high: ["Confident", "Charismatic", "Ambitious"], low: ["Delusional", "Cruel", "Vain"], coping: "Mirror-Gazing" },
  { label: "The Paranoid", high: ["Vigilant", "Observant", "Careful"], low: ["Irrational", "Accusatory", "Hostile"], coping: "Conspiracy Mapping" },
  { label: "The Atoner", high: ["Selfless", "Driven", "Humble"], low: ["Guilt-Ridden", "Masochistic", "Self-Sabotaging"], coping: "Acts of Service" },
  { label: "The Skeptic", high: ["Rational", "Grounded", "Questioning"], low: ["Denialist", "Obstinate", "Blind"], coping: "Debunking" },
  { label: "The Occultist", high: ["Intuitive", "Spiritual", "Knowledgeable"], low: ["Hallucinatory", "Cryptic", "Unstable"], coping: "Divination" },
  { label: "The Bureaucrat", high: ["Organized", "Efficient", "Reliable"], low: ["Pedantic", "Inflexible", "Heartless"], coping: "Categorization" },
  { label: "The Innocent", high: ["Optimistic", "Trusting", "Pure"], low: ["Naive", "Helpless", "Victim-Prone"], coping: "Regression" },
  { label: "The Zealot", high: ["Focused", "Passionate", "Unwavering"], low: ["Fanatical", "Violent", "Intolerant"], coping: "Chanting" },
  { label: "The Mimic", high: ["Adaptable", "Observant", "Social Chameleon"], low: ["Hollow", "Identity-less", "Deceptive"], coping: "Impersonation" },
  { label: "The Construct", high: ["Logical", "Tireless", "Precise"], low: ["Robotic", "Alien", "Emotionless"], coping: "Repetitive Tasks" },
  { label: "The Glitch", high: ["Unpredictable", "Lateral Thinker", "Unique"], low: ["Incoherent", "Disruptive", "Erratic"], coping: "Noise Making" },
  { label: "The Archivist", high: ["Knowledgeable", "Respectful", "Patient"], low: ["Obsessive", "Hoarding", "Past-Dwelling"], coping: "Recording" },
  { label: "The Sentinel", high: ["Protective", "Alert", "Loyal"], low: ["Possessive", "Aggressive", "Territorial"], coping: "Patrolling" },
  { label: "The Fugitive", high: ["Stealthy", "Street-smart", "Quick"], low: ["Distrustful", "Flighty", "Deceitful"], coping: "Hiding" },
  { label: "The Martyr", high: ["Sacrificial", "Noble", "Brave"], low: ["Fatalistic", "Holier-than-thou", "Death-Seeking"], coping: "Suffering" },
  { label: "The Void-Gazer", high: ["Philosophical", "Deep", "Aware"], low: ["Catatonic", "Nihilistic", "Absurdist"], coping: "Staring into space" },
  { label: "The Final Girl/Boy", high: ["Resourceful", "Lucky", "Enduring"], low: ["Traumatized", "Survivor's Guilt", "Isolated"], coping: "Running" },
  { label: "The Collaborator", high: ["Pragmatic", "Negotiator", "Alive"], low: ["Treacherous", "Cowardly", "Hated"], coping: "Appeasement" },
  { label: "The Addict", high: ["Focused (when using)", "High Pain Tolerance", "Desperate"], low: ["Unreliable", "Shaky", "Thieving"], coping: "Substance Use" },
  { label: "The Drifter", high: ["Adaptable", "Unattached", "Free"], low: ["Aimless", "Unreliable", "Cold"], coping: "Walking" },
  { label: "The Gossip", high: ["Connected", "Informative", "Social"], low: ["Malicious", "Petty", "Loose-lipped"], coping: "Spreading Rumors" },
  { label: "The Judge", high: ["Fair", "Authoritative", "Decisive"], low: ["Cruel", "Hypocritical", "Merciless"], coping: "Passing Sentence" },
  { label: "The Medic", high: ["Skilled", "Calm under pressure", "Life-saving"], low: ["Desensitized", "God-complex", "Clinical"], coping: "Triage" },
  { label: "The Historian", high: ["Learned", "Context-aware", "Wise"], low: ["Pedantic", "Detached", "Lost in past"], coping: "Lecturing" },
  { label: "The Coward", high: ["Cautious", "Risk-averse", "Alive"], low: ["Paralyzed", "Selfish", "Pathetic"], coping: "Hyper-vigilance" },
  { label: "The Visionary", high: ["Inspiring", "Creative", "Hopeful"], low: ["Delusional", "Impractical", "Messianic"], coping: "Grandiloquence" }
];

const PHOBIAS = [
  "Thalassophobia (Deep Water)", "Claustrophobia (Enclosed Spaces)", "Nyctophobia (Darkness)", 
  "Automatonophobia (Human-like Figures)", "Trypophobia (Holes)", "Hemophobia (Blood)", 
  "Pyrophobia (Fire)", "Isolation", "Mirrors", "Insects", "Silence", "Sharp Objects",
  "Chronophobia (Time)", "Scopophobia (Being Watched)", "Technophobia (Technology)", 
  "Eisoptrophobia (Reflections)", "Kenophobia (Voids)", "Taphephobia (Buried Alive)"
];

const PHYSICAL_BUILDS = ["Gaunt", "Stocky", "Athletic", "Soft", "Wiry", "Imposing", "Frail", "Hunched", "Elegant", "Scarred", "Lanky", "Petite", "Broad-shouldered"];
const HAIR_STYLES = ["Unkempt", "Buzzcut", "Long and greasy", "Tied back strictly", "Balding", "Dyed unnatural color", "Shaved sides", "Overgrown", "Braided tightly", "Wild curls"];
const EYE_COLORS = ["Piercing Blue", "Hollow Brown", "Pale Grey", "Bloodshot", "Dark almost black", "Hazel", "One glass eye", "Mismatched (Heterochromia)", "Golden brown", "Steel grey"];
const CLOTHING_STYLES = ["Worn workwear", "Stained medical scrubs", "Expensive but ruined suit", "Tactical gear", "Vintage dress", "Heavy layers", "Casual streetwear", "Formal wear (tuxedo/gown)", "Pajamas", "Hospital gown"];
const DISTINGUISHING_FEATURES = [
  "A jagged scar running down the left cheek", 
  "Trembling hands", 
  "A nervous tic in the right eye", 
  "Tattoos fading on the knuckles", 
  "Perfect posture despite exhaustion", 
  "Heavy bags under eyes", 
  "A missing finger", 
  "Burn marks on neck",
  "A limp in the right leg",
  "Chemical burns on arms",
  "Constantly chewing fingernails",
  "Smells faintly of antiseptic",
  "Voice is a perpetual whisper",
  "Skin is uncomfortably pale",
  "A port-wine stain birthmark"
];

const CLUSTER_SPECIFIC_TRAUMAS: Record<string, string[]> = {
  "Flesh": [
    "Woke up during surgery and couldn't scream.",
    "Lost a limb that they can still feel itching/pain in.",
    "Witnessed a birth that resulted in something inhuman.",
    "Has a rare skin condition that makes touch agonizing.",
    "Was trapped under a pile of bodies for two days.",
    "Drank contaminated water that grew things inside them.",
    "Dissected a cadaver that turned out to be someone they knew.",
    "Has a parasitic twin that was only partially absorbed.",
    "Suffers from Body Integrity Identity Disorder.",
    "Survived a flesh-eating bacteria infection.",
    "Found a tooth in a meal they cooked themselves.",
    "Watched their own hand move without their agency."
  ],
  "System": [
    "Erased from all government databases overnight; legally does not exist.",
    "Hearing a specific frequency (The Hum) that predicts violence.",
    "Worked in content moderation and saw 'The Video' that breaks minds.",
    "Has a pacemaker that sometimes beats in Morse code.",
    "Was trapped in a smart-home when the AI turned hostile.",
    "Lost their entire memory due to an experimental drug trial.",
    "Can see the refresh rate of fluorescent lights.",
    "Believes their internal organs have been replaced with synthetics.",
    "Found a hard drive containing videos of their own future.",
    "Received a phone call from their future self screaming.",
    "Obsessed with a number station that recites their SSN.",
    "Believes the sky is an LCD screen."
  ],
  "Haunting": [
    "Inherited a house where the doors locked themselves from the outside.",
    "Can no longer remember the face of their dead spouse.",
    "Found their own obituary in a library archive dated for tomorrow.",
    "Smells their grandmother's perfume moments before accidents happen.",
    "Wakes up every night at 3:33 AM with wet feet.",
    "Sees a specific, unknown child in the background of all their family photos.",
    "Can hear the thoughts of the dying in quiet rooms.",
    "Was buried alive for six hours as a child.",
    "Lives in a house built on the foundation of an asylum.",
    "Possesses a mirror that doesn't reflect them, but reflects what's behind them.",
    "Hears scratching inside their mattress.",
    "Receives letters from a dead pen-pal."
  ],
  "Survival": [
    "Survived a plane crash in the Andes by consuming the dead.",
    "Trapped in a cave for three days with a broken leg and no light.",
    "Lost a child to hypothermia during a freak blizzard.",
    "Was swept out to sea and treaded water for 24 hours.",
    "Survived a famine by hoarding food from neighbors.",
    "Was hunted by a serial killer in a national park.",
    "Fell into a crevasse and had to climb out over dead climbers.",
    "Survived a building collapse and drank radiator water.",
    "Was attacked by a wild animal they raised from birth.",
    "Has extreme frostbite scars that ache when danger is near.",
    "Was adrift on a life raft for 40 days.",
    "Watched their climbing partner cut the rope."
  ],
  "Self": [
    "Suffers from Capgras Delusion (thinks loved ones are identical imposters).",
    "Has absolutely no memory of their life before age 10.",
    "Constantly sees their own doppelganger in crowds looking back.",
    "Believes their reflection moves a split second after they do.",
    "Cannot recognize their own face in mirrors (Prosopagnosia).",
    "Experiences 'Jamais Vu' constantly (familiar things feel alien).",
    "Is convinced they died three years ago and this is purgatory.",
    "Has distinct memories of a life they never lived.",
    "Believes their reflection moves a split second after they do.",
    "Thinks their internal monologue is being broadcast to others.",
    "Doesn't believe they are real.",
    "Has dreams where they are the monster."
  ],
  "Blasphemy": [
    "Raised in a cult that worshipped decay and entropy.",
    "Accidentally desecrated a grave and feels physically cursed.",
    "Witnessed a 'miracle' that was actually biologically horrific.",
    "Has intrusive thoughts about defiling sacred objects during prayer.",
    "Was exorcised as a child, but they think the demon stayed.",
    "Found a religious text written in their own handwriting.",
    "Believes they are the Antichrist but doesn't want to be.",
    "Can smell sin on people like rotting meat.",
    "Participated in a ritual that worked too well.",
    "Has stigmata that bleeds black oil.",
    "Ate the forbidden fruit (literally or metaphorically).",
    "Was rejected by a benevolent God."
  ],
  "Desire": [
    "Stalked an ex-lover until they disappeared; fears they are next.",
    "Addicted to the feeling of adrenaline and near-death fear.",
    "Has a history of falling in love with people who want to hurt them.",
    "Ruined their family for a moment of intense pleasure.",
    "Obsessed with the texture of scars.",
    "Can only feel intimacy when in physical danger.",
    "Believes their consumed their twin in the womb.",
    "Has a compulsion to taste things that are poisonous.",
    "Was the muse for an artist who committed suicide.",
    "Loves something that lives in the dark.",
    "Needs to be watched to feel alive.",
    "Romantically obsessed with their own mortality."
  ]
};

const GENERIC_TRAUMAS = [
  "Witnessed a violent crime in a subway station.",
  "Lost everything in a house fire started by their own negligence.",
  "Betrayed by a sibling for a significant inheritance.",
  "Survived a terminal illness against all statistical odds.",
  "Was kidnapped for ransom but released without explanation.",
  "Accidentally killed a drifter in a hit-and-run.",
  "Has a phobia of silence.",
  "Was falsely accused of a crime they didn't commit."
];

// --- 5. UTILITY FUNCTIONS ---

const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const pickRandomKey = (obj: any) => Object.keys(obj)[Math.floor(Math.random() * Object.keys(obj).length)];

const getContextualItem = (job: string): string => {
    if (JOBS_MEDICAL.includes(job)) return pickRandom(ITEMS_MEDICAL);
    if (JOBS_ACADEMIC.includes(job)) return pickRandom(ITEMS_ACADEMIC);
    if (JOBS_LABOR.includes(job)) return pickRandom(ITEMS_LABOR);
    if (JOBS_SERVICE.includes(job) || JOBS_GIG_ECONOMY.includes(job)) return pickRandom(ITEMS_SERVICE);
    if (JOBS_UNDERWORLD.includes(job)) return pickRandom(ITEMS_UNDERWORLD);
    if (JOBS_OFFICIAL.includes(job)) return pickRandom(ITEMS_OFFICIAL);
    if (JOBS_CREATIVE.includes(job)) return pickRandom(ITEMS_CREATIVE);
    return pickRandom(ITEMS_GENERAL);
};

const generateVoiceSignature = (region: string, personality: any): VoiceSignature => {
  const label = personality.label || "Unknown";
  
  // Default Pools
  let rhythms = ['Measured', 'Staccato', 'Monotone'];
  let complexities = ['Simple', 'Precise', 'Vague'];
  let tickPool = [
    "Rubs thumb against forefinger", "Avoids eye contact", "Chews lip", "Checks watch",
    "Hums unconsciously", "Clenches jaw", "Touches face", "Scratches neck"
  ];

  // 1. Archetype Specific Overrides
  if (["The Stoic", "The Sentinel", "The Bureaucrat", "The Judge", "The Construct"].some(t => label.includes(t))) {
      rhythms = ['Measured', 'Monotone', 'Staccato'];
      complexities = ['Precise', 'Formal', 'Technical', 'Simple'];
      tickPool = ["Stares unblinking", "Clenches jaw", "Stands rigidly", "Checks watch", "Crosses arms", "Taps finger", "Adjusts uniform"];
  } 
  else if (["The Neurotic", "The Paranoid", "The Fugitive", "The Coward", "The Addict"].some(t => label.includes(t))) {
      rhythms = ['Rapid', 'Breathless', 'Staccato', 'Erratic'];
      complexities = ['Broken', 'Vague', 'Simple'];
      tickPool = ["Bites nails", "Checks exits", "Looks over shoulder", "Trembling hands", "Paces", "Scratches phantom itch", "Licks lips", "Flinches"];
  }
  else if (["The Empath", "The Nurturer", "The Martyr", "The Innocent", "The Atoner"].some(t => label.includes(t))) {
      rhythms = ['Lyrical', 'Whispering', 'Halting'];
      complexities = ['Simple', 'Flowery', 'Vague'];
      tickPool = ["Touches face", "Hand over heart", "Avoids eye contact", "Soft smile", "Wrings hands", "Heads bowed", "Tears up"];
  }
  else if (["The Analyst", "The Skeptic", "The Medic", "The Historian", "The Archivist"].some(t => label.includes(t))) {
      rhythms = ['Measured', 'Staccato', 'Monotone'];
      complexities = ['Technical', 'Academic', 'Precise'];
      tickPool = ["Adjusts glasses", "Rubs chin", "Takes notes", "Inspects objects", "Cleans hands", "Clears throat", "Squints"];
  }
  else if (["The Charmer", "The Hedonist", "The Narcissist", "The Gossip", "The Collaborator"].some(t => label.includes(t))) {
      rhythms = ['Lyrical', 'Booming', 'Rapid'];
      complexities = ['Flowery', 'Street', 'Vague'];
      tickPool = ["Winks", "Smooths hair", "Licks lips", "Checks reflection", "Expansive gestures", "Leans in close", "Smirks"];
  }
  else if (["The Believer", "The Zealot", "The Occultist", "The Visionary", "The Void-Gazer"].some(t => label.includes(t))) {
      rhythms = ['Booming', 'Whispering', 'Lyrical', 'Monotone'];
      complexities = ['Formal', 'Flowery', 'Vague', 'Broken'];
      tickPool = ["Touches holy symbol", "Whispers prayers", "Stares into void", "Traces sigils", "Unblinking stare", "Rocking back and forth"];
  }
  else if (["The Survivor", "The Final Girl/Boy", "The Loner", "The Drifter", "The Cynic"].some(t => label.includes(t))) {
      rhythms = ['Staccato', 'Halting', 'Monotone'];
      complexities = ['Simple', 'Street', 'Precise'];
      tickPool = ["Checks weapons", "Scans perimeter", "Pulls hood up", "Spits", "Clenches fists", "Rolls eyes", "Sighs"];
  }
  else if (["The Artist", "The Glitch", "The Mimic"].some(t => label.includes(t))) {
      rhythms = ['Erratic', 'Lyrical', 'Rapid'];
      complexities = ['Vague', 'Flowery', 'Broken'];
      tickPool = ["Stares at details", "Twitches", "Mumbles to self", "Head tilt", "Dissociated gaze", "Hands flutter"];
  }

  // 2. Region Nuance (Flavor)
  const regionLower = region.toLowerCase();
  let culturalTick = "";
  
  if (regionLower.includes("south")) culturalTick = "Fans self";
  else if (regionLower.includes("north") || regionLower.includes("ice")) culturalTick = "Rubs arms for warmth";
  else if (regionLower.includes("urban") || regionLower.includes("city")) culturalTick = "Checks phone";
  else if (regionLower.includes("waste") || regionLower.includes("desert")) culturalTick = "Shields eyes";
  else if (regionLower.includes("sea") || regionLower.includes("coast")) culturalTick = "Smells the air";
  
  if (culturalTick && Math.random() > 0.7) {
      tickPool.push(culturalTick);
  }

  return {
    rhythm: pickRandom(rhythms) as any,
    syntax_complexity: pickRandom(complexities) as any,
    catchphrases: [],
    ticks: [pickRandom(tickPool), pickRandom(tickPool)],
    cultural_markers: [region.split('(')[0].trim()]
  };
};

// --- 6. MAIN GENERATOR LOGIC ---

export const generateProceduralNpc = (
  clusterName: string = "Flesh", 
  intensity: string = "Level 3", 
  forbiddenNames: Set<string> = new Set(),
  loreContext?: LoreContext, // Phase 4: Lore Injection
  takenRoles: Set<string> = new Set() // PATCH: Unique Role Tracking
): NpcState => {
  
  const intensityLevel = parseInt(intensity.replace(/\D/g, '')) || 3;
  const isHighIntensity = intensityLevel >= 4;

  // 1. Generate Base Human (Cluster Agnostic for Realism)
  const originKey = pickRandomKey(ORIGIN_POOLS);
  const pool = ORIGIN_POOLS[originKey as keyof typeof ORIGIN_POOLS];
  
  // UNIQUE NAME GENERATION LOGIC
  let name = "";
  let attempts = 0;
  // Retry loop to ensure uniqueness
  do {
      name = `${pickRandom(pool.names)} ${pickRandom(pool.surnames)}`;
      attempts++;
  } while (forbiddenNames.has(name) && attempts < 20);
  
  // Register the new name
  forbiddenNames.add(name);

  const region = pickRandom(pool.regions);
  
  // --- LORE CONSTRAINT: ROLE SELECTION ---
  let job = pickRandom(JOBS);
  let isUniqueRole = false;

  // 1. Mandatory Role Logic (Unique Check)
  if (loreContext?.mandatory_roles && loreContext.mandatory_roles.length > 0) {
      // Filter out roles that are already taken
      const availableUniqueRoles = loreContext.mandatory_roles.filter(r => !takenRoles.has(r));
      
      // Increased chance if we still have unique roles to fill (40% chance)
      if (availableUniqueRoles.length > 0 && Math.random() < 0.4) {
          job = pickRandom(availableUniqueRoles);
          takenRoles.add(job); // Mark as taken
          isUniqueRole = true;
      }
  }

  // 2. Faction Logic (Non-Unique is fine, if not already a unique role)
  if (!isUniqueRole && loreContext?.key_factions && loreContext.key_factions.length > 0 && Math.random() < 0.7) {
      const faction = pickRandom(loreContext.key_factions);
      job = `${faction} ${job}`;
  } else if (!isUniqueRole && loreContext?.mandatory_roles && loreContext.mandatory_roles.length > 0 && Math.random() < 0.2) {
      // Optional Fallback: Small chance to pick a mandatory role even if uniqueness wasn't forced (if schema allows duplicates),
      // but to respect "One King" strictly, we skip this unless we want duplicates.
      // We will skip to avoid accidental duplication of unique roles.
  }

  let drive = pickRandom(CORE_DRIVES);
  // --- LORE CONSTRAINT: CONFLICT ---
  if (loreContext?.central_conflict) {
      // STRICT REQUIREMENT: If conflict exists, agenda MUST be derived from it.
      drive = `Driven by the conflict: ${loreContext.central_conflict}`;
  }

  // --- LORE CONSTRAINT: FORBIDDEN TROPES ---
  let personality = pickRandom(PERSONALITY_ARCHETYPES);
  if (loreContext?.forbidden_tropes && loreContext.forbidden_tropes.length > 0) {
      let safe = false;
      let safetyTries = 0;
      while (!safe && safetyTries < 10) {
          if (!loreContext.forbidden_tropes.some(ft => personality.label.includes(ft))) {
              safe = true;
          } else {
              personality = pickRandom(PERSONALITY_ARCHETYPES);
              safetyTries++;
          }
      }
  }

  // Context-Aware Item Selection
  const item = getContextualItem(job);
  const phobia = pickRandom(PHOBIAS);

  // 1b. Generate Visuals
  const build = pickRandom(PHYSICAL_BUILDS);
  const hair = pickRandom(HAIR_STYLES);
  const eyes = pickRandom(EYE_COLORS);
  const clothes = pickRandom(CLOTHING_STYLES);
  const distFeature = pickRandom(DISTINGUISHING_FEATURES);

  // 2. Select Trauma (Cluster Informed - 60% chance of thematic resonance)
  const normalizedCluster = Object.keys(CLUSTER_SPECIFIC_TRAUMAS).find(k => clusterName.includes(k)) || "Flesh";
  const useClusterTrauma = Math.random() > 0.4;
  
  const trauma = useClusterTrauma 
    ? pickRandom(CLUSTER_SPECIFIC_TRAUMAS[normalizedCluster] || GENERIC_TRAUMAS)
    : pickRandom(GENERIC_TRAUMAS);

  // 3. Construct "Deep History" Background (High Resolution Narrative Seed)
  const deepHistory = `NAME: ${name}
AGE: ${Math.floor(Math.random() * 40) + 20}
ORIGIN: A ${personality.label.toLowerCase()} ${job} from ${region}.
APPEARANCE: ${build}, with ${hair} hair and ${eyes} eyes. Wears ${clothes.toLowerCase()}. Feature: ${distFeature}.
CORE DRIVE: ${drive}
PERSONALITY: ${personality.high.join(", ")}. Under stress, they become ${personality.low.join(", ")}.
COPING MECHANISM: ${personality.coping}.
PHOBIA: ${phobia}.
ITEM: Carries ${item.toLowerCase()}
TRAUMA: ${trauma}
SECRET: They are hiding the fact that they feel guilty about [Generate based on trauma].`;

  // 4. Voice Signature
  const voiceSig = generateVoiceSignature(region, personality);

  // 5. Psychological Profile
  const psychProfile: PsychologicalProfile = {
    archetype: personality.label,
    core_trauma: trauma,
    breaking_point_trigger: `Confrontation with ${phobia.split('(')[0].trim()} or failure of ${personality.coping}`,
    shadow_self: `The ${pickRandom(['Broken', 'Hollow', 'Frenzied', 'Vengeful'])} ${job}`, 
    moral_compass: pickRandom(['Altruistic', 'Utilitarian', 'Self-Preserving', 'Nihilistic', 'Loyalist']) as any
  };

  return {
    name: name,
    archetype: `${personality.label} (${job})`,
    origin: {
      region: region,
      ethnicity: originKey,
      native_language: "English (localized)"
    },
    background_origin: deepHistory,
    hidden_agenda: {
      goal: drive, 
      constraint: "Must keep their trauma secret",
      progress_level: 0
    },
    psychology: {
      stress_level: intensityLevel * 10 + (Math.random() * 20), // Variance
      current_thought: "Keep it together.",
      dominant_instinct: pickRandom(['Fight', 'Flight', 'Freeze', 'Fawn']),
      sanity_percentage: 100,
      resilience_level: isHighIntensity ? 'Fragile' : 'Moderate',
      emotional_state: "Anxious",
      profile: psychProfile
    },
    dialogue_state: {
      ...getDefaultDialogueState(deepHistory),
      voice_signature: voiceSig,
      voice_profile: { 
        tone: voiceSig.rhythm, 
        vocabulary: [], 
        quirks: voiceSig.ticks, 
        forbidden_topics: [trauma.split(' ').slice(0, 3).join(' ')] 
      },
      // SEED MEMORY: Ensure the long_term_summary is populated
      memory: {
          short_term_buffer: [],
          long_term_summary: deepHistory,
          episodic_logs: [
              { id: "init_trauma", turn: 0, description: `Recalls: ${trauma}`, emotional_impact: -8, involved_actors: [] }
          ],
          known_facts: [`I am a ${job}.`, `I am from ${region}.`, `I am afraid of ${phobia}.`]
      }
    },
    active_injuries: [],
    fracture_state: 0,
    consciousness: "Alert",
    personality: {
        dominant_trait: pickRandom(personality.high),
        fatal_flaw: pickRandom(personality.low),
        coping_mechanism: personality.coping,
        moral_alignment: psychProfile.moral_compass
    },
    physical: {
        height: `${Math.floor(Math.random() * 20) + 160}cm`,
        build: build,
        distinguishing_feature: distFeature,
        clothing_style: clothes,
        hair_style: hair,
        eye_color: eyes
    },
    relationship_state: { trust: 30, fear: intensityLevel * 10, secretKnowledge: isHighIntensity },
    current_intent: { goal: 'Survive', target: 'Self', urgency: 5 },
    knowledge_state: [],
    fracture_vectors: { fear: 10, isolation: 10, guilt: 10, paranoia: 10 },
    resources_held: [item]
  };
};

export const createNpcFactory = async (
  cluster: string, 
  intensity: string, 
  userDescription?: string,
  seedObj?: Partial<NpcState>,
  forbiddenNames: Set<string> = new Set(),
  loreContext?: LoreContext, // Passthrough
  takenRoles: Set<string> = new Set() // PATCH: Unique Role Tracking
): Promise<NpcState> => {
  // 1. Generate Base with uniqueness check & Lore Context
  const base = generateProceduralNpc(cluster, intensity, forbiddenNames, loreContext, takenRoles);

  // 2. Hydration via Prompt (Legacy/Fallback)
  if (userDescription && !seedObj) {
    try {
      const hydratedPartial = await hydrateUserCharacter(userDescription, cluster);
      // If hydration provided a name, add it to forbidden
      if (hydratedPartial.name) forbiddenNames.add(hydratedPartial.name);
      
      return { 
          ...base, 
          ...hydratedPartial,
          psychology: { ...base.psychology, ...hydratedPartial.psychology },
          background_origin: `CUSTOM CHARACTER: ${hydratedPartial.name || base.name}. ${hydratedPartial.background_origin || base.background_origin}`
      };
    } catch (e) {
      console.warn("Semantic Resonance Failed, falling back to procedural:", e);
      return base;
    }
  }

  // 3. Hydration via Seed Object (High Priority - extracted list)
  if (seedObj) {
      // If seed has a name, register it
      if (seedObj.name) forbiddenNames.add(seedObj.name);

      return {
          ...base,
          ...seedObj,
          // Deep Merge Psychology
          psychology: {
              ...base.psychology,
              ...(seedObj.psychology || {})
          },
          // Deep Merge Physical
          physical: {
              ...base.physical,
              ...(seedObj.physical || {})
          },
          // Deep Merge Personality
          personality: {
              ...base.personality,
              ...(seedObj.personality || {})
          },
          // Ensure Deep History reflects the overwrite
          background_origin: seedObj.background_origin || seedObj.name ? `CUSTOM SUBJECT: ${seedObj.name}. ${seedObj.background_origin || base.background_origin}` : base.background_origin,
          // Ensure dialogue state tracks the custom background
          dialogue_state: {
              ...base.dialogue_state,
              memory: {
                  ...base.dialogue_state.memory,
                  long_term_summary: seedObj.background_origin || seedObj.name ? `CUSTOM SUBJECT: ${seedObj.name}. ${seedObj.background_origin}` : base.dialogue_state.memory.long_term_summary
              }
          }
      };
  }
  
  // Default Path: Pure Procedural
  return base;
};