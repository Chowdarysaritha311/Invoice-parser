# Invoice Tracker — Quick Start

## One-time setup

```powershell
pip install -r requirements.txt
cd frontend && npm install && cd ..
```

## Every time — open 3 terminals in VS Code

### Terminal 1 — TDS Rules API (port 5000)
```powershell
python tds_api_server.py
```

### Terminal 2 — Invoice API (port 8000)
```powershell
python api.py
```

### Terminal 3 — Frontend (port 3000)
```powershell
cd frontend
npm run dev
```

Open **http://localhost:3000**

---

## Performance (after fixes)

| Invoice type     | Before    | After       |
|-----------------|-----------|-------------|
| Digital PDF (text selectable) | 2–5 min | **1–5 sec** |
| Scanned PDF (image)           | 2–5 min | **30–60 sec** |

### What was fixed
1. **Regex-first TDS** — ~70% of invoices get TDS decided instantly without AI
2. **TDS rules cache** — rules fetched once every 5 min, not on every upload
3. **Parallel warmup** — TDS cache warms while PDF text is being extracted
4. **Fewer tokens** — AI gets 250 tokens max (was 400), TDS reply 60 (was 80)
5. **Smaller images** — scanned PDF pages compressed to 380px/quality-65
6. **Page 1 only** — scanned PDFs now process only first page (was 2)
7. **Faster timeout** — LM Studio fails at 120s instead of hanging 10 min

### Poppler path
If you move poppler, update line in api.py:
```python
POPPLER_PATH = r"C:\Users\chowd\Downloads\Release-25.12.0-0\poppler-25.12.0\Library\bin"
```
