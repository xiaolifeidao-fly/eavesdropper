'use client'
import Image from "next/image";
import Link from "next/link";
import { Button, Timeline } from "antd";
import styles from './page.module.css';


export default function Home() {


  return (
    <main className={styles.home}>
      <div className={styles.content}>
        <div><Link href="/dashboard"><Button type="primary">尝试</Button></Link></div>
      </div>
    </main>
  );
}
