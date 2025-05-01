const XLSX = require('xlsx'); // Import the xlsx library
const fs = require('fs'); // Import the fs (File System) module
const path = require('path'); // Import the path module

// Define the path to the Excel file
const pagamento = 'C:/Arquivos Fundnova/BACKEND/PAGAMENTO.xlsx';
// const pagamento = 'D:/App/AdventureForge/PAGAMENTO.xlsx';

// Read the Excel file from the given path
const readExcelFile = (pagamento) => {
  try {
    // Read the file using the xlsx library
    const wb = XLSX.readFile(pagamento);

    // Get the first sheet name
    const sheetName = wb.SheetNames[0];
    
    // Get the first sheet data
    const ws = wb.Sheets[sheetName];

    // Convert the sheet to JSON format
    const jsonData = XLSX.utils.sheet_to_json(ws);
    
    // Log the parsed JSON data (this is where you can store or manipulate the data)
    console.log('Parsed data from Excel file:', jsonData);

    // Optionally, save this data to a new file on the server
    fs.writeFileSync('parsedData.json', JSON.stringify(jsonData, null, 2));

  } catch (error) {
    console.error('Error reading or processing the Excel file:', error);
  }
};

// Call the function with the file path
readExcelFile(pagamento);
