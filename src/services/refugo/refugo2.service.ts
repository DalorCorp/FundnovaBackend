import XLSX from 'xlsx';
import path from 'path';

export default class FaturamentoServices {

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

    return date.toISOString().split("T")[0]; // Returns "YYYY-MM-DD"
  };

  monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  async getFaturamento() {
    try {
      const filePath = path.join('C:/Arquivos Fundnova/INDUSTRIAL/Pública/REFUGO/_REFUGO.xlsm');
      const workbook = XLSX.readFile(filePath);
      const wsRefugo = workbook.Sheets["BD_REFUGO"];
      const wsProducao = workbook.Sheets["BD_PRODUÇÃO"];
  
      const headerRowIndex = 1;
  
      const dataKg = XLSX.utils.sheet_to_json(wsRefugo, { range: headerRowIndex, defval: null });
      const dataQt = XLSX.utils.sheet_to_json(wsRefugo, { range: headerRowIndex, defval: null });
  
      const filteredDataKg = dataKg
        .filter((row: any) =>
          row["DATA"] && row["KG_TT"] != null // && row[" R$ "] != null && row["R$/KG"] != null
        )
        .map((row: any) => {
          const fullDate = this.excelDateToJSDate(row["DT_FUSÃO"]);
          const [year, month, day] = fullDate!.split("-");
  
          return {
            year: parseInt(year),
            month: this.monthNames[parseInt(month) - 1],
            day: parseInt(day),
            kg: row["KG_TT"],
            qt: row["QTE_REF"],
            producaoKg: row[" KG_TT "],
            producaoQt: row["QTE_PÇ"]
          };
        });
  
      filteredDataKg.sort((a, b) => {
        const yearDiff = (b.year ?? 0) - (a.year ?? 0);
        if (yearDiff !== 0) return yearDiff;
  
        const monthDiff = this.monthNames.indexOf(b.month) - this.monthNames.indexOf(a.month);
        if (monthDiff !== 0) return monthDiff;
  
        return (b.day ?? 0) - (a.day ?? 0);
      });

      const filteredDataQt = dataKg
        .filter((row: any) =>
          row["DATA"] && row["KG_TT"] != null // && row[" R$ "] != null && row["R$/KG"] != null
        )
        .map((row: any) => {
          const fullDate = this.excelDateToJSDate(row["DT_FUSÃO"]);
          const [year, month, day] = fullDate!.split("-");
  
          return {
            year: parseInt(year),
            month: this.monthNames[parseInt(month) - 1],
            day: parseInt(day),
            kg: row["KG_TT"],
          };
        });
  
      filteredDataQt.sort((a, b) => {
        const yearDiff = (b.year ?? 0) - (a.year ?? 0);
        if (yearDiff !== 0) return yearDiff;
  
        const monthDiff = this.monthNames.indexOf(b.month) - this.monthNames.indexOf(a.month);
        if (monthDiff !== 0) return monthDiff;
  
        return (b.day ?? 0) - (a.day ?? 0);
      });
  
      return {
        type: null,
        status: 200,
        message: filteredDataKg //, filteredDataQt }
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
