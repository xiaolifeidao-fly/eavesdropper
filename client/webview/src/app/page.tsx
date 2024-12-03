import Image from "next/image";
import Link from "next/link";
import { Button, Timeline } from "antd";
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.home}>
        <Image
          src="/favicon.png"
          alt="next-admin"
          width={120}
          height={60}
          style={{borderRadius: 6}}
          priority
        />
        <div className={styles.content}>

          <div><Link href="/dashboard"><Button type="primary">尝试</Button></Link></div>
        </div>
        
      
    </main>
  );
}
