'use client'
import { Table } from 'antd';

import { columns, data } from './column';
import AvaForm from './AvaForm';
import Layout from '@/components/Layout';
import styles from './index.module.less';

export default function UserManage() {
  return (
    <Layout curActive='/auth/user'>
      <main className={styles.userWrap}>
        <div className={styles.content}>
          <AvaForm />
          <div style={{ listStyle: 'none' }}>
            <h3>用户列表</h3>
            <Table columns={columns} dataSource={data} pagination={{ pageSize: 5 }} scroll={{ x: 1000 }} />
          </div>
        </div>
      </main>
    </Layout>
  );
}