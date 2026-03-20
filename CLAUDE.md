# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DeFi Frontend is an Angular 21 application for monitoring DeFi (Decentralized Finance) positions. It tracks Aave lending/borrowing positions and cross-chain transfers via LI.FI, with MetaMask wallet authentication.

## Common Commands

- **Dev server:** `yarn start` (serves at http://localhost:4200, uses development environment config)
- **Build:** `yarn build` (production build to `dist/defi-frontend/`)
- **Test:** `yarn test` (Karma + Jasmine)
- **Generate component:** `ng generate component <name>` (uses SCSS by default)

Package manager is **yarn** (see `yarn.lock`).

## Architecture

### Authentication Flow
MetaMask wallet-based auth via `AuthService`. Flow: detect MetaMask provider → request account access → get nonce from backend → sign nonce → verify signature → receive JWT. Token stored in `localStorage` as `JWT_Token`, address as `User_Address`.

### HTTP Layer
`BaseUrlInterceptor` prepends `environment.apiUrl` to relative URLs and attaches JWT Bearer token. Absolute URLs (starting with `http`) bypass the interceptor — this is how direct API calls (e.g., Aave GraphQL, LI.FI) avoid the base URL.

### Data Sources
- **Backend API** (`environment.apiUrl` = `https://defidb.online/api`): Aave market history, transactions, market status, user accounts. Dev environment can point to `http://localhost:3000`.
- **Aave GraphQL API** (`https://api.v3.aave.com/graphql`): Market reserves, user supplies/borrows. Accessed via Apollo Angular client configured in `app.config.ts`.
- **LI.FI API** (`https://li.quest`): Cross-chain transfer data. Called directly via `HttpClient` in `LifiService` (bypasses base URL interceptor).

### Key Services
- `AaveMarketService` — fetches market data from both the backend REST API and Aave GraphQL. Contains Bollinger Band scenario calculations for health factor risk assessment.
- `HistoricalPriceDataService` — provides historical price data and Bollinger Band calculations for reserves.
- `LifiService` — queries LI.FI API for chain info and wallet transfer history.
- `AccountService` — CRUD operations for user wallet accounts (GET, POST, DELETE via backend REST API).
- `AuthService` — MetaMask sign-in, JWT management, logout events via RxJS Subjects.

### Routes
- `/aave` — Aave market dashboard (default route)
- `/pnl` — DeFi PnL (Profit & Loss) view
- `/config` — User configuration page (wallet account management)

### UI Framework
PrimeNG (v21) with Aura theme preset. Charts use ECharts via `ngx-echarts` (tree-shaken imports in `AppComponent`).

### Component Style
All components are **standalone** (no NgModules). SCSS for styling. TypeScript strict mode enabled.

## Deployment

Multi-stage Docker build: Node 20 Alpine builds the app, nginx Alpine serves it. Kubernetes deployment config in `k8s/deployment.yaml`.
