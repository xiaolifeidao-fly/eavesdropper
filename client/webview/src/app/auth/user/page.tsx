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
          
        </div>
      </main>
    </Layout>
  );
}