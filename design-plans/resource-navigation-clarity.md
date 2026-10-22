# Make resource navigation easier to scan and navigate

Written against: current working tree on 2026-10-22; preserve existing language reclassification.

## Evidence chain

- Surface: `/web3/resources`, rendered desktop category landing and previously verified 390px mobile layout.
- Problem: the user explicitly asks for more intuitive visibility and better UX. The rendered desktop repeats category navigation in a narrow sidebar and dense three-column cards; descriptions are tiny previews of the first resource rather than clear category context. Mobile uses horizontal category lists with long labels, hiding available choices outside the viewport. Search scope is not explicit when a theme is selected.
- Design evidence: current `Navigation.vue` owns the resource route, theme switcher, sidebar, search, category landing and result rows. User's requested contract is readable choices and clear navigation state.
- Owner: `src/components/Navigation.vue`.
- Scope: resource navigation only, its existing i18n entries and small regression checks where behavior changes.
- Uncertainty: check category picker density with 205 open-source categories and 34 language categories.

## Design decision

Prioritize search and explicit current location; make category selection visible and readable on both screen sizes. Preserve the existing space theme, resources and interactions.

## Reuse

- Existing surface, border, ink, muted, accent and control tokens; existing native buttons, inputs and details.
- Existing theme/group metadata, category filtering, favorites, book flow, resource matcher and language-purpose state.
- No new dependencies or parallel catalog implementation.

## Changes

1. `src/components/Navigation.vue`: compact the large catalog heading/stat block; place a clear search prompt first, explain selected-theme scope and provide an explicit all-resources search action when scoped. Make current theme/purpose/category legible with a back-to-theme path. Preserve shortcut, sorting, favorites and contextual books.
2. Same owner: use readable theme and category tiles with clear counts and selected states. Remove first-resource-description previews from category tiles when they misrepresent the whole category; show honest action/count copy instead. Avoid duplicating purpose prefixes after a language purpose is selected. Make desktop categories searchable with adequate line height; mobile must offer a labeled expandable category picker instead of requiring horizontal exploration. Preserve preview limits and ability to reach every category.
3. Same owner: strengthen result-row title/description hierarchy and obvious external-open/favorite controls; clear empty-state recovery. Retain full policy descriptions, official URLs, all resource data and favorites storage keys. No artificial featured resources or fabricated popularity.

## Scope

- Inherit: theme overview, theme landing, resource results, favorites, language purpose navigation and mobile category navigation.
- Verify: lifelong learning age guides and book tab, large open-source theme, global and theme search.
- Exclude: app sidebar redesign, data/policy edits, new recommendation algorithms, analytics, deployment.

## Validation

- Product: reach language family policy, search IELTS across language purposes, search all resources, open a large theme category, favorite/unfavorite one item while restoring original state.
- Interface: desktop and 390px, dark/light, no document horizontal overflow; visible active context and reachable category controls; keyboard-native controls.
- Repository: build, lint:check, tests/resource-navigation.test.mjs; inspect diff to preserve unrelated dirty work.

## Stop conditions

- If route, data schema or favorites persistence must change, stop widening scope and retain existing contracts.

## Design documentation

- None required; this plan records the accepted implementation scope.
