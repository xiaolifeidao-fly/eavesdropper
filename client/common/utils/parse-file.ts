import * as XLSX from 'xlsx'

// parseXlsxFile 解析xlsx文件
// return: Promise<{ headers: any[], tableData: any[] }>
export const parseXlsxFile = (file: File): Promise<{ headers: any[], tableData: any[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (!e.target) {
        reject('File read error')
        return
      }

      const binaryStr = e.target.result as string
      const workbook = XLSX.read(binaryStr, { type: 'binary' })
      const sheetName = workbook.SheetNames[0] // 默认读取第一个工作表
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

      // 设置表头
      const headers = (jsonData[0] as string[]).map((header: string) => ({
        title: header,
        dataIndex: header,
        key: header
      }))

      // 设置数据
      const tableData = jsonData.slice(1).map((row: any, index: number) => {
        const rowData: any = {}
        headers.forEach((col: any, colIndex: number) => {
          rowData[col.dataIndex] = row[colIndex] || null
        })
        return { key: index, ...rowData }
      })

      // 解析成功，返回数据
      resolve({ headers, tableData })
    }

    reader.onerror = () => {
      reject('File read error')
    }

    reader.readAsBinaryString(file)
  })
}
