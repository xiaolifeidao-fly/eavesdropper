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
            key: '/dashboard',
            icon: <DesktopOutlined />,
            label: '主页'
        },
        // {
        //     key: '/auth',
        //     icon: <UserOutlined />,
        //     label: '用户中心',
        //     children: [
        //         {
        //             key: '/auth/user',
        //             icon: <UserOutlined />,
        //             label: '用户管理'
        //         }
        //     ]
        // },
        {
            key: '/resource',
            icon: <LayoutOutlined />,
            label: '资源管理'
        },
        {
            key: '/shop',
            icon: <LayoutOutlined />,
            label: '店铺管理'
        },
        {
            key: '/sku',
            icon: <LayoutOutlined />,
            label: '商品管理'
        },
        // {
        //     key: '/shop2',
        //     icon: <LayoutOutlined />,
        //     label: '店铺管理2'
        // },
        
    ]
}

export default getNavList