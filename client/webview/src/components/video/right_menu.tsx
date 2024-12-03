import React from 'react';
import { Menu } from 'antd';
import { MenuInfo } from 'rc-menu/lib/interface';
import { Segment } from './cache';

interface ContextMenuProps<> {
  x: number | string;
  y: number| string;
  items: { label: string; key: string; onClick: (params : Segment) => void }[];
  params : Segment;
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, onClose, params }) => {
  const handleClick = (e: MenuInfo) => {
    const item = items.find(item => item.key === e.key);
    if (item) {
      item.onClick(params);
    }
    onClose();
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        zIndex: 1000,
        backgroundColor: 'white',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.15)',
      }}
      onClick={onClose}
    >
      <Menu onClick={handleClick}>
        {items.map(item => (
          <Menu.Item key={item.key}>{item.label}</Menu.Item>
        ))}
      </Menu>
    </div>
  );
};

export default ContextMenu;
