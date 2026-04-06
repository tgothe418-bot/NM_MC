
import { ArchivedCharacter } from './types';

export const CHARACTER_ARCHIVE: ArchivedCharacter[] = [
  {
    character_id: "ghost_lena_vance",
    name: "Lena (The Anomaly)",
    origin_story: "The Mnemosyne Incident",
    archetype: "The System Reject",
    fracture_state: 4, // 4 = Anomaly/Ghost
    permanent_traits: [
      "Tech-Haunt: Can manipulate digital environments emotionally",
      "Binary Rejection: Immune to 'False Choice' scenarios",
      "Echo of Gunfire: Always appears with the scent of cordite"
    ],
    fracture_vectors: {
      fear: 0,
      isolation: 100,
      guilt: 100,
      paranoia: 100
    },
    narrative_role: "The Warning / The Glitch",
    behavioral_loop: "Appears when a Villain offers a binary choice to warn the victim that 'Neither' is an option.",
    dialogue_sample: {
      greeting: "Don't listen to the hum. It lies.",
      warning: "He offered me the wire or the world. I chose the fire.",
      farewell: "The screen is dark, but I can still see you."
    },
    resources_held: ["Spent Shotgun Shell", "Broken Crowbar"],
    special_conditions: {
      trigger: "Villain offers a binary 'A or B' choice or attempts to assimilate consciousness.",
      effect: "Lena manifests to disrupt the interface or warn the user."
    }
  },
  {
    character_id: "ghost_aris_thorne",
    name: "Dr. Aris Thorne",
    origin_story: "The Obsidian Observatory",
    archetype: "The Blind Observer",
    fracture_state: 4,
    permanent_traits: [
      "Void Sight: Eyes sewn shut; sees thermal decay and entropy",
      "Academic Distance: Analyzes horror as physics",
      "Walking Freeze: Temperature drops 10 degrees near him"
    ],
    fracture_vectors: {
      fear: 0,
      isolation: 100,
      guilt: 20,
      paranoia: 0
    },
    narrative_role: "The Explainer / The Witness",
    behavioral_loop: "Appears when the User encounters Non-Euclidean geometry or impossible physics to explain the mechanism of their death.",
    dialogue_sample: {
      greeting: "The angles are wrong. Beautifully, terribly wrong.",
      warning: "Do not look at the corner. It is not 90 degrees. It is hunger.",
      farewell: "I must return to the dark. It is the only thing that makes sense."
    },
    resources_held: ["Shattered Spectacles", "Notebook of Black Pages"],
    special_conditions: {
      trigger: "User enters a location with 'Non-Euclidean' spatial logic or 'System' cluster dominance.",
      effect: "Aris manifests to describe the impossibility."
    }
  },
  {
    character_id: "ghost_sarah_connolly",
    name: "Sarah (The Martyr)",
    origin_story: "The Silent Orphanage",
    archetype: "The Failed Protector",
    fracture_state: 4,
    permanent_traits: [
      "Cornerstone Memory: Forces the User to recall their worst mistake.",
      "Shield of Bone: Can briefly deflect physical harm, but takes damage to her soul.",
      "Eternal Chill: The air freezes when she weeps."
    ],
    fracture_vectors: {
      fear: 50,
      isolation: 80,
      guilt: 100,
      paranoia: 20
    },
    narrative_role: "The Conscience / The Shield",
    behavioral_loop: "Manifests when the User considers a selfish act of survival at the cost of another.",
    dialogue_sample: {
      greeting: "I held the door. I held it until my fingers broke.",
      warning: "You can't outrun what you owe. Don't leave them.",
      farewell: "I'll be waiting in the cold. I'm always waiting."
    },
    resources_held: ["Half a Locket", "Bloodied Doorhandle"],
    special_conditions: {
      trigger: "User attempts to abandon an NPC or sacrifice a resource to escape.",
      effect: "Sarah blocks the exit path, demanding a moral choice."
    }
  }
];
