# System Design & Architecture Decisions

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      Browser                            │
│  ┌───────────────────────────────────────────────────┐  │
│  │                   React App                       │  │
│  │  ┌─────────┐  ┌──────────┐  ┌─────────────────┐  │  │
│  │  │  Header  │  │  Routes   │  │     Footer      │  │  │
│  │  │(always)  │  │(lazy load)│  │   (always)      │  │  │
│  │  └─────────┘  └──────────┘  └─────────────────┘  │  │
│  │                    │                              │  │
│  │  ┌─────────────────┼──────────────────────────┐   │  │
│  │  │         ErrorBoundary + Suspense           │   │  │
│  │  │  ┌─────┐ ┌───────┐ ┌───────┐ ┌─────────┐  │   │  │
│  │  │  │Home │ │Details│ │Explore│ │ Search  │  │   │  │
│  │  │  │     │ │       │ │       │ │ Results │  │   │  │
│  │  │  └─────┘ └───────┘ └───────┘ └─────────┘  │   │  │
│  │  └────────────────────────────────────────────┘   │  │
│  │                    │                              │  │
│  │  ┌─────────────────┼──────────────────────────┐   │  │
│  │  │           State Layer                      │   │  │
│  │  │  ┌──────────────┐  ┌────────────────────┐  │   │  │
│  │  │  │ Redux Store  │  │ Component State    │  │   │  │
│  │  │  │ (url, genres)│  │ (UI, page data)    │  │   │  │
│  │  │  └──────────────┘  └────────────────────┘  │   │  │
│  │  └────────────────────────────────────────────┘   │  │
│  │                    │                              │  │
│  │  ┌─────────────────┼──────────────────────────┐   │  │
│  │  │           Data Layer                       │   │  │
│  │  │  ┌──────────────┐  ┌────────────────────┐  │   │  │
│  │  │  │  useFetch    │  │ fetchdatafromapi   │  │   │  │
│  │  │  │  (hook)      │  │ (axios wrapper)    │  │   │  │
│  │  │  └──────────────┘  └────────────────────┘  │   │  │
│  │  └────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────┘  │
│                          │                              │
│                          ▼                              │
│              TMDB API (api.themoviedb.org/3)             │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

```
User Action → Component → useFetch/fetchdatafromapi → TMDB API
                                  │                       │
                          cancellation flag          retry (5xx/429)
                          on unmount                 up to 2x with backoff
                                                         │
                                                         ▼
              Component ← setState (local) ← API Response
              Component ← dispatch (Redux) ← Config/Genres
              Document  ← usePageMeta      ← title/description
              Logger    ← logger.error     ← errors (dev only)
```

1. **App mount**: Validates env config (fails fast if TMDB token missing), fetches API configuration (image base URLs) and genre lists → dispatches to Redux store
2. **Page navigation**: React Router renders lazy-loaded page → page uses `useFetch` hook with appropriate endpoint → `usePageMeta` sets document title
3. **useFetch**: Manages loading/data/error lifecycle, re-runs when URL dependency changes, cancels stale requests on unmount
4. **fetchdatafromapi**: Retries on transient failures (5xx, 429) with linear backoff, throws immediately on client errors (4xx)
5. **Components**: Read global data (URLs, genres) from Redux, page-specific data from local state

---

## Tradeoffs & Key Decisions

### 1. Redux Toolkit vs Context API for Global State

**Decision:** Redux Toolkit

**Why:** The app needs two pieces of truly global data — TMDB image base URLs and genre ID-to-name mappings — that are consumed by 10+ components across all pages. Redux Toolkit provides:
- Built-in Immer for immutable updates
- DevTools for debugging state changes
- Predictable data flow with a single source of truth

**Tradeoff:** Adds ~15KB to bundle (Redux + React-Redux). Context API would be zero-cost, but Redux scales better if state grows (e.g., adding favorites, watch history, user auth). For just 2 reducers, Context would work, but Redux signals architectural maturity.

**Alternative considered:** React Context + useReducer — lighter, but loses DevTools and middleware support.

---

### 2. Custom useFetch Hook vs React Query / SWR

**Decision:** Custom `useFetch` hook

**Why:** The app has simple data fetching needs — GET requests with loading/error states, no mutations, no optimistic updates. A 26-line custom hook provides exactly what's needed without adding 30KB+ of library code.

**Tradeoff:** We lose automatic caching, deduplication, background refetching, and stale-while-revalidate. If users navigate Back → Forward between pages, the same API call fires again. For a read-only movie browsing app with TMDB's generous rate limits, this is acceptable.

**When I'd switch:** If the app added user accounts with favorites/watchlists requiring mutations, optimistic updates, and cache invalidation, React Query would be worth its weight.

---

### 3. Route-Level Code Splitting vs Full Eager Loading

**Decision:** `React.lazy()` + `Suspense` for all 5 page components

**Why:** The app has 5 distinct pages with different dependencies. Details page imports react-player (~35KB), Explore imports react-select (~83KB), Home imports heavy carousel logic. Without splitting, the initial bundle forces users to download code they may never use.

**Tradeoff:** First navigation to a new route shows a brief loading spinner. This is acceptable because:
- Subsequent visits are cached
- The spinner matches the data loading state users already expect
- Initial page load (Home) is faster — the metric users care about most

**Build evidence:** Code splitting creates separate chunks — `index.js` (240KB), `Explore.js` (83KB), `Details.js` (35KB), etc.

---

### 4. ErrorBoundary at Route Level vs Per-Component

**Decision:** Single ErrorBoundary wrapping `<Routes>`, not individual components

**Why:** A crash in any page component shows a fallback with retry, but Header and Footer remain visible — the user can still navigate. Wrapping every component would be over-engineering for a read-only app where most errors are network-related, not render-time crashes.

**Tradeoff:** If a deeply nested component (e.g., one carousel item) crashes, the entire page goes down instead of just that component. This is acceptable because the components are simple and well-tested. The alternative (ErrorBoundary per Carousel, per MovieCard) would add complexity without proportional benefit.

---

### 5. Module-Level Mutable State vs useRef for Explore Filters

**Decision:** Migrated from `let filters = {}` (module-level) to `useRef({})` (instance-level)

**Why:** Module-level mutable state is a subtle bug in React. If React ever renders two instances of `<Explore>` (e.g., during Strict Mode double-render or route transitions), they share the same `filters` object, causing state corruption. `useRef` scopes the mutable object to the component instance.

**Tradeoff:** `useRef` values don't trigger re-renders when mutated, which is exactly what we want for filter params — they're passed to API calls, not rendered directly. The filters are applied on the next `fetchInitialData()` call, not on mutation.

**Why not useState:** Filters don't need to trigger re-renders. Using `useState` for them would cause unnecessary re-renders on every filter change before the fetch fires.

---

### 6. Throwing Errors vs Returning Error Strings in API Layer

**Decision:** `fetchdatafromapi` throws on error (not returns `error.message`)

**Why:** The original implementation returned `error.message` as the response data. This meant callers couldn't distinguish between `"Network Error"` (a string from a failed call) and actual movie data. The custom hook's `.then()` would happily set `error.message` as `data`, rendering garbage.

**Tradeoff:** Callers must now handle thrown errors with `.catch()` or try/catch. This is the correct JavaScript convention — functions should either return data or throw, never return errors as data.

---

### 7. React.memo on Leaf Components vs Everywhere

**Decision:** `React.memo` on MovieCard, Rating, Genres, ContentWrapper — not on pages or containers

**Why:** These are "leaf" components rendered in lists (carousels render 20+ MovieCards). Without memo, every parent re-render recreates all children. Pages and containers have too many state changes and prop variations for memo to help — the shallow comparison cost would exceed the savings.

**Tradeoff:** React.memo adds a shallow prop comparison on every render. For components with many props or object/array props, this can actually slow things down. MovieCard, Rating, and Genres have simple, primitive-heavy props — ideal for memo.

**Not memoized:** Header (re-renders on scroll, search state changes — memo comparison would rarely short-circuit), Page components (too many changing props).

---

### 8. SCSS Mixins vs CSS-in-JS vs Tailwind

**Decision:** SCSS with shared mixins for breakpoints

**Why:** SCSS provides:
- Nesting (matches component tree structure)
- Variables for consistent colors/spacing
- Mixins for DRY responsive breakpoints (`@include md { ... }`)
- No runtime cost (compiled to CSS at build time)

**Tradeoff:** Component styles are in separate `.scss` files, not co-located with JSX. This means a developer must switch between two files. CSS-in-JS (styled-components) would co-locate, but at a runtime cost. Tailwind would avoid separate files, but its utility classes reduce readability and add a learning curve.

**The mixin system:**
```scss
@mixin md { @media only screen and (min-width: 768px) { @content; } }
```
This ensures all components use identical breakpoints. Adding or modifying a breakpoint is a single-line change in `mixins.scss`.

---

### 9. Infinite Scroll vs Traditional Pagination

**Decision:** Infinite scroll for Search Results and Explore pages

**Why:** Movie browsing is a discovery experience. Users scroll through results visually — clicking "Page 2" breaks the browsing flow. Infinite scroll loads the next page automatically when the user reaches the bottom, maintaining momentum.

**Tradeoff:**
- **Lost:** Direct page navigation ("jump to page 5"), URL-based pagination for sharing specific results
- **Gained:** Smoother UX, reduced clicks, natural mobile scrolling behavior
- **Risk:** Memory usage grows as pages accumulate. Mitigated by lazy-loaded images (only visible images load)

**Library choice:** `react-infinite-scroll-component` — mature, simple API, handles the scroll detection logic we'd otherwise write ourselves.

---

### 10. Lazy-Loaded Images with Blur Effect vs Native Loading=lazy

**Decision:** `react-lazy-load-image-component` with blur effect

**Why:** Native `loading="lazy"` only defers loading — the user sees nothing until the image loads. The blur effect provides visual feedback immediately: a blurred low-quality placeholder transitions to the full image. This communicates "something is loading here" without custom skeleton code per image.

**Tradeoff:** Adds 5KB to the bundle vs zero for native lazy loading. The blur effect also requires the `blur.css` import. For an image-heavy app (posters, backdrops, cast photos), the UX improvement justifies the cost.

---

### 11. Single API Wrapper vs Axios Interceptors

**Decision:** Single `fetchdatafromapi` function with inline headers

**Why:** The app makes one type of request (GET with bearer token). A single function with hardcoded headers is simpler and more explicit than configuring axios interceptors. Any developer reading the code immediately sees what headers are sent.

**Tradeoff:** If we needed request/response interceptors (token refresh, retry logic, request logging), the function approach would need restructuring. For a read-only app with a static API token, this is the right level of abstraction.

**What I'd add for production:** Axios instance with interceptors for:
- 401 handling (token refresh)
- Retry with exponential backoff (3 attempts)
- Request/response logging in development

---

### 12. Testing Strategy: Integration-Heavy vs Unit-Heavy

**Decision:** Balance of both — 68 unit tests + 40 integration tests + 11 infrastructure tests

**Why:** Unit tests verify individual components in isolation (does MovieCard render the title? Does Rating show the right color?). Integration tests verify that components work together with real routing, Redux state, and mocked API calls (does the Details page show cast from the credits API?).

**Tradeoff:** Integration tests are slower and more brittle (sensitive to DOM structure), but they catch bugs that unit tests miss — like a component consuming the wrong Redux state key, or lazy loading failing to render the expected component.

**What's NOT tested:** E2E browser tests (Cypress/Playwright). These would test the real TMDB API with a real browser, catching issues like CORS, actual network latency, and CSS rendering bugs. For a resume project, unit + integration coverage is sufficient.

---

### 13. BrowserRouter vs HashRouter

**Decision:** BrowserRouter (history-based routing)

**Why:** Clean URLs (`/movie/123` vs `/#/movie/123`). BrowserRouter produces professional-looking URLs that users expect from modern web apps.

**Tradeoff:** Requires server-side configuration for production deployment — the server must return `index.html` for all routes. HashRouter works everywhere without server config. For static hosting (Vercel, Netlify), this is a non-issue — their SPA configs handle it. For S3/basic hosting, this would need a redirect rule.

---

### 14. Component State for Page Data vs Redux for Everything

**Decision:** Redux for config + genres only. Component-level state for page data (search results, explore data, details).

**Why:** Page-specific data is short-lived — it changes when the user navigates and isn't shared across pages. Putting it in Redux would mean:
- Stale data from previous pages lingering in the store
- Complex cleanup logic on unmount
- Unnecessary coupling between pages

**Tradeoff:** If users navigate away and come back, data is re-fetched (no caching). This is acceptable for TMDB data that changes frequently (trending, popular). The alternative (caching in Redux) would require invalidation logic and stale data management — complexity that isn't justified for this use case.

**Rule of thumb:** If data is needed by 3+ unrelated components → Redux. If data is scoped to one page/route → component state.

---

### 15. Accessibility: Progressive Enhancement vs Full WCAG AA

**Decision:** Progressive accessibility improvements — ARIA labels, keyboard navigation, focus management — targeting common use cases

**What's implemented:**
- `aria-label` on all icon-only buttons (search, menu, close, carousel arrows)
- `role="dialog"` + `aria-modal="true"` on video popup
- Escape key closes modals
- Focus moves to close button when modal opens
- `tabIndex={0}` + Enter key handlers on clickable non-button elements
- Semantic HTML (`<header>`, `<nav>`, `<footer>`, `role="banner"`)

**What's NOT implemented (and why):**
- Full focus trapping in modals (Tab cycling) — would require a 50+ line focus trap utility or a library. The Escape key + backdrop click provides sufficient escape.
- Skip-to-content link — the header is lightweight enough that tabbing through it is fast
- `aria-live` regions for dynamic content — carousel and search results load without announcing changes to screen readers

**Tradeoff:** We chose the 20% of accessibility work that covers 80% of user needs. Full WCAG AA compliance would require significantly more effort for diminishing returns in a portfolio project. In a production app, I would use a library like `@radix-ui` for fully accessible primitives.

---

### 16. API Retry with Linear Backoff vs No Retry

**Decision:** Retry up to 2 times on server errors (5xx) and rate limits (429) with linear delay (1s, 2s). No retry on client errors (4xx).

**Why:** TMDB is a third-party API — transient 500s and rate limiting are inevitable. Without retry, a single blip shows an error to the user. With retry, most transient failures self-heal invisibly.

**Tradeoff:** Retry adds latency on true failures — a permanent 500 takes 4+ seconds (initial + 1s + 2s delays) instead of failing immediately. This is acceptable because permanent server errors are rare, and the user sees a loading spinner during retries anyway. Not retrying on 4xx (404, 401, 422) prevents wasting time on requests that will always fail.

**Alternative considered:** Exponential backoff (1s, 2s, 4s) — overkill for max 2 retries. Circuit breaker pattern — unnecessary complexity for a client-side app with a single API dependency.

---

### 17. Request Cancellation via Cleanup Flag vs AbortController

**Decision:** Boolean `cancelled` flag in `useFetch` cleanup, not `AbortController`

**Why:** When a user navigates away from a page, the in-flight API call's `.then()` would call `setState` on an unmounted component. The `cancelled` flag prevents this. We use a simple boolean instead of `AbortController` because:
- The flag approach is simpler (3 lines vs 10+)
- It still prevents the state update bug
- The API call completes naturally (no abort error handling needed)

**Tradeoff:** The HTTP request still completes in the background — it wastes bandwidth but causes no bugs. `AbortController` would actually cancel the network request, saving bandwidth. For TMDB's lightweight JSON responses (< 5KB), the wasted bytes are negligible. For a video streaming or large file download app, `AbortController` would be necessary.

---

### 18. Environment Validation: Fail Fast vs Silent Fallback

**Decision:** Throw immediately if `VITE_APP_TMDB_TOKEN` is missing

**Why:** Without the token, every API call returns 401. The app would render empty carousels with no explanation. Failing fast with a clear error message (`"Missing TMDB API token. Set VITE_APP_TMDB_TOKEN in your .env file."`) saves debugging time — especially for other developers cloning the repo.

**Tradeoff:** The app won't render at all without the token, which could seem harsh. But a broken-looking app with empty data is worse than a clear error message. This is the "crash early, crash often" principle — surface configuration problems at startup, not at runtime.

---

### 19. Conditional Logger vs Direct console.error

**Decision:** Custom `logger` utility that only outputs in development mode

**Why:** `console.error` calls ship to production users, polluting their browser console and potentially leaking internal details (error stack traces, API URLs). The logger checks `import.meta.env.DEV` and only logs in development. In production, the logger is a no-op — ready to be wired to a monitoring service (Sentry, DataDog) without changing call sites.

**Tradeoff:** Errors are completely silent in production unless a monitoring service is integrated. This is intentional — console output is not monitoring. The logger's `error()` method is the integration point: swap the no-op with `Sentry.captureException(error)` when ready.

---

### 20. Dynamic Page Meta (usePageMeta) vs Static Title

**Decision:** Custom `usePageMeta` hook that sets `document.title` and `<meta description>` per route

**Why:** A static "Movies" title across all pages is unprofessional. Dynamic titles (`"Search: batman | Movix"`, `"Explore TV Shows | Movix"`) improve:
- SEO — search engines use page titles for ranking
- UX — users with multiple tabs can identify each tab
- Analytics — page titles appear in analytics tools

**Tradeoff:** The hook uses `document.title` directly instead of `react-helmet` (8KB). This is sufficient for a SPA where the only dynamic meta is title + description. `react-helmet` would be needed for Open Graph tags, canonical URLs, or structured data. The cleanup function in `useEffect` resets the title on unmount, preventing stale titles during navigation.

---

## What I'd Do Differently in Production

1. **TypeScript** — Type safety for all components, hooks, and API responses
2. **React Query** — Caching, deduplication, background refetch, optimistic updates
3. **E2E Tests** — Cypress or Playwright for critical user flows
4. **CI/CD Pipeline** — GitHub Actions running lint + test + build on every PR
5. **Monitoring** — Sentry for error tracking, Web Vitals for performance
6. **SSR/SSG** — Next.js for SEO (movie detail pages should be crawlable)
7. **PWA** — Service worker for offline support and app-like mobile experience
8. **Image Optimization** — WebP/AVIF with responsive srcSet instead of loading original-size images
9. **i18n** — Internationalization for multi-language support
10. **Rate Limiting** — Debounced API calls and request queuing for TMDB rate limits
