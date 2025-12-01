import XLSX from "xlsx";
import path from "path";

export default class RefugoServices {
  monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  // Excel serial date -> YYYY-MM-DD
  excelDateToJSDate = (serial: number): string | null => {
    if (serial == null || isNaN(serial) || serial < 0) return null;
    const base = new Date(1899, 11, 30);
    const date = new Date(base.getTime() + serial * 86400000);
    return isNaN(date.getTime()) ? null : date.toISOString().split("T")[0];
  };

  // Parse a variety of date cell representations:
  // - Excel serial (number)
  // - JS Date object
  // - string "YYYY-MM-DD" or "DD/MM/YYYY"
  parseCellDateToISO = (cellVal: any): string | null => {
    if (cellVal == null) return null;
    if (cellVal instanceof Date) {
      if (isNaN(cellVal.getTime())) return null;
      return cellVal.toISOString().split("T")[0];
    }
    if (typeof cellVal === "number") {
      return this.excelDateToJSDate(cellVal);
    }
    if (typeof cellVal === "string") {
      const s = cellVal.trim();
      // If already ISO-ish
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
      // If dd/mm/yyyy
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
        const [d, m, y] = s.split("/");
        const dd = d.padStart(2, "0");
        const mm = m.padStart(2, "0");
        return `${y}-${mm}-${dd}`;
      }
      // Fallback: try Date parse
      const dt = new Date(s);
      if (!isNaN(dt.getTime())) return dt.toISOString().split("T")[0];
    }
    return null;
  };

  // Parse numbers tolerant of "1.234,56" or "1234.56"
  parseNumber = (v: any): number => {
    if (v == null || v === "") return 0;
    if (typeof v === "number") return v;
    if (typeof v === "string") {
      const s = v.trim();
      // If contains both . and , assume . thousands and , decimal (pt-BR)
      if (s.indexOf(".") > -1 && s.indexOf(",") > -1) {
        const withoutThousands = s.replace(/\./g, "");
        const normalized = withoutThousands.replace(",", ".");
        const n = parseFloat(normalized);
        return isNaN(n) ? 0 : n;
      }
      // If contains only comma, treat as decimal
      if (s.indexOf(",") > -1 && s.indexOf(".") === -1) {
        const normalized = s.replace(",", ".");
        const n = parseFloat(normalized);
        return isNaN(n) ? 0 : n;
      }
      // Otherwise parse normally
      const n = parseFloat(s.replace(/,/g, ""));
      return isNaN(n) ? 0 : n;
    }
    return 0;
  };

  // Trim keys on a row so " KG_TT " => "KG_TT".
  normalizeRowKeys = (row: Record<string, any>): Record<string, any> => {
    const normalized: Record<string, any> = {};
    for (const k of Object.keys(row)) {
      const trimmed = k == null ? k : String(k).trim();
      normalized[trimmed] = row[k];
    }
    return normalized;
  };

  async getRefugo() {
    try {
      const file = path.join(
        "C:/Arquivos Fundnova/INDUSTRIAL/Pública/REFUGO/_REFUGO.xlsm"
      );

      const wb = XLSX.readFile(file);

      // support both names for production sheet
      const refugoSheet = wb.Sheets["BD_REFUGO"];
      const producaoSheet = wb.Sheets["BD_PRODUÇÃO"] || wb.Sheets["BD_PRODUCAO"];

      if (!refugoSheet) throw new Error("Sheet BD_REFUGO not found");
      if (!producaoSheet) throw new Error("Sheet BD_PRODUÇÃO / BD_PRODUCAO not found");

      // Read each sheet only once. Use defval: null so we can detect missing cells.
      const refugoRowsRaw = XLSX.utils.sheet_to_json(refugoSheet, { defval: null });
      const producaoRowsRaw = XLSX.utils.sheet_to_json(producaoSheet, { defval: null });

      const map = new Map<string, {
        year: number; month: string; day: number;
        kg: number; qt: number; produzidoKg: number; produzidoQt: number;
      }>();

      const makeKey = (y: number, m: string, d: number) => `${y}-${m}-${d}`;

      // Process REFUGO sheet (kg + qt)
      for (const rawRow of (refugoRowsRaw as any[])) {
        if (!rawRow) continue;
        const row = this.normalizeRowKeys(rawRow);

        // Try common date column names: "DT_FUSÃO" is expected
        const dateIso = this.parseCellDateToISO(row["DT_FUSÃO"] ?? row["DT_FUSAO"] ?? row["DATA"]);
        if (!dateIso) continue;

        const [yearStr, monthStr, dayStr] = dateIso.split("-");
        const year = parseInt(yearStr, 10);
        const month = this.monthNames[parseInt(monthStr, 10) - 1];
        const day = parseInt(dayStr, 10);

        const k = makeKey(year, month, day);
        if (!map.has(k)) {
          map.set(k, { year, month, day, kg: 0, qt: 0, produzidoKg: 0, produzidoQt: 0 });
        }

        const item = map.get(k)!;

        // possible column names for refugo kg/qt
        const kgCandidates = ["KG_TT", "KG_TT " , "KG_TT"];
        const qtCandidates = ["QTE_REF", "QTE_REF "];

        // prefer trimmed key names (normalizeRowKeys trimmed them)
        const kgVal = row["KG_TT"] ?? row["KG"] ?? row["KG_TT"];
        const qtVal = row["QTE_REF"] ?? row["QTE_REF"];

        item.kg += this.parseNumber(kgVal);
        item.qt += this.parseNumber(qtVal);
      }

      // Process PRODUCAO sheet (produced kg + produced qt)
      for (const rawRow of (producaoRowsRaw as any[])) {
        if (!rawRow) continue;
        const row = this.normalizeRowKeys(rawRow);

        const dateIso = this.parseCellDateToISO(row["DT_FUSÃO"] ?? row["DT_FUSAO"] ?? row["DATA"]);
        if (!dateIso) continue;

        const [yearStr, monthStr, dayStr] = dateIso.split("-");
        const year = parseInt(yearStr, 10);
        const month = this.monthNames[parseInt(monthStr, 10) - 1];
        const day = parseInt(dayStr, 10);

        const k = makeKey(year, month, day);
        if (!map.has(k)) {
          map.set(k, { year, month, day, kg: 0, qt: 0, produzidoKg: 0, produzidoQt: 0 });
        }

        const item = map.get(k)!;

        // Important: production sheet used " KG_TT " (spaces) in old file,
        // we normalized keys so we access "KG_TT".
        // Also production quantity column likely "QTE_PÇ" — keep both accent and ASCII fallback.
        const producedKgVal = row["KG_TT"] ?? row["KG_TT"] ?? row["KG"] ?? row["KG_TT"];
        const producedQtVal = row["QTE_PÇ"] ?? row["QTE_PC"] ?? row["QTE_PC"] ?? row["QTE_PÇ"];

        item.produzidoKg += this.parseNumber(producedKgVal);
        item.produzidoQt += this.parseNumber(producedQtVal);
      }

      // Final array from map
      const final = Array.from(map.values());

      // Optional: if you want to filter by year like before, uncomment:
      // const filtered = final.filter(e => e.year >= 2025);
      // but I'll return all rows (like faturamento did), then sort.

      final.sort((a, b) => {
        const yearDiff = (b.year ?? 0) - (a.year ?? 0);
        if (yearDiff !== 0) return yearDiff;
        const monthDiff = this.monthNames.indexOf(b.month) - this.monthNames.indexOf(a.month);
        if (monthDiff !== 0) return monthDiff;
        return (b.day ?? 0) - (a.day ?? 0);
      });

      return {
        type: null,
        status: 200,
        message: final.map(r => ({
          year: r.year,
          month: r.month,
          day: r.day,
          kg: r.kg,
          qt: r.qt,
          produzidoKg: r.produzidoKg,
          produzidoQt: r.produzidoQt
        }))
      };
    } catch (error) {
      console.error("Error processing Excel file:", error);
      return {
        type: "error",
        status: 500,
        message: "Erro ao processar o arquivo Excel"
      };
    }
  }
}
