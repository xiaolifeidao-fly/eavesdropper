import { ActionType } from '@ant-design/pro-components';
import { MutableRefObject } from 'react';

type RefreshPage = {
  refreshPage: (
    actionRef: MutableRefObject<ActionType | undefined>,
    isDelete: boolean,
    num?: number,
  ) => void;
};

const useRefreshPage = (): RefreshPage => {
  // 刷新页面
  const refreshPage = (
    actionRef: MutableRefObject<ActionType | undefined>,
    isDelete: boolean,
    num?: number,
  ) => {
    if (!actionRef?.current?.pageInfo) {
      return;
    }
    const { total, current, pageSize } = actionRef.current?.pageInfo;
    if (isDelete && current > 1 && total - (current - 1) * pageSize === num) {
      if (actionRef.current.setPageInfo) {
        actionRef.current.setPageInfo({
          current: current === 1 ? 1 : current - 1,
        });
      }
    } else {
      actionRef.current.reload();
    }
  };

  return { refreshPage };
};

export default useRefreshPage;
