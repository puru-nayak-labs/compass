/**
 * ─────────────────────────────────────────────────────────────────────────────
 * DataConnector — Layer 1 source abstraction interface (JSDoc contract)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Every data source is accessed through this interface.
 * The KPI Engine (Layer 2 and above) never sees raw source data — it only ever
 * receives a DataSet emitted by a DataConnector implementation.
 *
 * @interface DataConnector
 * @property {string}  id          — Unique connector id: "excel" | "db2" | "snowflake" | "rest" | ...
 * @property {string}  displayName — Human-readable source name
 * @method   load()   → { rows: any[][], headers: string[], fetchedAt: Date, rowCount: number, sourceFile: string }
 * @method   status() → { healthy: boolean, lastFetchedAt: Date|null, rowCount: number, message: string }
 */

"use strict";

const fs   = require("fs");
const path = require("path");

// ─────────────────────────────────────────────────────────────────────────────
// ExcelConnector — implements DataConnector for JSON-dumped Excel workbooks.
//
// Compass ingests Excel via Bob's read_xlsx tool, which converts each sheet
// to a JSON sidecar file with shape { rows: any[][], headers: string[] }.
// ExcelConnector reads these JSON files, validates them, and emits a DataSet.
//
// The platform above Layer 1 never calls fs.readFileSync directly — it always
// calls ExcelConnector.load().  Swapping to Db2Connector, SnowflakeConnector,
// etc. only requires changing the connector instance; the platform code above
// does not change.
// ─────────────────────────────────────────────────────────────────────────────
class ExcelConnector {
  /**
   * @param {object} opts
   * @param {string} opts.dumpDir  — Directory that contains the JSON dump files.
   *                                 Accepts absolute or relative-to-cwd path.
   * @param {string} opts.fileName — JSON dump file name (e.g. "Pipeline_2026_07_11.json")
   * @param {string} [opts.sheet]  — Original sheet name carried as metadata (display only)
   */
  constructor({ dumpDir, fileName, sheet }) {
    this.id          = "excel";
    this.displayName = "Excel / JSON Dump";
    this._dumpDir    = dumpDir;
    this._fileName   = fileName;
    this._sheet      = sheet || fileName;
    this._cache      = null;          // in-memory cache after first load
    this._fetchedAt  = null;
  }

  // ── Resolve the absolute path to the JSON dump file ────────────────────────
  // __dirname here is <project>/connectors — go up one level to project root.
  _resolvePath() {
    const dir = this._dumpDir;
    const root = path.join(__dirname, "..");
    return path.isAbsolute(dir)
      ? path.join(dir, this._fileName)
      : path.join(root, dir, this._fileName);
  }

  /**
   * Load the JSON dump, parse rows + headers, validate schema presence,
   * and return a DataSet object.
   *
   * @returns {{ rows: any[][], headers: string[], fetchedAt: Date,
   *             rowCount: number, sourceFile: string, sheet: string,
   *             checksum: string }}
   */
  load() {
    if (this._cache) return this._cache;          // serve cached DataSet

    const filePath = this._resolvePath();
    if (!fs.existsSync(filePath)) {
      throw new Error(
        `ExcelConnector: dump file not found at "${filePath}". ` +
        `Set DATA_DIR env var to override the default dump directory.`
      );
    }

    let raw;
    try {
      raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (e) {
      throw new Error(`ExcelConnector: failed to parse "${this._fileName}": ${e.message}`);
    }

    if (!Array.isArray(raw.rows) || !Array.isArray(raw.headers)) {
      throw new Error(
        `ExcelConnector: "${this._fileName}" must have { rows: [], headers: [] } shape.`
      );
    }

    this._fetchedAt = new Date();

    this._cache = {
      rows:       raw.rows,
      headers:    raw.headers,
      fetchedAt:  this._fetchedAt,
      rowCount:   raw.rows.length,
      sourceFile: filePath,
      sheet:      this._sheet,
      // Lightweight checksum: row count + header count acts as a quick integrity signal.
      // Full SHA-256 is expensive at startup on 160k rows; this is the determinism guard.
      checksum: `rows=${raw.rows.length};headers=${raw.headers.length}`,
    };

    return this._cache;
  }

  /**
   * Return connection health metadata without triggering a full load.
   * @returns {{ healthy: boolean, lastFetchedAt: Date|null, rowCount: number, message: string }}
   */
  status() {
    const filePath = this._resolvePath();
    const exists   = fs.existsSync(filePath);
    return {
      healthy:       exists,
      lastFetchedAt: this._fetchedAt,
      rowCount:      this._cache ? this._cache.rowCount : null,
      message:       exists
        ? `ExcelConnector: "${this._fileName}" reachable.`
        : `ExcelConnector: dump file not found at "${filePath}".`,
    };
  }
}

module.exports = { ExcelConnector };
