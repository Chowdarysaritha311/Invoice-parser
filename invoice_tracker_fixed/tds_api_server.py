import os, sqlite3, datetime
from flask import Flask, jsonify, request

app      = Flask(__name__)
DB_PATH  = os.path.join(os.path.dirname(__file__), 'tds_rules.db')
TXT_FILE = os.path.join(os.path.dirname(__file__), 'tds_rules.txt')


def init_db():
    conn = sqlite3.connect(DB_PATH)
    c    = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS rules (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        version    TEXT,
        rules_text TEXT,
        updated_by TEXT,
        updated_at TEXT,
        is_active  INTEGER DEFAULT 1
    )''')
    conn.commit()
    c.execute('SELECT COUNT(*) FROM rules')
    if c.fetchone()[0] == 0 and os.path.exists(TXT_FILE):
        text = open(TXT_FILE, encoding='utf-8').read()
        c.execute('INSERT INTO rules VALUES (null,?,?,?,?,1)',
                  ('v1.0', text, 'system', datetime.datetime.now().isoformat()))
        conn.commit()
        print('Rules loaded from tds_rules.txt')
    conn.close()


@app.route('/tds-rules', methods=['GET'])
def get_rules():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    row  = conn.execute('SELECT * FROM rules WHERE is_active=1 ORDER BY id DESC LIMIT 1').fetchone()
    conn.close()
    if not row:
        return jsonify({'status': 'error', 'message': 'No rules found'}), 404
    return jsonify({'status': 'success', 'version': row['version'], 'rules': row['rules_text'],
                    'updated_by': row['updated_by'], 'updated_at': row['updated_at']})


@app.route('/tds-rules/update', methods=['POST'])
def update_rules():
    data = request.get_json()
    if not data or 'rules_text' not in data:
        return jsonify({'status': 'error', 'message': 'rules_text required'}), 400
    conn = sqlite3.connect(DB_PATH)
    c    = conn.cursor()
    c.execute('UPDATE rules SET is_active=0')
    c.execute('INSERT INTO rules VALUES (null,?,?,?,?,1)',
              (data.get('version','v1.0'), data['rules_text'],
               data.get('updated_by','unknown'), datetime.datetime.now().isoformat()))
    conn.commit()
    conn.close()
    return jsonify({'status': 'success', 'message': 'Rules updated'})


@app.route('/tds-rules/history', methods=['GET'])
def history():
    conn  = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    rows  = conn.execute('SELECT id,version,updated_by,updated_at,is_active FROM rules ORDER BY id DESC').fetchall()
    conn.close()
    return jsonify({'status': 'success', 'history': [dict(r) for r in rows]})


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'running'})


if __name__ == '__main__':
    print('TDS Rules API Server')
    print('=' * 30)
    init_db()
    print('Running at http://localhost:5000')
    print('Keep this window open while using invoice_tracker.py')
    app.run(host='localhost', port=5000, debug=False)
