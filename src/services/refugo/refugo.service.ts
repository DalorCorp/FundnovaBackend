import XLSX from 'xlsx';
import path from 'path';

type KgRefugo = { year: number; month: string; day: number; refugo: number };
type KgProducao = { year: number; month: string; day: number; producao: number };
type KgMergedData = { year: number; month: string; day: number; refugo: number; producao: number; razao: number };

type QtRefugo = { year: number; month: string; day: number; refugo: number };
type QtProducao = { year: number; month: string; day: number; producao: number };
type QtMergedData = { year: number; month: string; day: number; refugo: number; producao: number; razao: number };

export default class RefugoServices {
  private monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  private excelDateToJSDate(serial: number): string | null {
    if (!serial || isNaN(serial) || serial < 0) return null;
    const excelStartDate = new Date(1899, 11, 30);
    const date = new Date(excelStartDate.getTime() + serial * 86400000);
    return isNaN(date.getTime()) ? null : date.toISOString().split("T")[0];
  }

  private parseSheetToRefugo(sheet: XLSX.Sheet): KgRefugo[] {
    const rawData = XLSX.utils.sheet_to_json(sheet);
    return (rawData as any[])
      .map((row) => {
        const date = row["DT_FUSÃO"] ? this.excelDateToJSDate(row["DT_FUSÃO"]) : null;
        if (!date) return null;

        const [yearStr, monthStr, dayStr] = date.split("-");
        const year = parseInt(yearStr);
        const month = this.monthNames[parseInt(monthStr) - 1];
        const day = parseInt(dayStr);
        const refugo = Number(row["KG_TT"] || 0);

        return { year, month, day, refugo };
      })
      .filter((entry): entry is KgRefugo => !!entry);
  }

  private parseSheetToRefugoQt(sheet: XLSX.Sheet): KgRefugo[] {
    const rawData = XLSX.utils.sheet_to_json(sheet);
    return (rawData as any[])
      .map((row) => {
        const date = row["DT_FUSÃO"] ? this.excelDateToJSDate(row["DT_FUSÃO"]) : null;
        if (!date) return null;

        const [yearStr, monthStr, dayStr] = date.split("-");
        const year = parseInt(yearStr);
        const month = this.monthNames[parseInt(monthStr) - 1];
        const day = parseInt(dayStr);
        const refugo = Number(row["QTE_REF"] || 0);

        return { year, month, day, refugo };
      })
      .filter((entry): entry is KgRefugo => !!entry);
  }

  private parseSheetToProducao(sheet: XLSX.Sheet): KgProducao[] {
    const rawData = XLSX.utils.sheet_to_json(sheet, { range: 3, defval: null });
    return (rawData as any[])
      .map((row) => {
        const date = row["DT_FUSÃO"] ? this.excelDateToJSDate(row["DT_FUSÃO"]) : null;
        if (!date) return null;

        const [yearStr, monthStr, dayStr] = date.split("-");
        const year = parseInt(yearStr);
        const month = this.monthNames[parseInt(monthStr) - 1];
        const day = parseInt(dayStr);
        const producao = Number(row[" KG_TT "] || 0);

        return { year, month, day, producao };
      })
      .filter((entry): entry is KgProducao => !!entry);
  }

  private parseSheetToProducaoQt(sheet: XLSX.Sheet): KgProducao[] {
    const rawData = XLSX.utils.sheet_to_json(sheet, { range: 3, defval: null });
    return (rawData as any[])
      .map((row) => {
        const date = row["DT_FUSÃO"] ? this.excelDateToJSDate(row["DT_FUSÃO"]) : null;
        if (!date) return null;

        const [yearStr, monthStr, dayStr] = date.split("-");
        const year = parseInt(yearStr);
        const month = this.monthNames[parseInt(monthStr) - 1];
        const day = parseInt(dayStr);
        const producao = Number(row["QTE_PÇ"] || 0);

        return { year, month, day, producao };
      })
      .filter((entry): entry is KgProducao => !!entry);
  }

  private mergeByDate(refugos: KgRefugo[], producoes: KgProducao[]): KgMergedData[] {
    const map = new Map<string, KgMergedData>();
  
    function getKey(year: number, month: string, day: number): string {
      return `${year}-${month}-${day}`;
    }
  
    for (const r of refugos) {
      const key = getKey(r.year, r.month, r.day);
      if (map.has(key)) {
        map.get(key)!.refugo += r.refugo;
      } else {
        map.set(key, {
          year: r.year,
          month: r.month,
          day: r.day,
          refugo: r.refugo,
          producao: 0,
          razao: 0
        });
      }
    }
  
    for (const p of producoes) {
      const key = getKey(p.year, p.month, p.day);
      if (map.has(key)) {
        map.get(key)!.producao += p.producao;
      } else {
        map.set(key, {
          year: p.year,
          month: p.month,
          day: p.day,
          refugo: 0,
          producao: p.producao,
          razao: 0
        });
      }
    }
  
    for (const entry of map.values()) {
      entry.razao = entry.producao !== 0 ? 100 * (entry.refugo / entry.producao) : 0;
    }
  
    return Array.from(map.values());
  }

  async getRefugo() {
    try {
      const refugo = await this.getRefugoRequest()
      // const refugoQt = await this.getRefugoQt()
      // const merged = {refugoKg, refugoQt}
    return {
      type: null,
      status: 200,
      message: refugo
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
  
  async getRefugoRequest() {
    try {
      const filePath = path.join('C:/Arquivos Fundnova/INDUSTRIAL/Pública/REFUGO/_REFUGO.xlsm');
      const workbook = XLSX.readFile(filePath);

      const refugoSheetKg = workbook.Sheets["BD_REFUGO"];
      const producaoSheetKg = workbook.Sheets["BD_PRODUÇÃO"];

      const refugoSheetQt = workbook.Sheets["BD_REFUGO"];
      const producaoSheetQt = workbook.Sheets["BD_PRODUÇÃO"];

      const refugoDataKg = this.parseSheetToRefugo(refugoSheetKg);
      const producaoDataKg = this.parseSheetToProducao(producaoSheetKg);

      const refugoDataQt = this.parseSheetToRefugoQt(refugoSheetQt);
      const producaoDataQt = this.parseSheetToProducaoQt(producaoSheetQt);

      const mergedKg = this.mergeByDate(refugoDataKg, producaoDataKg);
      const mergedQt = this.mergeByDate(refugoDataQt, producaoDataQt);

      const filteredKg = mergedKg.filter(entry => entry.year >= 2025);
      const filteredQt = mergedQt.filter(entry => entry.year >= 2025);
      const filtered = {filteredKg, filteredQt}
      return filtered;
    } catch (error) {
      console.error("Error processing Excel file:", error);
      return {
        type: "error",
        status: 500,
        message: "Erro ao processar o arquivo Excel"
      };
    }
  }

  async getRefugoQt() {
    try {
      const filePath = path.join('C:/Arquivos Fundnova/INDUSTRIAL/Pública/REFUGO/_REFUGO.xlsm');
      const workbook = XLSX.readFile(filePath);

      const refugoSheet = workbook.Sheets["BD_REFUGO"];
      const producaoSheet = workbook.Sheets["BD_PRODUÇÃO"];

      const refugoData = this.parseSheetToRefugoQt(refugoSheet);
      const producaoData = this.parseSheetToProducaoQt(producaoSheet);

      const merged = this.mergeByDate(refugoData, producaoData);
      const filtered = merged.filter(entry => entry.year >= 2025);
      return filtered;
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
