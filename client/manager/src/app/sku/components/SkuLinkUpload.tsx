'use client'
import React, { useState, useRef } from 'react';
import { Tabs, message, Upload, Input } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';

import { parseTxtFileClient } from '@utils/parse-file';
import FileUploadList from './FileUploadList';
import type { UploadFile } from './FileUploadList';

interface ImportSkuProps {
  uploadUrlList: LinkInfo[];
  setUploadUrlList: (list: LinkInfo[]) => void;
}

export interface LinkInfo {
  uid: string;
  url: string;
}

const ImportSku: React.FC<ImportSkuProps> = ({ uploadUrlList, setUploadUrlList }) => {

  const [currentTab, setCurrentTab] = useState('file-import');
  const [uploadFileList, setUploadFileList] = useState<UploadFile[]>([]);
  // const [textAreaValue, setTextAreaValue] = useState<string>('');

  // 删除文件
  const onDelete = (item: UploadFile, index: number) => {
    setUploadFileList(uploadFileList.filter((_, i) => i !== index));

    // 删除上传列表
    setUploadUrlList(uploadUrlList.filter(item => item.uid !== item.uid));
  }

  // 添加或更新文件
  function addOrUpdateUploadFile(file: UploadFile) {
    const uid = file.uid;
    let index = -1;
    uploadFileList.find((item, i) => {
      if (item.uid === uid) {
        index = i;
        return true;
      }
      return false;
    });

    if (index !== -1) {
      uploadFileList[index] = file;
      setUploadFileList([...uploadFileList]);
    } else {
      setUploadFileList([...uploadFileList, file]);
    }
  }

  // 文件上传配置
  const props: UploadProps = {
    name: 'file',
    multiple: false, // 不允许多选
    showUploadList: false, // 不显示上传列表
    disabled: uploadFileList.length >= 1, // 最多支持1个文件
    beforeUpload: async (file) => { // 文件上传前处理
      if (uploadFileList.length >= 1) {
        message.error('最多支持1个文件同时上传');
        return false;
      }

      const uid = file.uid;
      const name = file.name;

      // 校验文件类型
      const fileType = file.type;
      const checkType = 
        fileType === 'text/plain';
        // fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        // fileType === 'application/vnd.ms-excel' ||
        // fileType === 'text/csv';

      if (!checkType) {
        message.error('请上传txt文件,每行一个链接');
        return Upload.LIST_IGNORE;
      }

      // 解析文件
      let err = false;
      let urlCount = 0;
      try {
        const { urls } = await parseTxtFileClient(file);
        // 将解析后的数据添加到上传列表
        const newUploadUrlList = urls.filter(item => item).map(item => ({
          uid: uid,
          url: item
        }));
        setUploadUrlList([...uploadUrlList, ...newUploadUrlList]);
        urlCount = urls.length;
      } catch (error) {
        console.error("解析文件失败: ", error);
        message.error('解析文件失败');
        err = true;
      }

      addOrUpdateUploadFile({ uid, name, urlCount, uploading: false, error: err });
      return false; // 阻止文件上传
    },
  };


  // const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  // const textAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  //   const value = e.target.value;
  //   setTextAreaValue(value);

  //   // 防抖逻辑
  //   if (debounceTimer.current) {
  //     clearTimeout(debounceTimer.current);
  //   }

  //   debounceTimer.current = setTimeout(() => {
  //     if (value.trim() === '') {
  //       setUploadUrlList([]);
  //       return;
  //     }

  //     // 解析链接
  //     const linkList = value.split('\n');
  //     const validLinkList = linkList.filter(link => link.trim() !== '');
  //     // 添加到上传列表
  //     setUploadUrlList([...validLinkList.map(link => ({ uid: Date.now().toString(), url: link }))]);
  //   }, 500); // 延迟 500 毫秒
  // };

  const importLinkTabs = () => {
    return [
      {
        key: 'file-import',
        label: '文件导入',
        children: <>
          <div style={{ overflowY: 'auto', }}>
            <Upload.Dragger
              {...props}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域</p>
              <p className="ant-upload-hint">支持txt文件,每行一个链接</p>
            </Upload.Dragger>
            <FileUploadList uploadFileList={uploadFileList} onDelete={onDelete} />
          </div>
        </>,
      },
      // {
      //   key: 'link-import',
      //   label: '链接导入',
      //   children: <>
      //     <Input.TextArea
      //       placeholder="请输入商品链接,每行一个"
      //       style={{ height: '300px', resize: 'none' }}
      //       value={textAreaValue}
      //       onChange={textAreaChange}
      //     />
      //   </>,
      // }
    ]
  }

  return (
    <>
      <Tabs defaultActiveKey={currentTab} onChange={setCurrentTab} items={importLinkTabs()} />
    </>
  )
}

export default ImportSku;