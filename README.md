# 🧾 Invoice Tracker 

> AI-powered invoice parsing and tracking system for Indian businesses — with automatic TDS classification, Excel export, and a modern web dashboard.

---

## 📸 Overview

Invoice Tracker  is a full-stack application that uses a **local AI model (LM Studio + Qwen2.5-VL-7B)** to automatically extract data from PDF invoices — both digital and scanned — and store them in a structured Excel tracker. It applies Indian TDS rules automatically, supports batch uploads, and provides a clean Next.js dashboard for managing invoices.

---

## ⚡ Performance (v2 vs original)

| Invoice Type | Before | After |
|---|---|---|
| Digital PDF (text-selectable) | 2–5 min | **1–5 sec** |
| Scanned PDF (image-based) | 2–5 min | **30–60 sec** |

### What was optimised
- **Regex-first TDS** — ~70% of invoices get TDS decided instantly without AI
- **TDS rules cache** — rules fetched once every 5 min, not on every upload
- **Parallel warmup** — TDS cache warms while PDF text is being extracted
- **Fewer tokens** — AI gets 250 tokens max (was 400), TDS reply 60 (was 80)
- **Smaller images** — scanned PDF pages compressed to 380px / quality-65
- **Page 1 only** — scanned PDFs now process only first page (was 2 pages)
- **Faster timeout** — LM Studio fails at 120s instead of hanging for 10 min

---

## 🏗️ Architecture

```
invoice_tracker/
├── api.py                  # FastAPI backend (port 8000) — main invoice API
├── tds_api_server.py       # Flask TDS rules API (port 5000)
├── invoice_tracker.py      # CLI version of invoice tracker
├── tds_rules.txt           # Indian TDS rules reference file
├── tds_rules.db            # SQLite DB for TDS rules with versioning
├── requirements.txt        # Python dependencies
└── frontend/               # Next.js 14 web dashboard (port 3000)
    ├── src/
    │   ├── app/
    │   │   ├── page.jsx        # Dashboard / home
    │   │   ├── add/            # Upload & extract invoice
    │   │   ├── batch/          # Batch upload multiple invoices
    │   │   ├── search/         # Search invoices
    │   │   ├── update/         # Edit invoice records
    │   │   ├── delete/         # Delete invoice records
    │   │   ├── summary/        # Monthly summary
    │   │   └── vendor/         # Vendor payment history
    │   ├── components/
    │   │   ├── UI.jsx          # Shared UI components
    │   │   └── Sidebar.jsx     # Navigation sidebar
    │   └── lib/
    │       └── api.js          # Axios API client
    └── package.json
```

### Service Map

```
Browser (port 3000)
    │
    ▼
Next.js Frontend
    │
    ▼
FastAPI Backend (port 8000) ──► LM Studio (port 1234) ← Qwen2.5-VL-7B model
    │
    ├──► TDS Rules API (port 5000) ← SQLite DB
    │
    └──► invoice_tracker.xlsx  (Excel output)
```

---

## 🔧 Prerequisites

| Tool | Purpose | Download |
|---|---|---|
| Python 3.9+ | Backend runtime | [python.org](https://python.org) |
| Node.js 18+ | Frontend runtime | [nodejs.org](https://nodejs.org) |
| LM Studio | Local AI model host | [lmstudio.ai](https://lmstudio.ai) |
| Poppler | PDF-to-image conversion | [GitHub Releases](https://github.com/oschwartz10612/poppler-windows/releases) |

### LM Studio Setup
1. Download and install LM Studio
2. Search for and download **`qwen/qwen2.5-vl-7b`**
3. Start the local server at `http://127.0.0.1:1234`

### Poppler Setup (Windows)
1. Download Poppler for Windows from the link above
2. Extract to a folder (e.g. `C:\poppler\`)
3. Update the path in `api.py`:
```python
POPPLER_PATH = r"C:\path\to\your\poppler\Library\bin"
```

---

## 🚀 Installation

### 1. Clone the repository
```bash
git clone https://github.com/Chowdarysaritha311/Invoice-parser.git
cd Invoice-parser
```

### 2. Install Python dependencies
```bash
pip install -r requirements.txt
```

### 3. Install frontend dependencies
```bash
cd frontend
npm install
cd ..
```

---

## ▶️ Running the Application

Open **3 separate terminals** in VS Code (or any terminal):

### Terminal 1 — TDS Rules API (port 5000)
```bash
python tds_api_server.py
```

### Terminal 2 — Invoice API (port 8000)
```bash
python api.py
```

### Terminal 3 — Frontend (port 3000)
```bash
cd frontend
npm run dev
```

Then open **http://localhost:3000** in your browser.

---

## 🌐 API Reference

Base URL: `http://localhost:8000`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Check LM Studio & TDS API status |
| `POST` | `/invoice/extract` | Upload PDF and extract invoice data |
| `POST` | `/invoice/save` | Save extracted invoice to Excel |
| `POST` | `/invoice/batch` | Batch upload multiple PDFs |
| `GET` | `/invoice/all` | Get all invoices |
| `GET` | `/invoice/search?q=&field=` | Search invoices |
| `PUT` | `/invoice/update` | Update an invoice record |
| `DELETE` | `/invoice/delete/{row}` | Delete an invoice by row number |
| `GET` | `/invoice/summary/{month}/{year}` | Monthly summary |
| `GET` | `/invoice/vendor/{name}` | Vendor payment history |
| `GET` | `/invoice/download` | Download the Excel tracker |

### TDS Rules API (port 5000)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/tds-rules` | Get active TDS rules |
| `POST` | `/tds-rules/update` | Update TDS rules |
| `GET` | `/tds-rules/history` | View all rule versions |
| `GET` | `/health` | Check server status |

---

## 📊 Excel Tracker Columns

The generated `invoice_tracker.xlsx` includes 32 columns:

`SI No` · `Week` · `Month Name` · `Year` · `ID` · `Invoice/PI` · `Invoice Date` · `Due Date` · `Project Name` · `Owner` · `Category` · `Vendor ID` · `Vendor Name` · `TDS` · `Invoice Number` · `INV_SaveCopy` · `Inv_Amt` · `Amount Paid/To be Paid` · `Partial Paid Amount` · `Payment Status` · `Paid From` · `Payment Date` · `GST Inputs Received` · `Material Received Date` · `Material Received Status` · `Base Amount` · `SGST` · `CGST` · `IGST` · `TDS Payment Date` · `TDS Done` · `Comments`

---

## 🇮🇳 TDS Classification Logic

The system uses a **two-tier TDS decision engine**:

**Tier 1 — Regex (instant, ~70% of invoices)**
Pattern-matches vendor name, category, and HSN code against known rules to decide TDS without calling the AI model.

**Tier 2 — AI fallback**
For ambiguous cases, the Qwen model reads the TDS rules and makes a decision based on invoice context.

### Key TDS Rules Applied
- **194C** — Contractor payments (transport, security, manpower, labour): 1% Individual / 2% Company
- **194J** — Professional services (IT, consulting, legal, accounting): 10% professional / 2% technical
- **No TDS** — Vendor supplies materials + work (product purchase), GST payments, reimbursements

---

## 🖥️ Dashboard Features

| Page | Feature |
|---|---|
| **Dashboard** | System health status, total invoices, total amount, pending payments, recent invoices |
| **Add Invoice** | Upload PDF → AI extraction → review → save to Excel |
| **Batch Upload** | Upload multiple PDFs at once |
| **Search** | Search by any field (vendor, invoice number, date, etc.) |
| **Update** | Edit any invoice record |
| **Delete** | Remove invoice records |
| **Summary** | Month-wise financial summary |
| **Vendor** | Per-vendor payment history |

---

## 🛠️ Tech Stack

**Backend**
- [FastAPI](https://fastapi.tiangolo.com/) — REST API
- [Flask](https://flask.palletsprojects.com/) — TDS rules microservice
- [pdfplumber](https://github.com/jsvine/pdfplumber) — Digital PDF text extraction
- [pdf2image](https://github.com/Belval/pdf2image) + [Pillow](https://python-pillow.org/) — Scanned PDF image conversion
- [openpyxl](https://openpyxl.readthedocs.io/) — Excel read/write
- [SQLite](https://www.sqlite.org/) — TDS rules versioned storage

**Frontend**
- [Next.js 14](https://nextjs.org/) — React framework
- [Tailwind CSS](https://tailwindcss.com/) — Styling
- [Axios](https://axios-http.com/) — API client
- [React Hook Form](https://react-hook-form.com/) — Form handling
- [Zustand](https://zustand-demo.pmnd.rs/) — State management
- [Lucide React](https://lucide.dev/) — Icons
- [React Hot Toast](https://react-hot-toast.com/) — Notifications

**AI**
- [LM Studio](https://lmstudio.ai/) — Local model host
- [Qwen2.5-VL-7B](https://huggingface.co/Qwen/Qwen2.5-VL-7B) — Vision-language model for invoice parsing

---

## 📁 Data Storage

| File | Contents |
|---|---|
| `invoice_tracker.xlsx` | All invoice records (auto-created on first save) |
| `tds_rules.db` | SQLite database with versioned TDS rules |
| `uploads/` | Uploaded PDF files (auto-created) |
| `invoice_pages/` | Converted PDF page images for scanned PDFs (auto-created) |

---

## 🔒 Notes

- All data is stored **locally** — no cloud services involved
- The AI model runs **locally** via LM Studio — no data is sent externally
- `.env` files and `node_modules` are excluded from the repository via `.gitignore`
- For production use, restrict CORS in `api.py` (currently set to `allow_origins=["*"]`)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is for internal business use. All rights reserved.

---

*Built with ❤️ for streamlined Indian invoice management*
