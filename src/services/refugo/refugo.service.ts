import XLSX from "xlsx";
import path from "path";

export default class RefugoServices {
  monthNames = [
    "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
    "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
  ];

  excelDateToJSDate = (serial: number) => {
    if (!serial || isNaN(serial) || serial < 0) return null;
    const base = new Date(1899, 11, 30);
    const date = new Date(base.getTime() + serial * 86400000);
    return isNaN(date.getTime()) ? null : date.toISOString().split("T")[0];
  };

  async getRefugo() {
    console.log("LOOOOOOOOOOG-------------------------2");

    try {
      const file = path.join(
        "C:/Arquivos Fundnova/INDUSTRIAL/Pública/REFUGO/_REFUGO.xlsm"
      );

      // LOAD XLSM FILE
      const wb = XLSX.readFile(file);

      // LOAD SHEETS (supports both names)
      const refugoSheet = wb.Sheets["BD_REFUGO"];
      const producaoSheet =
        wb.Sheets["BD_PRODUÇÃO"] || wb.Sheets["BD_PRODUCAO"];

      if (!refugoSheet) throw new Error("Sheet BD_REFUGO not found");
      if (!producaoSheet) throw new Error("Sheet BD_PRODUÇÃO / BD_PRODUCAO not found");

      // Read rows
      const refugoRows = XLSX.utils.sheet_to_json(refugoSheet, { defval: 0 });
      const producaoRows = XLSX.utils.sheet_to_json(producaoSheet, { defval: null });

      const map = new Map<string, any>();

      const makeKey = (y: number, m: string, d: number) => `${y}-${m}-${d}`;

      // ---------------------------------------------------------
      // REFUGO (KG + QT)
      // ---------------------------------------------------------
      for (const row of refugoRows as any[]) {
        const date = this.excelDateToJSDate(row["DT_FUSÃO"]);
        if (!date) continue;

        const [y, m, d] = date.split("-");
        const year = +y;
        const month = this.monthNames[+m - 1];
        const day = +d;

        const k = makeKey(year, month, day);

        if (!map.has(k)) {
          map.set(k, {
            year, month, day,
            kg: 0,
            qt: 0,
            produzidoKg: 0,
            produzidoQt: 0
          });
        }

        const item = map.get(k);
        item.kg += Number(row["KG_TT"] || 0);
        item.qt += Number(row["QTE_REF"] || 0);
      }

      // ---------------------------------------------------------
      // PRODUÇÃO (KG + QT)
      // ---------------------------------------------------------
      for (const row of producaoRows as any[]) {
        const date = this.excelDateToJSDate(row["DT_FUSÃO"]);
        if (!date) continue;

        const [y, m, d] = date.split("-");
        const year = +y;
        const month = this.monthNames[+m - 1];
        const day = +d;

        const k = makeKey(year, month, day);

        if (!map.has(k)) {
          map.set(k, {
            year, month, day,
            kg: 0,
            qt: 0,
            produzidoKg: 0,
            produzidoQt: 0
          });
        }

        const item = map.get(k);

        // VERY IMPORTANT – these columns HAVE SPACES!
        item.produzidoKg += Number(row[" KG_TT "] || 0);

        item.produzidoQt += Number(row["QTE_PÇ"] || 0);
      }

      // FINAL ARRAY
      const final = Array.from(map.values()).filter(e => e.year >= 2025);

      // Sort newest → oldest
      final.sort((a, b) => {
        if (b.year !== a.year) return b.year - a.year;
        if (a.month !== b.month)
          return this.monthNames.indexOf(b.month) - this.monthNames.indexOf(a.month);
        return b.day - a.day;
      });

      return {
        type: null,
        status: 200,
        message: final
      };

    } catch (err) {
      console.error(err);
      return {
        type: "error",
        status: 500,
        message: "Erro ao processar Excel"
      };
    }
  }
}
