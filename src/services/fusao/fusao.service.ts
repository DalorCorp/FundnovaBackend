import XLSX from 'xlsx';
import path from 'path';

export default class FusaoServices {

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

  async getFusao() {
    try {
      const fusao = path.join('C:/Arquivos Fundnova/INDUSTRIAL/Pública/FUSÃO/_FOLHA DE FUSÃO.xlsm');
      const wb = XLSX.readFile(fusao);
      const fusaoSheet = wb.SheetNames[1];
      console.log(fusaoSheet);
      
      const ws = wb.Sheets[fusaoSheet];
  
      const headerRowIndex = 1;
  
      const data = XLSX.utils.sheet_to_json(ws, { range: headerRowIndex, defval: null });
  
      const filteredData = data
        .filter((row: any) =>
          row["DATA"] && row["CARVÃO"] != null // && row[" R$ "] != null && row["R$/KG"] != null
        )
        .map((row: any) => {
          const fullDate = this.excelDateToJSDate(row["DATA"]);
          const [year, month, day] = fullDate!.split("-");
  
          return {
            year: parseInt(year),
            month: this.monthNames[parseInt(month) - 1],
            day: parseInt(day),
            qt: row["CARVÃO"],
            // price: row[" R$ "],
            // result: row["R$/KG"]
          };
        });
  
      filteredData.sort((a, b) => {
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
  
}
