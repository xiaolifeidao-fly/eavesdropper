'use client'
import Image from "next/image";
import Link from "next/link";
import { Button, Timeline } from "antd";
import styles from './page.module.css';

import { useAuth } from "@/context/AuthContext";

export default function Home() {

  const { user } = useAuth();

  return (
    <main className={styles.home}>
      <div className={styles.content}>
        <h2>{user?.nickname || '未登录'}</h2>
        <div><Link href="/dashboard"><Button type="primary">尝试</Button></Link></div>
      </div>
    </main>
  );
}
