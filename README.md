# Movix - Movie Discovery Platform

A responsive movie and TV show discovery platform built with React 18, Redux Toolkit, and the TMDB API. Features infinite scroll, lazy-loaded images, route-level code splitting, error boundaries, API retry with backoff, request cancellation, dynamic SEO, and comprehensive test coverage.

## Features

- **Home Page** - Hero banner with random backdrop, trending (day/week toggle), popular, and top-rated sections with horizontal carousels
- **Search** - Real-time search across movies and TV shows with infinite scroll pagination
- **Details Page** - Full movie/TV metadata: rating, runtime, overview, cast, official trailers, similar content, and recommendations
- **Explore** - Browse movies or TV shows with multi-select genre filtering and sort options (popularity, rating, release date, title)
- **Responsive Design** - Mobile-first approach with SCSS mixins for consistent breakpoints
- **Error Handling** - ErrorBoundary wrapping routes, API retry with exponential backoff, environment validation, graceful failure with retry UI
- **Performance** - Route-level code splitting (React.lazy + Suspense), React.memo on pure components, useCallback for handlers, lazy-loaded images with blur effect, request cancellation on unmount
- **Accessibility** - ARIA labels, keyboard navigation, focus management in modals, semantic HTML roles
- **SEO** - Dynamic page titles and meta descriptions per route via custom `usePageMeta` hook
- **Production Readiness** - Conditional logger (dev-only console output), env config validation, retry/backoff on transient failures

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | React 18.2 |
| State Management | Redux Toolkit 1.9 |
| Routing | React Router DOM 6.6 |
| Build Tool | Vite 5.2 |
| Styling | SCSS with mixins |
| HTTP Client | Axios 1.2 |
| Testing | Vitest + React Testing Library |
| API | TMDB API v3 |

**UI Libraries:** react-player, react-select, react-infinite-scroll-component, react-lazy-load-image-component, react-circular-progressbar, react-icons, dayjs

## Project Structure

```
src/
├── __tests__/               # Integration tests
│   ├── App.integration.test.jsx
│   ├── Details.integration.test.jsx
│   ├── Explore.integration.test.jsx
│   └── SearchResult.integration.test.jsx
├── component/               # Reusable UI components
│   ├── contentwrapper/      # Max-width layout wrapper
│   ├── coursel/             # Horizontal scroll carousel
│   ├── errorBoundary/       # React Error Boundary with retry
│   ├── footer/              # App footer with social links
│   ├── genres/              # Genre tag display
│   ├── header/              # Navigation with search, mobile menu
│   ├── lazyLoadimage/       # Image wrapper with blur effect
│   ├── moviec/              # Movie/TV card component
│   ├── rating/              # Circular progress rating
│   ├── spin/                # Loading spinner
│   ├── switchTabs/          # Animated tab switcher
│   └── videopopup/          # Video player modal
├── hooks/
│   ├── Usefetch.jsx         # Custom data fetching hook with cancellation
│   └── usePageMeta.jsx      # Dynamic document title and meta tags
├── pages/
│   ├── 404/                 # Not found page
│   ├── details/             # Movie/TV details with cast, videos, similar
│   ├── explore/             # Browse with filters + infinite scroll
│   ├── home/                # Hero banner, trending, popular, top rated
│   └── seearchResult/       # Search results with infinite scroll
├── store/
│   ├── homeSlice.js         # Redux slice (API config + genres)
│   └── store.js             # Redux store configuration
├── utils/
│   ├── api.js               # Axios TMDB API wrapper with retry/backoff
│   └── logger.js            # Conditional logger (dev-only console output)
├── App.jsx                  # Root component with routing
└── main.jsx                 # Entry point with Redux Provider
```

## Architecture Decisions

See [DESIGN.md](DESIGN.md) for detailed system design, architecture decisions, and tradeoffs analysis.

## Getting Started

### Prerequisites
- Node.js 16+
- TMDB API token ([get one here](https://www.themoviedb.org/settings/api))

### Installation

```bash
git clone https://github.com/your-username/movix.git
cd movix
npm install
```

### Environment Setup

Create a `.env` file in the project root:

```bash
VITE_APP_TMDB_TOKEN=your_tmdb_bearer_token
```

**Note:** The app validates this token at startup. If missing, it throws a clear error message telling you to set it.

### Development

```bash
npm run dev        # Start dev server (http://localhost:5173)
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

### Testing

```bash
npm test           # Run tests in watch mode
npm run test:run   # Run tests once (CI mode)
```

**Test Coverage: 132 tests across 17 test files**

| Category | Files | Tests | What's Tested |
|----------|-------|-------|---------------|
| Unit - API | 1 | 8 | API calls, params, error throwing, retry on 5xx/429, no retry on 4xx, max retries |
| Unit - Hooks | 2 | 10 | Loading states, success, error, URL changes, cancellation on unmount, page meta |
| Unit - Redux | 1 | 4 | Initial state, reducers, sequential actions |
| Unit - Utilities | 1 | 2 | Conditional logger (dev mode console output) |
| Unit - Components | 7 | 68 | Rating, MovieCard, ErrorBoundary, VideoPopup, Header, SwitchTabs, Genres, Carousel |
| Integration | 4 | 40 | App init, Home page, Search flow, Details page, Explore page, error handling |

## Key Patterns

- **Error Boundary** wrapping route pages — one component crash doesn't kill the app
- **API Retry with Backoff** — retries on 5xx and 429 (rate limit), skips retry on 4xx client errors, max 2 retries with linear delay
- **Request Cancellation** — useFetch cleanup function prevents state updates on unmounted components
- **Environment Validation** — app fails fast with clear error if TMDB token is missing
- **Conditional Logger** — console output only in development mode, replaceable with monitoring service in production
- **Dynamic SEO** — usePageMeta hook sets document title and meta description per route
- **Code Splitting** via React.lazy — each page loads as a separate chunk
- **React.memo** on MovieCard, Rating, Genres, ContentWrapper — prevents unnecessary re-renders
- **useCallback** on Header and Carousel handlers — stable references for event listeners
- **useRef** for Explore filters — avoids module-level mutable state bug
- **Custom useFetch hook** — centralizes loading/error/data states for all API calls
- **Redux** only for truly global state (API config URLs, genre mappings)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build with code splitting |
| `npm run preview` | Preview production build |
| `npm run lint` | Lint with ESLint |
| `npm test` | Run Vitest in watch mode |
| `npm run test:run` | Run Vitest once |
