# Hotel Le Process

A modern hotel reservation experience that blends an EJS-powered Node.js frontend with a Spring Boot + PostgreSQL backend. This repository contains the public website, the internal admin console, and the documentation/runbooks used by the team.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Getting Started](#getting-started)
4. [Running the Applications](#running-the-applications)
5. [Verification & QA](#verification--qa)
6. [Admin Platform](#admin-platform)
7. [API Surface](#api-surface)
8. [Documentation Directory](#documentation-directory)
9. [Troubleshooting](#troubleshooting)

## Architecture Overview

| Layer      | Description                                                                                 |
|------------|---------------------------------------------------------------------------------------------|
| Frontend   | Node.js + Express server rendering EJS templates, powering both the guest-facing site and the `/admin/*` screens. Assets live under `public/` with localization strings in `locales/`. |
| Backend    | Spring Boot service exposing booking APIs, room inventory, and admin mutations, persisting data to PostgreSQL.                |
| Integrations | Payment, room availability, and operations handled through the backend API exposed to the frontend/admin clients. |

## Tech Stack

- **Frontend:** Node.js (v14+), Express, EJS, vanilla JS/CSS.
- **Backend:** Java 17+, Spring Boot, PostgreSQL.
- **Tooling:** npm scripts, Maven wrapper, shell utilities in `check_backend.sh`.

## Getting Started

### Prerequisites

- Node.js v14 or newer
- Java 17 or newer
- PostgreSQL (local instance or container)

### Installation

```bash
# install frontend dependencies
npm install

# (optional) ensure Maven wrapper is executable for the backend service
chmod +x Backend-Hotel/mvnw
```

## Running the Applications

### Backend (Spring Boot)

```bash
cd Backend-Hotel
./mvnw spring-boot:run
# API available at http://localhost:8080
```

### Frontend (Express)

```bash
cd Hotel-Website
npm start
# Website available at http://localhost:3000
```

### Quick Health Check

Use the helper script to confirm the backend is online:

```bash
./check_backend.sh
```

It pings the service, attempts a restart if needed, and provides manual remediation steps when automatic recovery fails.

## Verification & QA

1. Start both frontend and backend services.
2. Navigate to `http://localhost:3000/BookNow`.
3. Pick dates and a room type (Standard Single – 20,000 FCFA/night, Premium Single – 25,000 FCFA/night).
4. Complete the guest form and submit the reservation.
5. Confirm the booking summary and verify the backend records the entry.

## Admin Platform

- **Entry point:** `http://localhost:3000/admin/room-types`
- **Purpose:** Manage room-type inventory, pricing, and amenity metadata surfaced to the guest site.
- **Authentication:** Protect these routes behind your preferred middleware (basic auth, session, etc.). Wire up credentials before deploying publicly.
- **Data source:** Pages call the same backend APIs (`/api/admin/bookings`, `/api/room-types`, etc.) via the Express layer.

Quick smoke test:

```bash
# with frontend running
open http://localhost:3000/admin/room-types
```

You should see the management console with loading spinner, followed by room-type cards once the backend responds. Editing actions reuse the bookings/room-type services under `src/services`.

## API Surface

| Scope         | Endpoint                       | Description                |
|---------------|--------------------------------|----------------------------|
| Public        | `POST /api/public/bookings`    | Create a new booking       |
| Admin (auth)  | `GET /api/admin/bookings`      | List bookings              |
|               | `GET /api/admin/bookings/{id}` | Retrieve booking by ID     |
|               | `PUT /api/admin/bookings/{id}` | Update booking             |
|               | `DELETE /api/admin/bookings/{id}` | Remove booking          |

## Documentation Directory

All implementation notes, retrospectives, and runbooks now live in `docs/`. Notable sections:

- `docs/reports/` – feature deep dives (amenities, SEO strategy, booking flows, etc.).
- `docs/architecture/` – diagrams and stack decisions.
- `docs/runbooks/` – deployment and troubleshooting procedures.

## Troubleshooting

### CORS

1. Inspect the backend CORS config (`WebConfig.java`).
2. Verify frontend API URLs (see `src/js/confirmation.js` or equivalent fetch logic).
3. Align `.env` origins with running hosts.

### Database

1. Confirm PostgreSQL is running locally.
2. Validate credentials in `application.yml`.
3. Ensure the `hotel_db` schema exists (and apply migrations if applicable).

### Frontend Build/Start Issues

- Reinstall dependencies with `npm ci` if `node_modules` becomes inconsistent.
- Clear any conflicting processes on port 3000 (`lsof -i :3000`).

---

Questions or improvements? Open an issue or contribute via pull request.
