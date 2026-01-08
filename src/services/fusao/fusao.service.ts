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
      const fusaoSheet = wb.SheetNames[2];
      console.log("0 ", wb.SheetNames[0]);
      console.log("1 ", wb.SheetNames[1]);
      console.log("2 ", wb.SheetNames[2]);
      console.log("3 ", wb.SheetNames[3]);
      console.log("4 ", wb.SheetNames[4]);
      
      
      const ws = wb.Sheets[fusaoSheet];
  
      const headerRowIndex = 1;
  
      const data = XLSX.utils.sheet_to_json(ws, { range: headerRowIndex, defval: null }) as any[];

      console.log("Headers:", Object.keys(data[0] || {}));

  
      const filteredData = data
        .filter((row: any) =>
          row["DATA"] && row[" CARVÃO "] != null // && row[" R$ "] != null && row["R$/KG"] != null
        )
        .map((row: any) => {
          const fullDate = this.excelDateToJSDate(row["DATA"]);
          const [year, month, day] = fullDate!.split("-");
  
          return {
            year: parseInt(year),
            month: this.monthNames[parseInt(month) - 1],
            day: parseInt(day),
            qt: row[" CARVÃO "],

            // 0|fundnova-backend  | Headers: [
            // 0|fundnova-backend  |   'FUSÃO',
            // 0|fundnova-backend  |   'DATA',
            // 0|fundnova-backend  |   'INÍCIO',
            // 0|fundnova-backend  |   'FINAL',
            // 0|fundnova-backend  |   'QTE CARGA',
            // 0|fundnova-backend  |   ' PÉ (CARBONO) ',
            // 0|fundnova-backend  |   ' PÉ (CARVÃO) ',
            // 0|fundnova-backend  |   ' REFORÇO (CARVÃO) ',
            // 0|fundnova-backend  |   ' REFORÇO (CARBONO) ',
            // 0|fundnova-backend  |   ' CARVÃO ',
            // 0|fundnova-backend  |   ' CARBONO ',
            // 0|fundnova-backend  |   ' CARBONO MACIO ',
            // 0|fundnova-backend  |   ' CALCÁRIO ',
            // 0|fundnova-backend  |   ' SILÍCIO ',
            // 0|fundnova-backend  |   ' SUCATA AUTOMOTIVA ',
            // 0|fundnova-backend  |   ' SUCATA RESPINGO ',
            // 0|fundnova-backend  |   ' SUCATA CANAL ',
            // 0|fundnova-backend  |   ' CANAL P/ ESFRIAR METAL ',
            // 0|fundnova-backend  |   ' SUCATA GUSA ',
            // 0|fundnova-backend  |   ' SUCATA COQUILHA ',
            // 0|fundnova-backend  |   ' RETORNO SUCATA ',
            // 0|fundnova-backend  |   ' RETORNO CARBONO ',
            // 0|fundnova-backend  |   ' PESO TOTAL ',
            // 0|fundnova-backend  |   'DIA',
            // 0|fundnova-backend  |   'MÊS ',
            // 0|fundnova-backend  |   'ANO'
            // 0|fundnova-backend  | ]
              

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
