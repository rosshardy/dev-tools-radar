# Development Tools Radar Widget

A polished React component that visualizes the status of various development tools in a radar quadrant format, designed for executive audiences.

## Features

- **Radar Visualization**: Top-left quadrant radar with concentric rings representing assessment levels
- **Interactive Blips**: Hover and click interactions with tool blips
- **Responsive Layout**: Side-by-side on desktop, stacked on mobile
- **Executive Polish**: Clean, professional design using Nationwide blue color scheme
- **Embeddable**: Can be embedded in various platforms without title or legend

## Assessment Levels

- **Adopt** (innermost ring): Tools we recommend for widespread use
- **Trial** (second ring): Tools worth pursuing for specific projects
- **Evaluate** (third ring): Tools worth exploring with pilots
- **Aware** (outermost ring): Tools to keep on the radar

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
import { DevToolRadar } from './src/components/DevToolRadar';

function App() {
  return (
    <div>
      <DevToolRadar width={800} height={600} />
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
    "assessment": "adopt"
  }
]
```

### Props

- `width` (optional): Width of the radar component (default: 600)
- `height` (optional): Height of the radar component (default: 600)

## Data Structure

Each tool in the data file should have:

- `id`: Unique identifier
- `title`: Display name
- `description`: Detailed description for the details panel
- `url`: Link to the tool's website
- `assessment`: One of `'adopt'`, `'trial'`, `'evaluate'`, or `'aware'`

## Design Principles

- **Executive Focused**: Clean, professional appearance suitable for executive presentations
- **Responsive**: Adapts to different screen sizes
- **Interactive**: Engaging hover and click interactions
- **Accessible**: Proper color contrast and keyboard navigation support
- **Embeddable**: No built-in title or legend, can be embedded anywhere

## Color Scheme

Uses Nationwide blue color palette:
- Primary: `#003f7f`
- Adopt (darkest): `#001a33`
- Trial: `#002a52`
- Evaluate: `#003f7f`
- Aware (lightest): `#4d7ba3`

## Technology Stack

- React 18
- TypeScript
- D3.js for visualization
- Vite for build tooling
