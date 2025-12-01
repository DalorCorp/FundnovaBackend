import XLSX from "xlsx";
import path from "path";

export default class RefugoServices {
  monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  excelDateToJSDate = (serial: number) => {
    if (!serial || isNaN(serial) || serial < 0) return null;
    const excelStartDate = new Date(1899, 11, 30);
    const date = new Date(excelStartDate.getTime() + serial * 86400000);
    return isNaN(date.getTime()) ? null : date.toISOString().split("T")[0];
  };

  async getRefugo() {
    try {
      const filePath = path.join(
        "C:/Arquivos Fundnova/INDUSTRIAL/Pública/REFUGO/_REFUGO.xlsm"
      );

      const wb = XLSX.readFile(filePath);

      const sheetRefugo = wb.Sheets["BD_REFUGO"];
      const sheetProducao = wb.Sheets["BD_PRODUÇÃO"];

      const refugoData = XLSX.utils.sheet_to_json(sheetRefugo, { defval: null });
      const producaoData = XLSX.utils.sheet_to_json(sheetProducao, { defval: null });

      const map = new Map<string, any>();

      const key = (y: number, m: string, d: number) => `${y}-${m}-${d}`;

      // -------- REFUGO KG --------
      for (const row of refugoData as any[]) {
        const d = row["DT_FUSÃO"] ? this.excelDateToJSDate(row["DT_FUSÃO"]) : null;
        if (!d) continue;

        const [yearStr, monthStr, dayStr] = d.split("-");
        const year = +yearStr;
        const month = this.monthNames[+monthStr - 1];
        const day = +dayStr;

        const k = key(year, month, day);

        if (!map.has(k)) {
          map.set(k, {
            year,
            month,
            day,
            kg: 0,
            qt: 0,
            produzidoKg: 0,
            produzidoQt: 0
          });
        }

        map.get(k).kg += Number(row["KG_TT"] || 0);
        map.get(k).qt += Number(row["QTE_REF"] || 0);
      }

      // -------- PRODUÇÃO (KG + QT) --------
      for (const row of producaoData as any[]) {
        const d = row["DT_FUSÃO"] ? this.excelDateToJSDate(row["DT_FUSÃO"]) : null;
        if (!d) continue;

        const [yearStr, monthStr, dayStr] = d.split("-");
        const year = +yearStr;
        const month = this.monthNames[+monthStr - 1];
        const day = +dayStr;

        const k = key(year, month, day);

        if (!map.has(k)) {
          map.set(k, {
            year,
            month,
            day,
            kg: 0,
            qt: 0,
            produzidoKg: 0,
            produzidoQt: 0
          });
        }

        map.get(k).produzidoKg += Number(row[" KG_TT "] || 0);
        map.get(k).produzidoQt += Number(row["QTE_PÇ"] || 0);
      }

      // -------- Convert to array --------
      const finalData = Array.from(map.values());

      // -------- Sort EXACTLY like the first code --------
      finalData.sort((a, b) => {
        const yearDiff = b.year - a.year;
        if (yearDiff !== 0) return yearDiff;

        const monthDiff =
          this.monthNames.indexOf(b.month) - this.monthNames.indexOf(a.month);
        if (monthDiff !== 0) return monthDiff;

        return b.day - a.day;
      });

      return {
        type: null,
        status: 200,
        message: finalData
      };
    } catch (error) {
      console.error("Error:", error);
      return {
        type: "error",
        status: 500,
        message: "Erro ao processar o arquivo Excel"
      };
    }
  }
}
