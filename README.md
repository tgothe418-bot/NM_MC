# The Nightmare Machine (NM_MC)

The Nightmare Machine is an AI-driven, text-based horror simulation engine designed to create immersive, emergent narratives. Built with React and powered by Google's Gemini models, it acts as an omnipresent "Game Master" that simulates complex horror scenarios, tracks character psychology, and visualizes the nightmare in real-time.

## 🧠 Core Architecture

The system utilizes a bicameral AI pipeline to ensure narrative coherence and mechanical depth:

*   **The Simulator (Logic Engine):** Handles the mechanics of the world—calculating injuries, tracking stress levels, updating location states (e.g., "The kitchen is now on fire"), and determining the consequences of player actions.
*   **The Narrator (Prose Engine):** Takes the raw state updates from the Simulator and renders them into atmospheric, style-consistent prose.
*   **The Visualizer:** Asynchronously generates "Establishing Shots" and character portraits to visually ground the player in the setting.

## ✨ Key Features

*   **Emergent Storytelling:** No pre-written scripts. The story evolves organically based on your actions and the simulation's logic.
*   **Deep NPC Psychology:** Characters are procedurally generated with distinct archetypes, phobias, coping mechanisms, and "breaking points." They panic, lie, and suffer trauma realistically.
*   **Memory System:** NPCs possess episodic memory, referencing past conversations and specific events during dialogue to create continuity.
*   **Dynamic World State:** The engine tracks granular details—from the structural integrity of a room to the specific injuries on a character's body.
*   **Visual Immersion:** Integrated AI image generation creates haunting visuals for locations and characters on the fly.
*   **Auto-Pilot Mode:** The simulation can "play itself," allowing you to watch the horror unfold as a passive observer.

## 🛠️ Tech Stack

*   **Frontend:** React (Vite), TypeScript
*   **Styling:** Tailwind CSS, Lucide React (Icons)
*   **AI Backend:** Google GenAI SDK (Gemini 1.5 Pro / Flash)
*   **State Management:** Custom React Hooks with Reducer patterns

## 🚀 Getting Started

### Prerequisites

*   Node.js (v18+)
*   A valid Google Gemini API Key

### Installation

1.  Clone the repository
    ```bash
    git clone https://github.com/yourusername/nightmare-machine.git
    cd nightmare-machine
    ```

2.  Install dependencies
    ```bash
    npm install
    ```

3.  Start the development server
    ```bash
    npm run dev
    ```

4.  **Enter the Nightmare:** Open your browser to the local host URL (usually `http://localhost:5173`). You will be prompted to enter your API Key to begin.

## 🎮 How to Play

1.  **Setup:** Choose a "Cluster" (Theme), set the Intensity, and define your Protagonist (Survivor) or Antagonist.
2.  **Action:** Type your actions into the input field. Be descriptive ("I barricade the door with the heavy oak table") or decisive ("Run.").
3.  **Survival:** Monitor the Status Panel for your health, stress levels, and the escalating "Threat Scale."
4.  **Save/Load:** Your progress can be saved locally to your browser.

## 📂 Project Structure

*   `src/services/` - Core logic for AI interaction, NPC generation, and game rules.
*   `src/components/` - UI components (Status Panel, Story Log, Input).
*   `src/hooks/` - Custom hooks for game engine state and automation.
*   `src/prompts/` - System instructions that define the AI personas.

---

*This project is a concept for generative horror fiction and may produce disturbing content. User discretion is advised.*
