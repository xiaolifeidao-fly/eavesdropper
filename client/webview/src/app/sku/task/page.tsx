'use client'
import { useEffect, useRef, useState } from 'react';
import { Tag, Button, message, Modal } from 'antd';
import { ProTable, type ActionType, type ProColumns } from '@ant-design/pro-components';
import Layout from '@/components/layout';
import styles from './index.module.less';

import useRefreshPage from '@/components/RefreshPage'
import { getSkuTaskPage as getSkuTaskPageApi, GetSkuTaskStatusLabelValue } from '@api/sku/skuTask.api';
import { getResourceSourceList } from '@api/resource/resource.api';
import { transformArrayToObject } from '@utils/convert'
import { SkuTaskStatus } from '@model/sku/skuTask'
import { SkuTaskItemList, StatsTags } from './components'
import { TaskApi } from '@eleapi/door/task/task';
import SkuPushStepsForm from '../components/SkuPushSteps';

const pollingTime = 20*1000
type DataType = {
  id: number;
  sourceAccount: string;
  shopName: string;
  skuName: string;
  publishTime: string;
  publishStatus: number;
  url: string;
  publishUrl: string;
}


export default function SkuTaskManage() {

  const actionRef = useRef<ActionType>();

  const [sourceMap, setSourceMap] = useState<Record<string, any>>();
  const [statusMap, setStatusMap] = useState<Record<string, any>>();
  const [showItemList, setShowItemList] = useState<boolean>(false)
  const [showTaskId, setShowTaskId] = useState<number>(0)
  const [currentRecord, setCurrentRecord] = useState<any>({})

  const [visible, setVisible] = useState(false);

  const { refreshPage } = useRefreshPage();



  useEffect(() => {
    getResourceSourceList().then(resp => {
      const result = transformArrayToObject(resp)
      setSourceMap(result)
    })
    GetSkuTaskStatusLabelValue().then(resp => {
      const result = transformArrayToObject(resp)
      setStatusMap(result)
    })
  }, [])

  // 查看任务
  const handleView = (record: any) => {
    setShowItemList(true)
    setShowTaskId(record.id)
    setCurrentRecord(record)
  }

  // 停止任务
  const handleStop = async (taskId: number) => {
    const taskApi = new TaskApi()
    await taskApi.stop(taskId)
    message.success('停止任务成功')
    refreshPage(actionRef, false)
  }

  // 重新发布
  const handleRepublish = (taksId: number) => {
    const taskApi = new TaskApi()
    taskApi.republishTask(taksId)
    message.success(`重新发布任务`)
    refreshPage(actionRef, false)
  }

  // 继续发布
  const handleContinue = (taksId: number) => {
    const taskApi = new TaskApi()
    taskApi.continueTask(taksId)
    message.success(`继续发布任务`)
    refreshPage(actionRef, false)
  }

  const columns: ProColumns[] = [
    {
      title: '发布批次',
      dataIndex: 'id',
      search: false,
      key: 'id',
      align: 'center'
    },
    {
      title: '店铺名称',
      dataIndex: 'shopName',
      search: false,
      key: 'shopName',
      align: 'center'
    },
    {
      title: '时间',
      search: false,
      key: 'createdAt',
      align: 'center',
      dataIndex: 'createdAt',
    },
    {
      title: '发布来源',
      key: 'source',
      align: 'center',
      valueType: 'select',
      valueEnum: sourceMap,
      render: (_, record) => {
        return (
          <Tag color={record.sourceLableValue.color}>
            {record.sourceLableValue.label}
          </Tag>
        )
      }
    },
    {
      title: '状态',
      search: true,
      key: 'status',
      align: 'center',
      valueType: 'select',
      valueEnum: statusMap,
      render: (_, record) => {
        return (
          <Tag color={record.statusLableValue.color}>
            {record.statusLableValue.label}
          </Tag>
        )
      }
    },
    {
      title: '发布统计',
      search: false,
      key: 'count',
      align: 'center',
      render: (_, record) => {
        return (
          <StatsTags record={record} />
        )
      }
    },
    {
      title: '操作',
      search: false,
      align: 'center',
      key: 'operate',
      render: (_, record) => {
        return (
          <div style={{ display: 'flex', gap: '4px' }}> {/* 设置间距为 4px */}
            <Button
              type="link"
              onClick={() => handleView(record)} // 查看操作
              style={{ display: 'inline-block', paddingRight: '4px' }} // 缩小右边距
            >
              查看
            </Button>
            {(record.status === SkuTaskStatus.DONE || record.status === SkuTaskStatus.ERROR || record.status === SkuTaskStatus.PENDING) && (
              <Button
                type="link"
                onClick={() => handleRepublish(record.id)} // 重新发布操作
                style={{ color: '#ffa500', display: 'inline-block', paddingLeft: '4px' }} // 橘黄色
              >
                重新发布
              </Button>
            )}
            {record.status === SkuTaskStatus.RUNNING && (
              <Button
                type='link'
                onClick={() => handleStop(record.id)} // 停止操作
                style={{ color: '#f00', display: 'inline-block', paddingLeft: '4px' }} // 红色按钮
              >
                停止
              </Button>
            )}
            {(record.status === SkuTaskStatus.STOP && (
              <Button
                type="link"
                onClick={() => handleContinue(record.id)} // 重新发布操作
                style={{ color: '#52c41a', display: 'inline-block', paddingLeft: '4px' }} // 绿色按钮
              >
                继续执行
              </Button>
            ))}
          </div>
        )
      }
    }
  ]

  return (
    <Layout curActive='/sku/task'>
      <main className={styles.userWrap}>
        <div className={styles.content}>
          <ProTable
            rowKey="id"
            headerTitle="商品任务管理"
            columns={columns}
            actionRef={actionRef}
            options={false}
            toolBarRender={() => [
              <Button key="export" onClick={() => {
                setVisible(true);
              }}>
                发布商品
              </Button>,
            ]}
            request={async (params) => {
              const { data: list, pageInfo } = await getSkuTaskPageApi({
                ...params,
                current: params.current ?? 1,
                pageSize: params.pageSize ?? 10,
              })
              const taskApi = new TaskApi()
              const newList = await taskApi.rebuildTaskList(list)
              return {
                data: newList,
                success: true,
                total: pageInfo.total,
              };
            }}
            polling={pollingTime}
            pagination={{
              pageSize: 10,
            }}
          />
        </div>
      </main>

      {showItemList && showTaskId !== 0 && (
        <Modal
          open={showItemList}
          title={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
              <span>批次{showTaskId}任务明细</span>
              <StatsTags record={currentRecord} tagWidth={30} gap={4} />
            </div>}
          width={1200}
          onCancel={() => {
            setShowItemList(false)
            setCurrentRecord({})
          }}
          onOk={() => {
            setShowItemList(false)
            setCurrentRecord({})
          }}
        >
          <SkuTaskItemList taskId={showTaskId}/>
        </Modal>
      )}
       {/* 发布商品 */}
       <SkuPushStepsForm visible={visible} setVisible={setVisible} onClose={() => {
            refreshPage(actionRef, false);
          }} />
    </Layout>
  );
}