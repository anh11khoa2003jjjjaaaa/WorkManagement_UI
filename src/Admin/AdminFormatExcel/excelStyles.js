// Excel styling configurations
export const columnWidths = [
    { wch: 15 },  // ID
    { wch: 30 },  // Tên
    { wch: 35 },  // Email
    { wch: 15 },  // SĐT
    { wch: 25 }   // Phòng ban
  ];
  
  export const headerStyle = {
    font: { 
      bold: true, 
      color: { rgb: "FFFFFF" },
      sz: 12 // Font size
    },
    fill: { 
      fgColor: { rgb: "1F4E78" }, // Darker blue for better contrast
      patternType: "solid" 
    },
    alignment: { 
      horizontal: "center", 
      vertical: "center",
      wrapText: true
    },
    border: {
      top: { style: "medium", color: { rgb: "000000" } },
      bottom: { style: "medium", color: { rgb: "000000" } },
      left: { style: "medium", color: { rgb: "000000" } },
      right: { style: "medium", color: { rgb: "000000" } }
    }
  };
  
  export const cellStyle = {
    font: {
      sz: 11 // Font size for data cells
    },
    alignment: { 
      horizontal: "left", 
      vertical: "center",
      wrapText: true
    },
    border: {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } }
    }
  };