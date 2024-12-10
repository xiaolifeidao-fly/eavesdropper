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
        style={{ borderRadius: 6 }}
        priority
      />
      <div className={styles.content}>
        <p>
          desc
        </p>

        <h2>log.title</h2>

        <div className={styles.timeBox}>
          <Timeline
            items={[
              {
                children: 'log.1',
              },
              {
                children: 'log.2',
              },
              {
                children: 'log.3',
              },
              {
                color: 'orange',
                children: 'log.4',
              },
              {
                color: 'orange',
                children: 'log.5',
              },
              {
                color: 'orange',
                children: 'log.6',
              },
              {
                color: 'orange',
                children: 'log.7',
              }
            ]}
          />
        </div>

        <div><Link href="/dashboard"><Button type="primary">尝试</Button></Link></div>
      </div>
    </main>
  );
}
