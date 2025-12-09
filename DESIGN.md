# TomatodoAI Design System

## Design Philosophy: "Claude Style"
The design of TomatodoAI is inspired by the clean, typographic, and warm aesthetic of Anthropic's Claude interface. It emphasizes readability, calmness, and a "premium paper" feel.

### Key Characteristics
- **Warm Backgrounds:** Avoiding harsh pure white in favor of cream and stone tones.
- **Serif Typography:** Using elegant serif fonts for headings to evoke a literary/editorial feel.
- **Minimalist UI:** Reducing clutter, using whitespace effectively.
- **Subtle Interactions:** Smooth transitions and gentle hover states.

## Color Palette: Morandi Theme
The application uses a "Morandi" color palette, known for its muted, gray-tinged hues that convey sophistication and calm.

### Core Colors
| Color Name | Hex Code | Tailwind Class | Usage |
| :--- | :--- | :--- | :--- |
| **Cream** | `#fbf9f1` | `bg-cream` | Main application background (Warm Paper) |
| **Stone 900** | `#1c1917` | `text-stone-900` | Primary text |
| **Stone 800** | `#292524` | `text-stone-800` | Headings |
| **Stone 600** | `#57534e` | `text-stone-600` | Secondary text / Icons |
| **White** | `#ffffff` | `bg-white` | Cards, Sidebar, Modals |

### Functional Colors (Timer Modes)
| Mode | Color Name | Hex Code | Tailwind Class | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Pomodoro** | **Muted Terra** | `#c08481` | `text-morandi-red`, `bg-morandi-red` | Focus timer, primary actions |
| **Short Break** | **Sage** | `#8da399` | `text-morandi-green`, `bg-morandi-green` | Short break timer |
| **Long Break** | **Dusty Blue** | `#92a1b9` | `text-morandi-blue`, `bg-morandi-blue` | Long break timer |

## Typography

### Headings
- **Font:** `Playfair Display`
- **Style:** Serif, Elegant, Editorial.
- **Usage:** Main titles, section headers.

### Body Text
- **Font:** `Inter`
- **Style:** Sans-serif, Clean, Legible.
- **Usage:** Task lists, chat interface, buttons.

## UI Components

### Buttons & Interactive Elements
- **Shape:** Rounded corners (`rounded-lg` or `rounded-full`).
- **States:** Subtle opacity changes or background darkening on hover.
- **Shadows:** Soft, diffused shadows (`shadow-sm`, `shadow-md`) to create depth without harshness.

### Layout
- **Container:** Centered `max-w-7xl` layout.
- **Sidebar:** Collapsible chat sidebar on mobile, fixed on desktop.
- **Spacing:** Generous padding (`p-6`, `p-12`) to let the content breathe.
