# AGENTS.md - Repository Guide

## Project

Vue 3 + TypeScript + Vite navigation app for FIRE resources. Uses Pinia, Vue Router, and cyberpunk-themed CSS animations.

**Tech:** Vue 3 (`<script setup>`), TypeScript 5.9, Vite 7, Pinia, Vue Router 4, Bootstrap 5, ESLint + Prettier

---

## Commands

```bash
npm run dev        # Dev server (port 3000, auto-open)
npm run type-check # TypeScript type checking
npm run lint       # ESLint with auto-fix
npm run format     # Format with Prettier
npm run build      # Type-check + build
npm run preview    # Preview production build
npm run deploy     # Deploy to GitHub Pages
```

**No test suite.** Type checking is primary validation.

---

## Code Style

### Imports

**Components:** Default import with `.vue` extension. Use `@/` alias for src/:

```typescript
import Header from './components/Header.vue'
import Navigation from '@/components/Navigation.vue'
```

**Vue Framework:** Named imports

```typescript
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
```

**Types:** Use `import type` for type-only

```typescript
import type { NavTaxonomy, NavLink } from '@/types'
```

**Utilities/Stores:** Named exports

```typescript
import { hasChinese } from '@/utils/font'
import { useCounterStore } from '@/stores/counter'
```

**Order:** External libs → type imports → internal components → utilities/stores

---

### TypeScript

**Type Definitions:**

- Use `interface` for object shapes (`src/types/index.ts`)
- Use `type` aliases for unions/primitives
- Export all types from `src/types/index.ts`

```typescript
export interface NavLink {
  title: string
  logo: string
  url: string
  description?: string
}
```

**Component Types:**

```typescript
const lightning = ref<HTMLElement | null>(null)
const getStyle = (index: number): object => { ... }
```

---

### Components

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Navigation from '@/components/Navigation.vue'

const lightning = ref<HTMLElement | null>(null)
onMounted(() => { ... })
</script>
```

**Comments:** Chinese allowed. Keep concise.

---

### Naming

| Context             | Convention | Example           |
| ------------------- | ---------- | ----------------- |
| Components          | PascalCase | `HomeView.vue`    |
| Utilities/Files     | kebab-case | `font.ts`         |
| Variables/Functions | camelCase  | `hasChinese`      |
| CSS Classes         | kebab-case | `.header-content` |
| CSS Props           | kebab-case | `--neon-color`    |

---

### Formatting (Prettier)

**Config:** Single quotes, No semicolons, 100 char width

```typescript
// ✅ Correct
const getStyle = (index: number) => {
  return { left: `${index * 10}%` }
}

// ❌ Wrong
const getStyle = (index: number) => {
  return { left: `${index * 10}%` }
}
```

---

### Error Handling

```typescript
try {
  const response = await fetch(src, { method: 'HEAD' })
  if (!response.ok) {
    console.warn(`Font file not found: ${src}`)
    return
  }
} catch (error) {
  console.error(`Font loading failed:`, error)
}
```

Use `console.error()` for errors, `console.warn()` for warnings. Graceful degradation. Avoid `as any`.

---

### CSS

**Scoped styles by default:**

```vue
<style scoped>
.header {
  background: #1a1a2e;
}
</style>
```

**Naming:** BEM-inspired, utility classes (`.has-chinese`, `.pixel-font`), theme-related (`.neon-frame`)

---

### File Structure

```
src/
├── assets/      # Static assets
├── components/  # Vue components
├── router/      # Router config
├── stores/      # Pinia stores
├── types/       # Type definitions
├── utils/       # Utility functions
├── views/       # Page components
├── App.vue
└── main.ts
```

---

## Linting

- **Vue ESLint:** Flat config with essential rules
- **TypeScript:** `vueTsConfigs.recommended`
- **Prettier:** Integrated (skip-formatting)
- **Ignores:** `dist/**`, `dist-ssr/**`, `coverage/**`

Run `npm run lint` before committing.

---

## Notes

1. **Path Alias:** `@/` maps to `src/`
2. **Base URL:** `/web3/` (GitHub Pages)
3. **Dev Server:** Port 3000, auto-open
4. **Chinese Content:** Use font utilities from `@/utils/font`
5. **Cyberpunk Theme:** Extensive CSS animations (HomeView.vue)

---

## Checklist Before Changes

1. `npm run type-check` - Verify no TypeScript errors
2. `npm run lint` - Catch code style issues
3. `npm run dev` - Test locally
4. Check imports: `.vue` extensions, `@/` alias, proper order
5. Follow existing patterns and style
