# ABOS Frontend

React + TypeScript + Vite frontend for the ABOS Building Management Platform.

## Tech Stack
- **Framework:** React 19 + Vite
- **Language:** TypeScript
- **Styling:** TailwindCSS v4 + clsx + tailwind-merge
- **State/Data:** TanStack Query + Context API
- **Routing:** React Router v7
- **Icons:** Lucide React

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## Architecture
- `src/api`: Axios client and interceptors.
- `src/features`: Feature-based modules (Auth, Buildings).
- `src/layouts`: Layout components (DashboardLayout).
- `src/pages`: Route components.
- `src/types`: Shared TypeScript interfaces.

## Configuration
- **API URL:** Configured in `src/api/client.ts` (Default: https://techgazzeta.org)
