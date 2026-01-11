import XLSX from 'xlsx';
import path from 'path';

type KgRefugo = { year: number; month: string; day: number; refugo: number };
type KgProducao = { year: number; month: string; day: number; producao: number };
type KgMergedData = { year: number; month: string; day: number; refugo: number; producao: number; razao: number };

type QtRefugo = { year: number; month: string; day: number; refugo: number };
type QtProducao = { year: number; month: string; day: number; producao: number };
type QtMergedData = { year: number; month: string; day: number; refugo: number; producao: number; razao: number };

export default class DataServices {
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

  private toNumber(value: any): number {
    if (value == null) return 0;
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      return Number(value.replace(".", "").replace(",", ".")) || 0;
    }
    return 0;
  }  
  
  async getPagamento() {
    try {
      const pagamento = path.join('C:/Arquivos Fundnova/INDUSTRIAL/Pública/FATURAMENTO/PAGAMENTO.xlsx');
      const wb = XLSX.readFile(pagamento);
      
      const sheetName = wb.SheetNames[1];
      const ws = wb.Sheets[sheetName];

      const data = XLSX.utils.sheet_to_json(ws);

      const filteredData = data.map((row: any) => {
        const fullDate = row["DT.MOVTO"] ? this.excelDateToJSDate(row["DT.MOVTO"]) : null;
        const [year, month, day] = fullDate ? fullDate.split("-") : [null, null, null];
        
        const monthName = month ? this.monthNames[parseInt(month) - 1] : null;

        return {
          year: year ? parseInt(year) : null,
          month: monthName,
          day: day ? parseInt(day) : null,
          debito: row["  VR.DEBITO  "] ? Number(row["  VR.DEBITO  "]).toFixed(2) : "0.00",
          credito: row[" VR.CREDITO "] ? Number(row[" VR.CREDITO "]).toFixed(2) : "0.00",
        };
      });

      filteredData.sort((a: any, b: any) => {
        const yearA = a.year ?? 0;
        const yearB = b.year ?? 0;
      
        if (yearA !== yearB) return yearB - yearA;
      
        const monthIndexA = a.month ? this.monthNames.indexOf(a.month) : -1;
        const monthIndexB = b.month ? this.monthNames.indexOf(b.month) : -1;
      
        if (monthIndexA !== monthIndexB) return monthIndexA - monthIndexB;
      
        const dayA = a.day ?? 0;
        const dayB = b.day ?? 0;
      
        return dayA - dayB;
      });

      return {
        type: null,
        status: 200,
        message: filteredData
      };
    } catch (error) {
      console.error("Error reading Excel file:", error);
      return {
        type: "error",
        message: "Failed to read Excel file",
        status: 500
      };
    }
  }

  async getFaturamento() {
    try {
      const faturamento = path.join('C:/Arquivos Fundnova/INDUSTRIAL/Pública/FATURAMENTO/FATURAMENTO DIÁRIO.xlsx');
      const wb = XLSX.readFile(faturamento);
      const faturamentoSheet = wb.SheetNames[1];
      const ws = wb.Sheets[faturamentoSheet];
  
      const headerRowIndex = 1;
  
      const data = XLSX.utils.sheet_to_json(ws, { range: headerRowIndex, defval: null });
  
      const filteredData = data
        .filter((row: any) =>
          row["DATA"] && row[" KG "] != null && row[" R$ "] != null && row["R$/KG"] != null
        )
        .map((row: any) => {
          const fullDate = this.excelDateToJSDate(row["DATA"]);
          const [year, month, day] = fullDate!.split("-");
  
          return {
            year: parseInt(year),
            month: this.monthNames[parseInt(month) - 1],
            day: parseInt(day),
            kg: row[" KG "],
            price: row[" R$ "],
            result: row["R$/KG"]
          };
        });
  
      filteredData.sort((a: any, b: any) => {
        const yearDiff = (b.year ?? 0) - (a.year ?? 0);
        if (yearDiff !== 0) return yearDiff;
  
        const monthDiff = this.monthNames.indexOf(b.month) - this.monthNames.indexOf(a.month);
        if (monthDiff !== 0) return monthDiff;
  
        return (b.day ?? 0) - (a.day ?? 0);
      });
  
      return {
        type: null,
        status: 200,
        message: filteredData
      };
    } catch (error) {
      console.error("Error reading Excel file:", error);
      return {
        type: "error",
        message: "Failed to read Excel file",
        status: 500
      };
    }
  }

  async getRefugo() {
    try {
      const refugoKg = await this.getRefugoKg()
      const refugoQt = await this.getRefugoQt()
      const merged = {refugoKg, refugoQt}
      
    return {
      type: null,
      status: 200,
      message: merged
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
  
  async getRefugoKg() {
    try {
      const filePath = path.join('C:/Arquivos Fundnova/INDUSTRIAL/Pública/REFUGO/_REFUGO.xlsm');
      const workbook = XLSX.readFile(filePath);

      const refugoSheet = workbook.Sheets["BD_REFUGO"];
      const producaoSheet = workbook.Sheets["BD_PRODUCAO"];
      const producaoSheet2 = workbook.Sheets["BD_PRODUÇÃO"];

      const refugoData = this.parseSheetToRefugo(refugoSheet);
      const producaoData = this.parseSheetToProducao(producaoSheet ? producaoSheet : producaoSheet2);

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

  async getRefugoQt() {
    try {
      const filePath = path.join('C:/Arquivos Fundnova/INDUSTRIAL/Pública/REFUGO/_REFUGO.xlsm');
      const workbook = XLSX.readFile(filePath);

      const refugoSheet = workbook.Sheets["BD_REFUGO"];
      const producaoSheet = workbook.Sheets["BD_PRODUCAO"];
      const producaoSheet2 = workbook.Sheets["BD_PRODUÇÃO"];

      const refugoData = this.parseSheetToRefugoQt(refugoSheet);
      const producaoData = this.parseSheetToProducaoQt(producaoSheet ? producaoSheet : producaoSheet2);

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

  async getFinanceiro() {
    try {
      const file = path.join('C:/Arquivos Fundnova/FINANCEIRO/Particular/RELATÓRIO GERENCIAL/ANALISE FINANCEIRA DIÁRIA.xlsx');
      const wb = XLSX.readFile(file);
      const sheet = wb.SheetNames[0];
      const ws = wb.Sheets[sheet];

      const bebe = wb.SheetNames

      console.log("Sheet names:", wb.SheetNames);

      const headers = XLSX.utils.sheet_to_json(ws, {
        header: 1,
        range: 0
      })[0];
      
      console.log("Headers:", headers);

      const alala = {bebe, headers}
  
      const headerRowIndex = 1;
  
      const data = XLSX.utils.sheet_to_json(ws, { range: headerRowIndex, defval: null });
  
      const result = data
        .filter((row: any) =>
          row["DATA"] && row[" KG "] != null && row[" R$ "] != null && row["R$/KG"] != null
        )
        .map((row: any) => {
          const entradasParaLiquidez =
            this.toNumber(row["SALDO DO CAIXA"]) +
            this.toNumber(row["SALDO CONTA ALEXANDRE"]) +
            this.toNumber(row["SALDO CONTA FUNDNOVA"]) +
            this.toNumber(row["CHEQUES PRE-DATADOS"]) +
            this.toNumber(row["NOTINHAS A RECEBER"]);
          
          const saidasParaLiquidez =
            this.toNumber(row["CONTAS A PAGAR"]) +
            this.toNumber(row["CHEQUES EMITIDOS"]);

          const entradasParaDinheiro = 
            this.toNumber(row["SALDO DO CAIXA"]) +
            this.toNumber(row["SALDO CONTA ALEXANDRE"]) +
            this.toNumber(row["SALDO CONTA FUNDNOVA"]);

          const liquidez = saidasParaLiquidez === 0 ? 0 : entradasParaLiquidez / saidasParaLiquidez;
          const dinheiro = entradasParaLiquidez === 0 ? 0 : entradasParaDinheiro / entradasParaLiquidez;

          return {
            year: Number(row["ANO"]),
            month: this.monthNames[Number(row["MÊS"]) - 1],
            day: Number(row["DIA"]),
            liquidez: Number(liquidez.toFixed(2)),
            dinheiro: Number(dinheiro.toFixed(2))
          };
        });

      result.sort((a: any, b: any) => {
        if (b.year !== a.year) return b.year - a.year;
        if (b.month !== a.month) {
          return this.monthNames.indexOf(b.month) -
                this.monthNames.indexOf(a.month);
        }
        return b.day - a.day;
      });

      return {
        type: null,
        status: 200,
        message: alala,
      };
    } catch (error) {
      console.error("Error reading Excel file:", error);
      return {
        type: "error",
        message: "Failed to read Excel file",
        status: 500
      };
    }
  }
}
