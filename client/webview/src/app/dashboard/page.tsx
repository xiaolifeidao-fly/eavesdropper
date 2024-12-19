'use client'
import { Button, Empty } from 'antd';
import { useRouter } from 'next/navigation';

import Layout from '@/components/layout';
import styles from './index.module.less';

export default function Dashboard() {
  const router = useRouter();

  return (
    <Layout curActive='/order'>
      <main style={{ minHeight: 'calc(100vh - 260px)' }}>
        <Empty
          image="/landing.svg"
          imageStyle={{ height: 410, paddingTop: 160 }}
          description={"正在建设中......"}
        >
        </Empty>
      </main>
    </Layout>
  );
}