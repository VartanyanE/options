# Cash Flow Strategist

A mobile-first options trading journal for measuring strategy performance and tracking active positions.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/license/isc-license-txt)

## Overview

Cash Flow Strategist brings two focused workflows into one responsive application:

- **Profit Factor** records individual trade results and groups them by strategy.
- **Options Tracker** stores active positions and refreshes underlying prices through Finnhub.

The interface is designed mobile-first and keeps journal data in browser storage, so entries remain available after a refresh without requiring a database.

## Features

### Strategy performance

- Record a strategy name and the profit or loss for each trade.
- Automatically group trades with the same strategy name.
- Track total trades, wins, losses, and win rate.
- Calculate profit factor from gross winning and losing trades.
- Display total strategy P/L in green for profits and red for losses.
- Delete a strategy and all of its recorded trades.

### Options tracking

- Save ticker, strike, breakeven, expiration, premium, and contract count.
- Edit or delete existing positions.
- Refresh current underlying prices through the backend.
- Display price movement and position status indicators.
- Retain positions in browser storage between sessions.

## Calculations

Profit factor measures how much gross profit a strategy produces for every dollar of gross loss:

```text
Profit Factor = Gross Winning Trades / |Gross Losing Trades|
```

For example, if a strategy produces `$900` in winning trades and `$300` in losing trades, its profit factor is `3.00`.

Total P/L is the net result of every recorded trade in the strategy:

```text
Total P/L = Sum of All Trade Profits and Losses
```

## Technology

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, React Router, Framer Motion, Axios |
| Backend | Node.js, Express, Axios, dotenv |
| Market data | Finnhub |
| Optional API routes | OpenAI, Polygon, Yahoo Finance |
| Persistence | Browser `localStorage` |

## Project structure

```text
options/
├── backend/
│   ├── server.js          # Express server and external API routes
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProfitFactor.js
│   │   │   ├── OptionTracker.js
│   │   │   └── OptionCard.js
│   │   ├── App.js
│   │   └── config.js
│   └── package.json
└── README.md
```

## Getting started

### Prerequisites

- Node.js 20 or newer
- npm
- A Finnhub API key for live stock prices

### 1. Clone the repository

```bash
git clone https://github.com/VartanyanE/options.git
cd options
```

### 2. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 3. Configure the backend

Create `backend/.env`:

```dotenv
FINNHUB_API_KEY=your_finnhub_api_key
POLYGON_API_KEY=your_polygon_api_key
OPENAI_API_KEY=your_openai_api_key
NODE_ENV=development
PORT=5050
```

| Variable | Purpose | Required |
| --- | --- | --- |
| `FINNHUB_API_KEY` | Refreshes stock prices in Options Tracker | Yes for live prices |
| `POLYGON_API_KEY` | Supports the news API routes | Only for those routes |
| `OPENAI_API_KEY` | Supports the AI analysis API route | Only for that route |
| `NODE_ENV` | Use `development` locally or `production` when serving a build | No |
| `PORT` | Backend port; defaults to `5050` | No |

> Never commit `.env` or expose production API keys. Environment files are excluded by the repository's `.gitignore`.

### 4. Start the backend

From `backend/`:

```bash
npm start
```

The API starts at `http://localhost:5050`.

### 5. Start the frontend

In a second terminal, from `frontend/`:

```bash
npm start
```

The app opens at `http://localhost:3000` and proxies local API requests to port `5050`.

## Production build

Build the React frontend:

```bash
cd frontend
npm run build
```

To serve the compiled frontend from Express, set `NODE_ENV=production` and start the backend:

```bash
cd ../backend
npm start
```

## Available scripts

### Frontend

| Command | Description |
| --- | --- |
| `npm start` | Starts the React development server |
| `npm run build` | Creates an optimized production build |
| `npm test` | Runs the frontend test runner |

### Backend

| Command | Description |
| --- | --- |
| `npm start` | Starts the Express server |
| `npm run build` | Installs frontend packages and creates a production build |

## Data and privacy

Strategy results and tracked options are stored in the current browser's `localStorage`. They are not synchronized between browsers or devices and will be removed if the site's browser data is cleared.

API credentials remain on the backend and should never be embedded in frontend code.

## Roadmap ideas

- Edit or remove individual trade results.
- Add trade dates, notes, and strategy tags.
- Chart strategy performance over time.
- Import and export journal data as CSV.
- Add authenticated cloud synchronization.
- Expand automated frontend tests.

## Contributing

1. Create a branch from `main`.
2. Make a focused change.
3. Run the relevant build and tests.
4. Open a pull request describing the change and validation performed.

## License

This project is available under the ISC License.
