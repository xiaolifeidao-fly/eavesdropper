'use client'
import { Table,  } from 'antd';
import { useState } from 'react';
import { columns, DataType } from './column';
import AvaForm from './AvaForm';
import Layout from '@/components/Layout';
import styles from './index.module.less';

// 搜索标签
const searchLabels = [
  {
    label: '手机号',
    key: 'mobile',
  }
]

export default function UserManage() {

  const [tableData, setTableData] = useState<DataType[]>([]);

  return (
    <Layout curActive='/auth/user'>
      <main className={styles.userWrap}>
        <div className={styles.content}>
          <div>
            
          </div>
          <AvaForm setTableData={setTableData}/>
          <div style={{ listStyle: 'none' }}>
            <h3>用户列表</h3>
            <Table columns={columns} dataSource={tableData} pagination={{ pageSize: 5 }} scroll={{ x: 1000 }} />
          </div>
        </div>
      </main>
    </Layout>
  );
}