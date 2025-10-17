// utils/parseFile.js
const csv = require('csv-parser');
const { Readable } = require('stream');
const XLSX = require('xlsx');

/**
 * Accepts buffer and mimetype/filename and returns Promise<items[]>
 * Each item: { firstName, phone, notes, originalRow }
 */

function bufferToStream(buffer) {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

function normalizeHeader(h) {
  return String(h || '').trim().toLowerCase();
}

// Parse csv buffer
function parseCSVBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = bufferToStream(buffer);
    stream
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
}

// Parse xlsx buffer
function parseXLSXBuffer(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  return json;
}

/**
 * Main exported parser.
 * Validates that headers include FirstName, Phone, Notes (case-insensitive).
 */
async function parseFileBuffer(buffer, filename = 'file') {
  const lower = filename.toLowerCase();
  let rows = [];
  if (lower.endsWith('.csv')) {
    rows = await parseCSVBuffer(buffer);
  } else if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) {
    rows = parseXLSXBuffer(buffer);
  } else {
    throw new Error('Unsupported file type');
  }

  if (!Array.isArray(rows)) throw new Error('Could not parse file');

  // Validate headers keys
  if (rows.length === 0) {
    // still allow empty CSV (return empty array)
    return [];
  }

  // Check that at least headers mapping exists
  const headerKeys = Object.keys(rows[0]).map(k => normalizeHeader(k));

  const hasFirstName = headerKeys.includes('firstname') || headerKeys.includes('first name') || headerKeys.includes('first_name');
  const hasPhone = headerKeys.includes('phone') || headerKeys.includes('mobile') || headerKeys.includes('phone number') || headerKeys.includes('phone_number');
  const hasNotes = headerKeys.includes('notes') || headerKeys.includes('note');

  if (!(hasFirstName && hasPhone && hasNotes)) {
    throw new Error('CSV/XLSX must include headers: FirstName, Phone, Notes (case-insensitive). Found: ' + headerKeys.join(', '));
  }

  // Map rows to canonical format
  const items = rows.map((r, idx) => {
    // find keys case-insensitively
    const kv = {};
    for (const k of Object.keys(r)) {
      kv[normalizeHeader(k)] = r[k];
    }
    const firstName = kv['firstname'] ?? kv['first name'] ?? kv['first_name'] ?? '';
    const phone = kv['phone'] ?? kv['mobile'] ?? kv['phone number'] ?? kv['phone_number'] ?? '';
    const notes = kv['notes'] ?? kv['note'] ?? '';

    return {
      firstName: String(firstName).trim(),
      phone: String(phone).trim(),
      notes: String(notes).trim(),
      originalRow: r,
      __rowIndex: idx + 1
    };
  });

  return items;
}

module.exports = { parseFileBuffer };