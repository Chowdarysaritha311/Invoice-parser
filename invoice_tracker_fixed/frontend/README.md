# Invoice Tracker — Frontend

Professional Next.js dashboard for the Invoice Tracker AI system.

## Prerequisites

Make sure these are running before starting the frontend:

1. **LM Studio** — open and load `qwen/qwen2.5-vl-7b`, start the local server
2. **TDS API Server** — `python tds_api_server.py` (runs on port 5000)
3. **FastAPI Backend** — `python api.py` (runs on port 8000)

## Setup

```bash
# Go into frontend folder
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Open browser at: **http://localhost:3000**

## Pages

| Page | URL | Description |
|------|-----|-------------|
| Dashboard | / | System status + recent invoices |
| Add Invoice | /add | Upload single PDF + AI extraction |
| Batch Upload | /batch | Process multiple PDFs automatically |
| Search | /search | Find invoices by any field |
| Update | /update | Edit saved invoice fields |
| Delete | /delete | Remove invoices |
| Monthly Summary | /summary | Totals and pending for any month |
| Vendor History | /vendor | All invoices for a vendor |

## Running All 3 Servers

Open 3 CMD windows:

```
CMD 1: python tds_api_server.py
CMD 2: python api.py
CMD 3: cd frontend && npm run dev
```

Then open http://localhost:3000
