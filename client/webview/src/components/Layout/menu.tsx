import { 
    FundOutlined, 
    LayoutOutlined, 
    BarChartOutlined, 
    DesktopOutlined, 
    ScheduleOutlined, 
    CalculatorOutlined, 
    UserOutlined, 
    WalletOutlined,
    BuildOutlined 
} from '@ant-design/icons';
import React from 'react';

const getNavList = () => {
    return [
        {
            key: '/shop',
            icon: <LayoutOutlined />,
            label: '商品管理'
        },
        
    ]
}

export default getNavList