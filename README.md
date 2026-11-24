# Community Seed & Plant Swap API

REST API for a community plant and seed swap. Listings can be offered as a **swap**, given away for **free**, or **sold**. Local gardeners are managed as a second resource.

Built with Node.js and Express 5. Data lives in memory (JavaScript arrays), so it resets when the server restarts.

## Student

| | |
| --- | --- |
| **Name** | Syifa Nurul Fadilah |
| **NIM** | `20250040087` |
| **Theme** | Community Seed & Plant Swap |

## Project structure

```text
midterm-20250040087-syifa/
├── index.js                 # App entry: routes, middleware, port 3000
├── handler/
│   └── middleware.js        # Logger, auth, 404, and error handler
├── routes/
│   ├── plants.js            # Plant listing routes and seed data
│   └── gardeners.js         # Gardener routes and seed data
├── screenshots/
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Requirements

- [Node.js](https://nodejs.org/) 18 or newer (needed for `--env-file`)

## How to run

Install dependencies:

```bash
npm install
```

Copy the example env file and set your token:

```bash
cp .env.example .env
```

`.env` only needs `VALID_TOKEN`. If the variable is missing, the server falls back to `dev-token-123`. The API always listens on port **3000**.

Start the server with auto-reload:

```bash
npm run dev
```

Or start it once:

```bash
npm start
```

The API is at [http://localhost:3000](http://localhost:3000).

## Authentication

`DELETE` routes require a token. Send it with either header:

```http
x-api-token: your-secret-token-here
```

```http
Authorization: Bearer your-secret-token-here
```

A missing or wrong token returns **401**.

## Error format

Failed requests return JSON:

```json
{
  "success": false,
  "error": {
    "code": 400,
    "message": "commonName should be filled."
  }
}
```

| Status | When |
| --- | --- |
| 400 | Request body fails validation |
| 401 | Delete without a valid token |
| 404 | Unknown route, or a plant / gardener id that does not exist |
| 500 | Unexpected server error |

## API routes

### General

| Method | Path | Description | Success |
| --- | --- | --- | --- |
| GET | `/` | Welcome message with author and theme | 200 |
| GET | `/files/*path` | Splits the path into segments | 200 |

`GET /files/seeds/kale/2026` returns:

```json
{
  "path": ["seeds", "kale", "2026"],
  "totalSegments": 3
}
```

### Plants — `/plants`

| Method | Path | Description | Success |
| --- | --- | --- | --- |
| GET | `/plants` | List every plant | 200 |
| GET | `/plants/category` | Same as the full list | 200 |
| GET | `/plants/category/:name` | Filter by category, light needs, or listing type | 200 |
| GET | `/plants/search?q=&listingType=` | Search by name and/or listing type | 200 |
| GET | `/plants/:id` | Get one plant | 200 |
| POST | `/plants` | Add a plant (id is generated) | 201 |
| PUT | `/plants/:id` | Replace a plant's fields | 200 |
| DELETE | `/plants/:id` | Delete a plant (token required) | 200 |

**Plant body**

| Field | Required | Notes |
| --- | --- | --- |
| `commonName` | yes | Trimmed string |
| `category` | yes | Stored in lowercase |
| `lightNeeds` | yes | Stored in lowercase |
| `availableCount` | yes | Number, `0` or greater |
| `containerType` | no | Defaults to `polybag` |
| `listingType` | no | `swap` (default), `free`, or `sell` |
| `price` | when selling | Number greater than `0` if `listingType` is `sell`. Otherwise stored as `0` |

```bash
curl -X POST http://localhost:3000/plants \
  -H "Content-Type: application/json" \
  -d '{
    "commonName": "Basil",
    "category": "herb",
    "lightNeeds": "full-sun",
    "availableCount": 5,
    "containerType": "pot",
    "listingType": "swap"
  }'
```

Category filter matches `category`, `lightNeeds`, or `listingType` (case-insensitive):

```bash
curl http://localhost:3000/plants/category/herb
curl "http://localhost:3000/plants/search?q=mint&listingType=swap"
```

### Gardeners — `/gardeners`

| Method | Path | Description | Success |
| --- | --- | --- | --- |
| GET | `/gardeners` | List every gardener | 200 |
| GET | `/gardeners/:id` | Get one gardener | 200 |
| POST | `/gardeners` | Add a gardener (id is generated) | 201 |
| PUT | `/gardeners/:id` | Replace a gardener's fields | 200 |
| DELETE | `/gardeners/:id` | Delete a gardener (token required) | 200 |

**Gardener body**

| Field | Required | Notes |
| --- | --- | --- |
| `name` | yes | Trimmed string |
| `area` | yes | Trimmed string |
| `specialty` | yes | Stored in lowercase |
| `experienceYears` | yes | Number, `0` or greater |
| `openForSwap` | no | Boolean. Defaults to `true` on create |

```bash
curl -X POST http://localhost:3000/gardeners \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Lina Putri",
    "area": "Cikole",
    "experienceYears": 3,
    "specialty": "herbs",
    "openForSwap": true
  }'
```

Delete example:

```bash
curl -X DELETE http://localhost:3000/gardeners/1 \
  -H "x-api-token: your-secret-token-here"
```

## Notes

- IDs start at `1`. New records continue from `6` because five plants and five gardeners are seeded on startup.
- Lists respond with `{ "total": number, "data": [...] }`. A single record responds with `{ "data": { ... } }`.
- There is no database. Restarting the process restores the original seed data.
