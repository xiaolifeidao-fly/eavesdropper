import openpyxl


def get_data(filename, handler_row, sheet_name='Sheet1', min_row=1):
    workbook = None
    try:
        # 打开Excel文件
        result = []
        workbook = openpyxl.load_workbook(filename)
        # 选择要读取的工作表
        sheet = workbook[sheet_name]  # 替换成您的工作表名称
        # 读取单元格的数据
        # 遍历整个工作表
        for row in sheet.iter_rows(min_row, values_only=True):
            # 在这里，min_row=2表示从第二行开始读取数据，values_only=True表示只读取值而不读取公式
            if row is None:
                continue
            row_data = handler_row(row)
            if row_data is None:
                continue
            result.append(row_data)
        return result
    except Exception as e:
        raise e
    finally:
        if workbook is not None:
            workbook.close()
