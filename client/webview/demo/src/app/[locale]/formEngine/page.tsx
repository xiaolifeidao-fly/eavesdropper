'use client';
import Layout from 'demo/src/components/Layout';
import styles from './index.module.less';


const FormEnginePage = () => {
    return <Layout curActive='/formEngine'>
        <div className={styles.formEngineWrap}>
            <iframe src="https://turntip.cn/formManager/editor"></iframe>
        </div>
    </Layout>
    
}

export default FormEnginePage