# ads-backend

Express + MongoDB backend for the Ads Management system.

## Requirements

- Node.js 18+ (recommended: latest LTS)
- MongoDB connection string

## Setup

1. Install deps:
   - `npm install`
2. Create `.env` (see `.env.example`)
3. Run:
   - Dev: `npm run dev`
   - Prod: `npm start`

Server runs on `http://localhost:5000` by default.

## API

- Health: `GET /api/v1/health`
- Auth:
  - `POST /api/v1/auth/register` (multipart/form-data, optional `logo` file)
  - `POST /api/v1/auth/login`

