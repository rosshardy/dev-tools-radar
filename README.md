# Development Tools Radar Widget

A modern React component that visualizes the status of development tools in an interactive flow-based layout, designed for executive and team audiences.

## Features

- **Flow-Based Visualization**: Progressive boxes showing tool adoption stages from backlog to recommendation
- **Interactive Tool Selection**: Click on tool pills to view detailed information
- **Reviewer Integration**: Tools can include reviewer information with photos and positions
- **Dual Position Display**: Shows both internal team position and AI-generated assessment
- **Responsive Design**: Horizontal flow on desktop, vertical stack on mobile
- **Executive Polish**: Clean, professional design with modern card-based interface
- **Embeddable**: Lightweight component that can be embedded anywhere

## Assessment Categories

- **Recommend Adoption**: Tools we actively recommend for widespread team use
- **Internal Trial**: Tools currently being trialed by specific teams or projects
- **Under Evaluation**: Tools being evaluated for potential adoption
- **In Backlog**: Tools on our radar but not yet under active consideration

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Usage

### Basic Usage

```tsx
import { DevToolRadar } from 'dev-tool-radar';

function App() {
  return (
    <div>
      <DevToolRadar />
    </div>
  );
}
```

### With Custom CSS Class

```tsx
import { DevToolRadar } from 'dev-tool-radar';
import './custom-styles.css';

function App() {
  return (
    <div>
      <DevToolRadar className="my-custom-radar" />
    </div>
  );
}
```

### Customizing Data

Update the `src/data/tools.json` file with your own tools:

```json
[
  {
    "id": "unique-tool-id",
    "title": "Tool Name",
    "description": "Detailed description of the tool and its purpose...",
    "url": "https://tool-website.com",
    "assessment": "adopt",
    "ourPosition": "Our team's perspective and experience with this tool...",
    "aiPosition": "AI-generated assessment and analysis of the tool...",
    "reviewer": {
      "name": "John Doe",
      "photoUrl": "https://example.com/photo.jpg"
    }
  }
]
```

### Props

- `className` (optional): CSS class name to apply to the component root element

## Data Structure

Each tool in the data file should have:

### Required Fields
- `id`: Unique identifier (string)
- `title`: Display name (string)
- `description`: Detailed description for the details panel (string)
- `url`: Link to the tool's website (string)
- `assessment`: One of `'adopt'`, `'trial'`, `'evaluate'`, or `'aware'` (string)

### Optional Fields
- `ourPosition`: Your team's perspective and experience with the tool (string)
- `aiPosition`: AI-generated assessment and analysis of the tool (string)
- `reviewer`: Object containing reviewer information
  - `name`: Reviewer's full name (string)
  - `photoUrl`: URL to reviewer's photo (string)

## Design Principles

- **Executive Focused**: Clean, professional appearance suitable for executive presentations
- **Progressive Flow**: Visual representation of tool adoption journey from backlog to recommendation
- **Responsive**: Adapts to different screen sizes with intelligent layout changes
- **Interactive**: Engaging hover and click interactions with smooth transitions
- **Information Rich**: Supports multiple perspectives (team position, AI assessment, reviewer insights)
- **Accessible**: Proper color contrast and keyboard navigation support
- **Embeddable**: Self-contained component that can be embedded anywhere

## Color Scheme

Uses a modern, accessible color palette:

### Assessment Categories
- **Recommend Adoption**: `#22c55e` (Green)
- **Internal Trial**: `#fbbf24` (Yellow/Amber)  
- **Under Evaluation**: `#fb923c` (Orange)
- **In Backlog**: `#4d7ba3` (Blue, dotted border)

### UI Elements
- **Primary Blue**: `#003f7f`
- **Background**: `#ffffff` with subtle gradients
- **Accents**: Various shades of blue (`#e5f1ff`, `#f8fbff`, `#f0f7ff`)
- **Text**: `#333333` for content, `#666666` for secondary text

## Technology Stack

- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Full type safety and IntelliSense support
- **CSS3**: Custom styling with CSS Grid, Flexbox, and modern features
- **Vite**: Fast build tooling and development server

## Component Architecture

The component uses a clean, modular architecture:

- `DevToolRadar.tsx`: Main component with state management and layout
- `DevToolRadar.css`: Comprehensive styling with responsive design
- `Tool.ts`: TypeScript interfaces and type definitions
- `tools.json`: Data source for development tools

## Build Output

The package can be built as:
- **ES Module**: `dev-tool-radar.es.js`
- **UMD Module**: `dev-tool-radar.umd.js`
- **CSS**: `style.css`

## Browser Support

Modern browsers supporting:
- CSS Grid and Flexbox
- ES2015+ JavaScript features
- CSS custom properties (variables)
