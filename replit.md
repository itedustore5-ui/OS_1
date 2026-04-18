# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Artifacts

### IT Quiz App (`artifacts/quiz-app`)
- React + Vite SPA deployed at `/`
- All 50 questions (52–101) from the IT Systems Administration script
- User authentication with username/password (stored in localStorage)
- Admin panel for user management and result viewing
- Scoreboard with rankings
- Questions 70, 77, 87, 90, 93, 94 have image placeholders (upload images to `public/images/`)
- Default admin: username `admin`, password `Admin2024!`
- Default student: username `student1`, password `kviz2024`
- Users with `neverExpires: true` never lose access
- All data stored in localStorage (no backend required, works as static site on Vercel)

### API Server (`artifacts/api-server`)
- Express 5 API server at `/api`

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
