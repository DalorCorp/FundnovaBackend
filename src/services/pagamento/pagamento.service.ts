import XLSX from 'xlsx';
import path from 'path';

export default class PagamentoServices {

  excelDateToJSDate = (serial: number) => {
    if (!serial || isNaN(serial) || serial < 0) {
        console.error("Invalid Excel serial date:", serial);
        return null;
    }

    const excelStartDate = new Date(1899, 11, 30);
    const date = new Date(excelStartDate.getTime() + serial * 86400000);

    if (isNaN(date.getTime())) {
        console.error("Failed to convert Excel date:", serial);
        return null;
    }

    return date.toISOString().split("T")[0];
  };

  monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

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

      filteredData.sort((a, b) => {
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
}
