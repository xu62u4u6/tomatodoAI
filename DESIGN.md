# TomatodoAI Design System

## Design Philosophy: "Focused Minimalism"
The design evolves the "Claude Style" into a hyper-focused, minimalist aesthetic. It prioritizes the user's current task and time management without visual distractions. The interface is clean, paper-like, and utilizes specific "Morandi" tones to convey a calm, productive atmosphere.

### Key Characteristics
- **Focused Layout:** A three-column layout where the center "Focus Zone" is the visual anchor.
- **Paper-Like Warms:** Backgrounds uses warm, off-white tones (`bg-cream`, `bg-pomodoro-bg`) effectively like high-quality stationery.
- **Mixed Typography:** A deliberate contrast between elegant **Serif** (Titles, Timer) and clean **Sans-Serif** (Tasks, UI controls).
- **Dynamic Theming:** All primary elements (Icons, Borders, Backgrounds) adapt to the current timer mode (Pomodoro, Short Break, Long Break).

## Color Palette: Morandi Theme
The application uses a widely recognized "Morandi" color palette—muted, gray-tinged hues that feel sophisticated and organic.

### Functional Colors (Modes)
| Mode | Color Name | Hex Code | Usage |
| :--- | :--- | :--- | :--- |
| **Pomodoro** | **Muted Terra** | `#c08481` | Focus timer, primary actions, fire icons. |
| **Short Break** | **Sage** | `#8da399` | Short break timer, peaceful transitions. |
| **Long Break** | **Dusty Blue** | `#92a1b9` | Long break timer, deep rest. |

### Semantic Usage
- **Primary Elements:** `text-theme` (mapped to current mode color), `bg-theme`.
- **Secondary/Hover:** `opacity-70` for icons, `bg-theme/10` for subtle backgrounds.

## Typography

### Display & Timer
- **Font:** Serif (e.g., `Playfair Display` or system serif).
- **Usage:**
    - **Timer Display:** Extra large, tabular nums for readability.
    - **Brand Logo:** "TomatodoAI" in the header.
    - **Quotes:** Inspirational text below the timer.

### Interface & Tasks
- **Font:** Sans-Serif (e.g., `Inter` or system sans).
- **Usage:**
    - **Current Task Title:** Bold, high legibility.
    - **Navigation:** Settings icons.
    - **Control Buttons:** Start/Stop/Mode toggles.

## UI Components

### Header
- **Style:** Extremely minimalist.
- **Content:**
    - **Left:** Brand Logo (Serif) with themed Fire icon.
    - **Right:** Settings Gear icon (Themed).
- **Behavior:** Stays out of the way, framing the content.

### Focus Zone (Center)
- **Timer:** The centerpiece. Large typography, minimal controls.
- **Task Card:** A white, shadowed card floating below the timer. Contains the active task details.
- **Visuals:** Uses FontAwesome icons (`fa-solid`) colored dynamically (`text-theme`) for consistency.

### Navigation & Icons
- **Library:** FontAwesome Solid (`fa-solid`).
- **Styling:**
    - Standard Icon: `<i className="fa-solid fa-[name] text-theme opacity-70"></i>`
    - This ensures icons always match the active mode (Red/Green/Blue) without hardcoding.
