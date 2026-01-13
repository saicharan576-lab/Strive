# Screens Directory Reorganization

## Overview
The screens directory has been reorganized following React Native best practices for better maintainability and scalability.

## New Structure

```
screens/
├── learn-service/
│   └── index.tsx              # LearnService screen component
├── teach-service/
│   └── index.tsx              # TeachService screen component
└── swappypartner/
    ├── index.tsx              # SwappyPartner screen component
    └── components/
        ├── index.ts           # Component exports
        ├── learnFunnelCta.tsx # LearnFunnelCTA component
        ├── smartReaction.tsx  # SmartReactionPopup component
        └── teachFunnelCta.tsx # TeachFunnelCTA component
```

## Changes Made

### 1. Component Organization
- **Before**: Component files were mixed with screen files in the root of `swappypartner/`
- **After**: All components are now in a dedicated `components/` subdirectory

### 2. Naming Conventions
Standardized to camelCase for all component filenames:
- `learnfunnelcta.tsx` → `learnFunnelCta.tsx`
- `teachfunnelCTA.tsx` → `teachFunnelCta.tsx`
- `smartreaction.tsx` → `smartReaction.tsx`

### 3. Centralized Exports
Added `components/index.ts` for clean, centralized exports:
```typescript
export { LearnFunnelCTA } from './learnFunnelCta';
export { SmartReactionPopup } from './smartReaction';
export { TeachFunnelCTA } from './teachFunnelCta';
```

### 4. Updated Imports
Updated all component imports in [tabs/index.tsx](tabs/index.tsx) to use the new barrel export:
```typescript
// Before (multiple imports)
import { SmartReactionPopup } from '../screens/swappypartner/smartreaction';
import { TeachFunnelCTA } from '../screens/swappypartner/teachfunnelCTA';
import { LearnFunnelCTA } from '../screens/swappypartner/learnfunnelcta';

// After (single import)
import { SmartReactionPopup, TeachFunnelCTA, LearnFunnelCTA } from '../screens/swappypartner/components';
```

## Benefits

✅ **Better Organization**: Screen containers and their sub-components are logically grouped  
✅ **Consistency**: Uniform naming conventions across all component files  
✅ **Maintainability**: Components are clearly separated from screen logic  
✅ **Scalability**: Easy to add more components or features to a screen  
✅ **Cleaner Imports**: Barrel exports reduce import complexity  

## Future Improvements

Consider these additional best practices as the app grows:
- Add `types/` or `constants/` directories within screen folders for type definitions
- Create a `hooks/` directory for custom hooks specific to a screen
- Add a `styles/` directory for extracted StyleSheets if screens become large
- Implement a `utils/` directory for screen-specific utility functions
