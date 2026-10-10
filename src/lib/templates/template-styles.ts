import XLSX from 'xlsx-js-style';

export const NAVY_HEADER_RGB = '1F3864';
export const SOFT_BLUE_RGB = 'D9E2F3';
export const YELLOW_SECTION_RGB = 'FFFF00';
export const WHITE_RGB = 'FFFFFF';
export const GRAY_TEXT_RGB = '555555';
export const BORDER_LIGHT_RGB = 'D9D9D9';

export const baseStyles = {
  titleBanner: {
    fill: { fgColor: { rgb: NAVY_HEADER_RGB } },
    font: { name: 'Calibri', sz: 14, bold: true, color: { rgb: WHITE_RGB } },
    alignment: { vertical: 'center', horizontal: 'left' },
  },
  subBanner: {
    fill: { fgColor: { rgb: SOFT_BLUE_RGB } },
    font: { name: 'Calibri', sz: 9, bold: false, color: { rgb: NAVY_HEADER_RGB } },
    alignment: { vertical: 'center', horizontal: 'left' },
  },
  headerCell: {
    fill: { fgColor: { rgb: NAVY_HEADER_RGB } },
    font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: WHITE_RGB } },
    alignment: { vertical: 'center', horizontal: 'center', wrapText: true },
    border: {
      top: { style: 'thin', color: { rgb: WHITE_RGB } },
      bottom: { style: 'thin', color: { rgb: WHITE_RGB } },
      left: { style: 'thin', color: { rgb: WHITE_RGB } },
      right: { style: 'thin', color: { rgb: WHITE_RGB } },
    },
  },
  sectionBanner: {
    fill: { fgColor: { rgb: YELLOW_SECTION_RGB } },
    font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: NAVY_HEADER_RGB } },
    alignment: { vertical: 'center', horizontal: 'left' },
  },
  tableHeader: {
    fill: { fgColor: { rgb: NAVY_HEADER_RGB } },
    font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: WHITE_RGB } },
    alignment: { vertical: 'center', horizontal: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: BORDER_LIGHT_RGB } },
      bottom: { style: 'thin', color: { rgb: BORDER_LIGHT_RGB } },
      left: { style: 'thin', color: { rgb: BORDER_LIGHT_RGB } },
      right: { style: 'thin', color: { rgb: BORDER_LIGHT_RGB } },
    },
  },
  tableHeaderSoft: {
    fill: { fgColor: { rgb: SOFT_BLUE_RGB } },
    font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: NAVY_HEADER_RGB } },
    alignment: { vertical: 'center', horizontal: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: BORDER_LIGHT_RGB } },
      bottom: { style: 'thin', color: { rgb: BORDER_LIGHT_RGB } },
      left: { style: 'thin', color: { rgb: BORDER_LIGHT_RGB } },
      right: { style: 'thin', color: { rgb: BORDER_LIGHT_RGB } },
    },
  },
  dataCell: {
    font: { name: 'Calibri', sz: 10 },
    alignment: { vertical: 'center', horizontal: 'left' },
    border: {
      top: { style: 'thin', color: { rgb: BORDER_LIGHT_RGB } },
      bottom: { style: 'thin', color: { rgb: BORDER_LIGHT_RGB } },
      left: { style: 'thin', color: { rgb: BORDER_LIGHT_RGB } },
      right: { style: 'thin', color: { rgb: BORDER_LIGHT_RGB } },
    },
  },
  dataCellCenter: {
    font: { name: 'Calibri', sz: 10 },
    alignment: { vertical: 'center', horizontal: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: BORDER_LIGHT_RGB } },
      bottom: { style: 'thin', color: { rgb: BORDER_LIGHT_RGB } },
      left: { style: 'thin', color: { rgb: BORDER_LIGHT_RGB } },
      right: { style: 'thin', color: { rgb: BORDER_LIGHT_RGB } },
    },
  },
  boldCellCenter: {
    font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: NAVY_HEADER_RGB } },
    alignment: { vertical: 'center', horizontal: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: BORDER_LIGHT_RGB } },
      bottom: { style: 'thin', color: { rgb: BORDER_LIGHT_RGB } },
      left: { style: 'thin', color: { rgb: BORDER_LIGHT_RGB } },
      right: { style: 'thin', color: { rgb: BORDER_LIGHT_RGB } },
    },
  },
};

export function styleSheetHeaderBanner(ws: any, colCount: number) {
  const a1 = ws['A1'];
  if (a1) a1.s = baseStyles.titleBanner;

  const a2 = ws['A2'];
  if (a2) a2.s = baseStyles.subBanner;

  for (let c = 0; c < colCount; c++) {
    const cellRef = XLSX.utils.encode_cell({ r: 2, c });
    if (ws[cellRef]) {
      ws[cellRef].s = baseStyles.headerCell;
    }
  }
}

export function applyRowStyles(
  ws: any,
  startRow: number,
  endRow: number,
  colCount: number
) {
  for (let r = startRow - 1; r <= endRow - 1; r++) {
    for (let c = 0; c < colCount; c++) {
      const cellRef = XLSX.utils.encode_cell({ r, c });
      if (ws[cellRef]) {
        ws[cellRef].s = baseStyles.dataCell;
      }
    }
  }
}

export function styleTutorialSheet(
  ws: any,
  sampleHeaderRowIdx: number,
  sampleColCount: number
) {
  if (ws['A1']) {
    ws['A1'].s = {
      font: { name: 'Calibri', sz: 16, bold: true, color: { rgb: NAVY_HEADER_RGB } },
    };
  }

  if (ws['A2']) {
    ws['A2'].s = {
      font: { name: 'Calibri', sz: 10, bold: false, color: { rgb: GRAY_TEXT_RGB } },
    };
  }

  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:Z100');
  for (let r = range.s.r; r <= range.e.r; r++) {
    const aCell = ws[XLSX.utils.encode_cell({ r, c: 0 })];
    if (aCell && typeof aCell.v === 'string') {
      const val = aCell.v.trim();
      if (
        val.startsWith('1. CARA') ||
        val.startsWith('2. PENJELASAN') ||
        val.startsWith('3. CONTOH') ||
        val.startsWith('4. CATATAN') ||
        val.startsWith('DAFTAR KODE') ||
        val.startsWith('1. HOW') ||
        val.startsWith('2. COLUMN') ||
        val.startsWith('3. FILLING') ||
        val.startsWith('4. IMPORTANT') ||
        val.startsWith('CURRENT ACTIVE')
      ) {
        aCell.s = baseStyles.sectionBanner;
      }
    }

    const bCell = ws[XLSX.utils.encode_cell({ r, c: 1 })];
    if (aCell && aCell.v === 'No' && bCell && bCell.v === 'Column') {
      for (let c = 0; c < 5; c++) {
        const ref = XLSX.utils.encode_cell({ r, c });
        if (ws[ref]) ws[ref].s = baseStyles.tableHeaderSoft;
      }
    }

    if (
      aCell &&
      (typeof aCell.v === 'number' || (typeof aCell.v === 'string' && /^\d+$/.test(aCell.v)))
    ) {
      aCell.s = baseStyles.boldCellCenter;
      for (let c = 1; c < 5; c++) {
        const ref = XLSX.utils.encode_cell({ r, c });
        if (ws[ref]) ws[ref].s = baseStyles.dataCell;
      }
    }
  }

  for (let c = 0; c < sampleColCount; c++) {
    const ref = XLSX.utils.encode_cell({ r: sampleHeaderRowIdx - 1, c });
    if (ws[ref]) {
      ws[ref].s = baseStyles.headerCell;
    }
  }
}
