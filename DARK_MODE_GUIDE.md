# Dark/Light Mode Implementation Guide

## Overview

The project now supports dark and light themes with automatic system preference detection.

## What Was Implemented

### 1. Theme Management Hook (`src/hooks/use-theme.ts`)

A composable that handles theme switching with three modes:
- **`light`**: Force light theme
- **`dark`**: Force dark theme
- **`system`**: Follow OS/browser preference (default)

#### Features:
- Persists theme preference in `localStorage`
- Automatically detects system theme changes
- Applies theme to both DaisyUI (`data-theme` attribute) and Tailwind (`dark` class)

#### API:
```typescript
const { theme, setTheme, toggleTheme, getSystemTheme } = useTheme()

// Switch between light and dark
toggleTheme()

// Set specific theme
setTheme('dark')
setTheme('light')
setTheme('system')
```

### 2. Tailwind Configuration

Updated `tailwind.config.js`:
```javascript
{
  darkMode: 'class',
  daisyui: {
    themes: ["light", "business"],
    darkTheme: "business",
  }
}
```

- **Light theme**: Uses DaisyUI's `light` theme
- **Dark theme**: Uses DaisyUI's `business` theme (dark blue-gray)

### 3. Theme Toggle Component

Created `src/components/theme-toggle/` - a simple button with sun/moon icons for switching themes.

Added to the admin navbar for easy access throughout the app.

### 4. Dashboard Redesign

Completely redesigned the homepage (`src/domain/home/home-page/`) to match the modern dashboard design with:

#### Layout:
- **Header**: Dashboard title and description
- **Left Column (2/3)**: Three monitoring cards
  - Microseismic Monitoring
  - Trace Monitoring
  - Microseismic Analyst
- **Right Column (1/3)**: Nearby Earthquake list with real-time data
- **Footer**: Fixed status bar showing system health

#### Dark Mode Support:
All colors use Tailwind's dark mode variants:
```vue
<div class="bg-white dark:bg-[#252d3d]">
  <h1 class="text-gray-900 dark:text-white">Title</h1>
  <p class="text-gray-600 dark:text-gray-400">Description</p>
</div>
```

#### Features:
- **Live indicators**: Animated pulse for real-time monitoring
- **Clickable cards**: Navigate to respective views
- **Real earthquake data**: Fetches last 7 days using `useGetAllEventList`
- **Responsive**: Mobile-friendly with proper breakpoints
- **Interactive**: Hover effects and smooth transitions

### 5. App-Wide Theme Initialization

Updated `src/App.vue` to initialize the theme system when the app loads.

## How to Use Dark/Light Mode

### For Users:
1. Click the sun/moon icon in the navbar
2. Theme preference is saved automatically
3. On first visit, follows your system preference

### For Developers:

#### Using Dark Mode in Components:

**Option 1: Tailwind dark: prefix**
```vue
<div class="bg-white dark:bg-gray-900">
  <p class="text-black dark:text-white">Text</p>
</div>
```

**Option 2: DaisyUI Theme Colors**
```vue
<!-- Automatically adapts to theme -->
<div class="bg-base-100 text-base-content">
  <button class="btn btn-primary">Button</button>
</div>
```

#### Custom Theme Logic:
```typescript
import { useTheme } from '@src/hooks/use-theme'

const { theme, setTheme, toggleTheme } = useTheme()

// Check current theme
if (theme.value === 'dark') {
  // Dark mode specific logic
}

// Toggle theme programmatically
toggleTheme()
```

## Color Palette

### Dark Theme (business):
- Background: `#1a1f2e`, `#252d3d`
- Cards: `#1e2433`, `#252d3d`
- Borders: `#374151` (gray-700)
- Text: `#ffffff`, `#9ca3af` (gray-400)
- Accent: `#06b6d4` (cyan-600)

### Light Theme:
- Background: `#f9fafb` (gray-50)
- Cards: `#ffffff`
- Borders: `#e5e7eb` (gray-200)
- Text: `#111827` (gray-900), `#6b7280` (gray-600)
- Accent: `#06b6d4` (cyan-600)

## File Structure

```
src/
├── hooks/
│   └── use-theme.ts           # Theme management hook
├── components/
│   └── theme-toggle/          # Theme toggle button component
│       ├── theme-toggle.vue
│       └── index.ts
└── domain/
    └── home/
        └── home-page/         # Redesigned dashboard with dark mode
            └── home-page.vue
```

## Browser Support

The theme system works in all modern browsers that support:
- CSS custom properties
- `prefers-color-scheme` media query
- `matchMedia` API
- localStorage

## Notes

- Theme preference persists across sessions via localStorage
- System theme changes are detected automatically when using 'system' mode
- The app initializes with the saved theme or system preference on load
- Both DaisyUI components and custom Tailwind styles respect the theme
