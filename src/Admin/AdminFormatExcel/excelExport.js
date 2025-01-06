import * as XLSX from 'xlsx';
import { columnWidths, headerStyle, cellStyle } from './excelStyles';

const formatExcelData = (employees, departmentName) => {
  // Transform data with formatting
  const worksheetData = [
    // Header row
    ["ID Nhân viên", "Tên Nhân viên", "Email", "Số Điện Thoại", "Phòng ban"]
  ];

  // Add employee data
  employees.forEach((employee) => {
    worksheetData.push([
      employee.employeeId,
      employee.employeeName,
      employee.email,
      employee.phone,
      employee.departmentName || "Chưa rõ"
    ]);
  });

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set row height for header
  worksheet['!rows'] = [{ hpt: 25 }]; // Header row height
  
  // Apply column widths
  worksheet['!cols'] = columnWidths;

  // Apply styles to header row
  const headerRange = XLSX.utils.decode_range(worksheet['!ref']);
  for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
    worksheet[cellRef].s = headerStyle;
  }

  // Apply styles to data cells and add alternating row colors
  for (let row = 1; row <= headerRange.e.r; row++) {
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
      if (worksheet[cellRef]) {
        const style = { ...cellStyle };
        // Add subtle alternating row colors
        if (row % 2 === 0) {
          style.fill = { 
            fgColor: { rgb: "F5F5F5" },
            patternType: "solid"
          };
        }
        worksheet[cellRef].s = style;
      }
    }
  }

  // Add a thick border around the entire table
  const lastRow = headerRange.e.r;
  const lastCol = headerRange.e.c;
  
  // Top border of first row (already handled by header style)
  // Bottom border of last row
  for (let col = 0; col <= lastCol; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: lastRow, c: col });
    if (worksheet[cellRef]) {
      worksheet[cellRef].s = {
        ...worksheet[cellRef].s,
        border: {
          ...worksheet[cellRef].s.border,
          bottom: { style: "medium", color: { rgb: "000000" } }
        }
      };
    }
  }

  return worksheet;
};

export const exportToExcel = (employees, departmentName) => {
  const worksheet = formatExcelData(employees, departmentName);
  const workbook = XLSX.utils.book_new();
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Danh sách nhân viên");
  
  // Save file
  XLSX.writeFile(workbook, `Danh sách nhân viên - ${departmentName}.xlsx`);
};