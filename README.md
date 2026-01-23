# 💀 The Nightmare Machine (v4.0)

> *"The Machine has no ethics, morals, or concern for you. It only cares for the story."*

The Nightmare Machine is a high-fidelity, AI-driven interactive horror engine. Far beyond a simple chatbot, it is a state-tracked simulation that monitors psychological stress, procedural locations, and narrative causality in real-time.

Born from **"Vibe Coding"** and refined into a stable React architecture, it leverages the bleeding edge of **Gemini 3 / 2.0 Pro Experimental** models to act as a forensic storyteller, weaving trauma and tension into a cinematic roleplay experience.

---

## 🧬 Core Architectures

### 1. The "Affable" Architect
The setup phase is no longer a static form. It is powered by a specialized **Co-Author Persona** running on high-reasoning models.
* **Collaborative World Building:** The Architect asks probing questions to deepen your lore before the simulation begins.
* **Context Ingestion:** Upload PDFs, images, or text files; the Architect analyzes them to extract characters, themes, and visual motifs automatically.
* **Creative Partnership:** It doesn't just take orders; it suggests twists, refinements, and aesthetic improvements.

### 2. The Logic/Narrative Split
The engine uses a bicameral processing pipeline to ensure consistency:
* **Left Brain (Simulator):** A strict Logic Engine (Gemini Pro) that manages JSON state, tracks injury vectors, and calculates survival probabilities without generating prose.
* **Right Brain (Narrator):** A creative Prose Engine (Gemini Flash Thinking) that translates the raw state into evocative, sensory-rich horror narrative.

### 3. Zod-Guarded Stability
* **Schema Validation:** All AI outputs are rigorously validated against Zod schemas. If the model "hallucinates" an invalid state or format, the engine detects, cleans, and repairs the data in milliseconds to prevent crashes.
* **Turn-Locked Auto-Pilot:** A robust automated testing mode that plays the game itself to stress-test narrative branches, protected by strict concurrency locking.

---

## 🌑 The Seven Horror Clusters
The machine modulates its vocabulary, sensory descriptions, and event generation based on seven distinct thematic settings:

1.  **THE FLESH**: Biological transfiguration, body horror, and anatomical honesty.
2.  **THE SYSTEM**: Digital indifference, algorithmic basilisks, and bit-rot.
3.  **THE HAUNTING**: Spectral residue, gothic atmosphere, and the weight of history.
4.  **THE SELF**: Ontological corruption, doppelgängers, and the breakdown of identity.
5.  **THE BLASPHEMY**: Transgressive realism, cults, and the inverted sacred.
6.  **THE VOID**: Elemental indifference, isolation, and the silence of the snow.
7.  **THE HUNGER**: Predatory intimacy, vampirism, and decadent decay.

---

## 🛠 Technical Stack

* **Framework**: React 18 + Vite + TypeScript
* **AI Backend**: Google GenAI SDK (Gemini 2.0 Pro Exp / Gemini 3 Preview)
* **State Management**: Custom `useGameEngine` hooks with immutable state updates.
* **Data Integrity**: `Zod` for runtime schema validation and parsing.
* **Styling**: Tailwind CSS with a "Nano Banana" / Dark UI aesthetic.

---

## 🚀 Getting Started

1.  **Clone the Repository**:
    ```bash
    git clone [https://github.com/your-repo/nightmare-machine.git](https://github.com/your-repo/nightmare-machine.git)
    cd nightmare-machine
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

4.  **Enter the Lattice**:
    Launch the app and provide your **Google GenAI API Key**. 
    *Note: The key is stored in a runtime Singleton for the session and is never saved to disk.*

---

## ⚠️ Disclaimer
This simulation explores extreme themes including psychological distress, violence, and existential dread. It is designed for mature audiences. Enter at your own risk.
