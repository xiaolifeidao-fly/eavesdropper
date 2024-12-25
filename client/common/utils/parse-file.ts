import { read, utils } from 'xlsx';

export const parseXlsxFileClient = async (file: File): Promise<{ headers: any[], tableData: any[] }> => {
  const binaryStr = await file.arrayBuffer();
  const workbook = read(binaryStr, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = utils.sheet_to_json(worksheet, { header: 1 });

  const headers = (jsonData[0] as string[]).map((header: string) => ({
    title: header,
    dataIndex: header,
    key: header,
  }));

  const tableData = jsonData.slice(1).map((row: any, index: number) => {
    const rowData: any = {};
    headers.forEach((col: any, colIndex: number) => {
      rowData[col.dataIndex] = row[colIndex] || null;
    });
    return { key: index, ...rowData };
  });

  return { headers, tableData };
};

export const parseTxtFileClient = async (file: File): Promise<{ urls: string[] }> => {
  const text = await file.text();
  const urls = text.split('\n');
  return { urls };
};