'use client';
import {Button, Dropdown, Form, Input, MenuProps, Modal, Popconfirm, Tag, theme } from 'antd';
import React, { ChangeEvent, ChangeEventHandler, useEffect, useRef, useState } from 'react';
import {toSubtitles, Subtitle, NARRATION, ORIGINAL_VOICE} from '@/utils/srt'

import { List } from 'antd';
import { getVideoSrt, setVideoSrt } from '@/components/video/cache';
import TextArea from 'antd/es/input/TextArea';
import './video_time.css';
import { DeleteOutlined, EditOutlined, FolderAddFilled } from '@ant-design/icons';
import Item from 'antd/es/list/Item';
import { it } from 'node:test';

interface VideoSrtProps {
  srtKey : string;
  materialId : number;
  played: number;
  onSeekChange: (seekTo: number) => void;
  srtData? : Subtitle[]
  uplodaFlag?: boolean;
  maxHeight?: string;
  editFlag? : boolean;
  duration: number;
  onload?:(subtitles : Subtitle[])=>void;
  handleItemClick? :(item : Subtitle)=>void;
  oprator?: React.ReactNode,
  hookPlayed?: boolean;
  // saveSrtData?(data : )
}
const VideoSrt: React.FC<VideoSrtProps> = ({srtKey, materialId, played, onSeekChange,srtData = [], uplodaFlag = true,maxHeight="400px", editFlag = false,handleItemClick, onload, oprator,duration, hookPlayed = true}) => {
  const { token } = theme.useToken();
  const listRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [srtDatas, setSrtDatas] = useState<Subtitle[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // if(forceRefreshKey){
  //   useEffect(()=>{
  //       setRefreshKey(prevKey => prevKey + 1); // 增加 key 的值来强制刷新
  //   },[forceRefreshKey])
  // }

  const listStyle: React.CSSProperties = {
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    padding: 12
  };


  function _handleItemClick(item: Subtitle): void {
      setClickFromItem(item);
      let seekTime = item.startTime/1000;
      if(seekTime < 1) {
          seekTime = 1;
      }
      onSeekChange(seekTime);
      if (listRef.current) {
        const listItemHeight = 48; // Adjust according to your list item height
        const scrollOffset = listRef.current.offsetHeight / 2 - listItemHeight / 2;
        const itemIndex = findSrtIndex(item);
        if (itemIndex > 0) {
          let scrollTo = itemIndex * listItemHeight - scrollOffset;
          listRef.current.scrollTo({ top: scrollTo, behavior: 'smooth' });
        }
      }
      if(handleItemClick != undefined){
        handleItemClick(item);
      }
  }

  function findSrtIndex(item : Subtitle){
      for (var index =0; index < srtDatas.length;index++){
          const srt = srtDatas[index];
          if(srt.startTime >= item.startTime){
            return index;
        }
      }
      return 0;
  }

  useEffect(() => {
    init();
    setLoading(false);
    // const handleKeyDown = (event: KeyboardEvent) => {
    //   if (event.code === 'Space') {
    //     // 如果按下的是空格键，阻止默认行为（滚动）
    //     // event.preventDefault();
    //   }
    // };
    // // 组件挂载时添加事件监听
    // window.addEventListener('keydown', handleKeyDown);

    // // 组件卸载时移除事件监听
    // return () => {
    //   window.removeEventListener('keydown', handleKeyDown);
    // };
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  },[materialId]);


  useEffect(() => {   
      if(srtData != null && srtData.length > 0){
        setSrtDatas(srtData)
        setVideoSrt(srtKey, materialId, srtData);
      } 
  },[srtData]);

  useEffect(() => { 
    if(onload != undefined){
        onload(srtDatas);
    }  
},[srtDatas]);

  async function init(){
    if(srtData != null && srtData.length > 0){
      setSrtDatas(srtData)
      return;
    }
    const subtitles = getVideoSrt(srtKey, materialId);
    setSrtDatas(subtitles);
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result as string;
        const initSubtitles = toSubtitles(data);
        setVideoSrt(srtKey, materialId, initSubtitles);
        setSrtDatas(initSubtitles);
      };
      reader.readAsText(file);
    }
  };

  useEffect(() => {
    if(hookPlayed){
      if (listRef.current) {
        const listElement = listRef.current;
        const activeItem = listElement.querySelector('.active-item') as HTMLElement;
        if (activeItem) {
          if(played*1000 <= srtDatas[0].startTime){
            return;
          }
          listElement.scrollTop = activeItem.offsetTop - (listElement.clientHeight / 4);
        }
      }
    }
  }, [played]);

  const handleTagClick = (item : Subtitle, type : string)=>{
      item.type = type;
      setRefreshKey(prevKey => prevKey + 1); // 增加 key 的值来强制刷新
  }
  const [editId, setEditId] = useState<number>();


  const [editModel, setEditModel] = useState<boolean>(false);
  const [currentEditValue, setCurrentEditValue] = useState<string>();

  const openEditModel = (item : Subtitle)=>{
    setCurrentEditValue(item.description);
    setEditId(item.id);
    setEditModel(true);
  }

  const closeEditModel = (item : Subtitle)=>{
    if(currentEditValue != undefined){
      item.description = currentEditValue;
    }
    setCurrentEditValue(undefined);
    setEditId(undefined);
    setEditModel(false);
    setRefreshKey(prevKey => prevKey + 1); // 增加 key 的值来强制刷新
  }

  useEffect(() => {
    if(srtDatas.length == 0){
       return;
    }
    setVideoSrt(srtKey, materialId, srtDatas);
  },[refreshKey]);


  // useEffect(() => {
  //   if(srtDatas.length == 0){
  //      return;
  //   }
  //   setVideoSrt(srtKey, materialId, srtDatas);
  // },[editId])

  const [addFromItem, setAddFromItem] = useState<Subtitle>();
  const [clickFromItem, setClickFromItem] = useState<Subtitle>();

  const editChange = (value : any, item : Subtitle)=>{
      setCurrentEditValue(value);
  }

  const addSrt = (item : Subtitle)=>{
      setAddStartTime(item.startTime/1000);
      setAddEndTime(played);
      setIsModalOpen(true);
      setAddFromItem(item);
  }

  const [deleteSrtId, setDeleteSrtId] = useState<number>();
 

  const deleteSrt = (item : Subtitle)=>{
        setDeleteSrtId(item.id);
        setDeleteOpen(true);
  }

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOk = () => {
    const newSubtitles : Subtitle[] = [];
    let addFlag = false;
    for(let subtitle of srtDatas){
      if(addFlag){
        subtitle.id = subtitle.id +1;
      }
      newSubtitles.push(subtitle);
      if(subtitle.id == addFromItem?.id){
        newSubtitles.push(new Subtitle(subtitle.id + 1, addStartTime*1000, addEndTime *1000, addContentValue, "旁白" ));
        addFlag = true;
      }
    }
    setSrtDatas(newSubtitles);
    setIsModalOpen(false);
    setRefreshKey(prevKey => prevKey + 1); // 增加 key 的值来强制刷新
    setAddFromItem(undefined);
    setAddContentValue("");
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setAddFromItem(undefined);
  };

  const [deleteOpen, setDeleteOpen] = useState(false);

  const deleteSrtOk = () => {
    const newSubtitles : Subtitle[] = [];
    for(let subtitle of srtDatas){
      if(subtitle.id == deleteSrtId){
        continue;
      }
      newSubtitles.push(subtitle);
    }
    setSrtDatas(newSubtitles);
    setRefreshKey(prevKey => prevKey + 1); // 增加 key 的值来强制刷新
  };

  const [addStartTime, setAddStartTime] = useState(0);
  const [addEndTime, setAddEndTime] = useState(0);
  const [addContentValue, setAddContentValue] = useState("");

  const onChangeAddStartTime = (value : number) => {
      setAddStartTime(value);
      onSeekChange(value);
  }

  const onChangeAddEndTime = (value : number) => {
      setAddEndTime(value);
      onSeekChange(value);
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getAvgSpeed = (item : Subtitle) =>{
       const avgSpeed :number = 1/((item.endTime -item.startTime)/item.description.length/1000);
       const result = avgSpeed.toFixed(2);
       if(result == undefined){
          return "";
       }
       return result;
  }
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getChoseActive = (item : Subtitle) =>{
     if(hookPlayed && (played * 1000 >= item.startTime && played * 1000 < item.endTime)){
        return true;
     }
     if(!hookPlayed && (clickFromItem && clickFromItem.id == item.id)){
        return true;
     }
     return false;
  }

  const getChoseActiveColor = (item : Subtitle) =>{
    if(clickFromItem && clickFromItem.id == item.id){
      return "#5482f6";
    }
    if(hookPlayed && (played * 1000 >= item.startTime && played * 1000 < item.endTime)){
       return "green";
    }
    return "inherit";
 }

  return (
    <div ref={listRef} style={{ overflowY: 'auto', maxHeight: maxHeight,textAlign:`${editFlag ? "left" :"center"}` }}>
         {uplodaFlag && <div  style={{position:"absolute", textAlign:"left",margin:"10px 10px"}}>
          <input type="file" accept=".srt" ref={fileInputRef}  onChange={handleFileChange}/>
        </div>}
         <List
        //  key = {refreshKey}
        style={{flex:"0.9 0 auto", marginTop:`${uplodaFlag ? "50px" : "30px"}`}}
         itemLayout="horizontal"
         dataSource={srtDatas}
         renderItem={(item : Subtitle, index) => (
           <div style = {{display :"flex", flexDirection:"row",margin :"5px 5px"}}>

           {editModel && item.id == editId ? <TextArea style={{flex : "1 0"}} onChange={(event : React.ChangeEvent<HTMLTextAreaElement>)=> editChange(event.currentTarget.value, item)} value={currentEditValue}></TextArea> :
           <List.Item
            onClick={() => _handleItemClick(item)}
            style={{flex : `${editFlag ? "0.9 0 auto" : "1 0 auto"}`}}
            className={getChoseActive(item) ? 'active-item' : ''}
            >
              <List.Item.Meta 
                description={
                        <div 
                        style={{
                                color: getChoseActiveColor(item),
                            }}>
                              {item.description}
                              <span style={{color:"orange"}}>({item.avgSpeed})</span>
                        </div>}
                          />
           </List.Item>
            }
            {editFlag && refreshKey >=0 && 
              <div style={{marginTop:"10px"}}>
                  { !editModel &&<Tag icon={<FolderAddFilled/>} onClick={()=>addSrt(item)}>添加</Tag>}
                 { editModel && item.id == editId ? <Tag icon={<EditOutlined/>} onClick={()=>closeEditModel(item)}>保存</Tag> : <Tag icon={<EditOutlined/>} onClick={()=>openEditModel(item)}>编辑</Tag>}
                 { !editModel &&
                    <>
                    <Popconfirm
                            title="删除"
                            description="确认要删除吗"
                            onConfirm={deleteSrtOk}
                        // onOpenChange={() => console.log('open change')}
                      >
                          <Tag icon={<DeleteOutlined/>} onClick={()=>deleteSrt(item)}>删除</Tag>
                    </Popconfirm>
                    <Tag
                      onClick={() => handleTagClick(item, NARRATION)}
                      color={(item.type == NARRATION || item.type == undefined) ? "green" : "blue"}
                      >
                        旁白
                    </Tag>
                    <Tag
                      onClick={() => handleTagClick(item, ORIGINAL_VOICE)}
                      color={item.type == ORIGINAL_VOICE ? "green" : "blue"}
                      >
                        原声
                    </Tag>
                    </>
                 }

              </div>
           }
           </div>
         )}
       />
        <Modal open={isModalOpen} onOk={handleOk} onCancel={handleCancel} width={800} style={{marginTop : "300px"}}>
                <TextArea value={addContentValue} name="addContent" size={'large'} onChange={(event : React.ChangeEvent<HTMLTextAreaElement>)=> setAddContentValue(event.currentTarget.value)}></TextArea>
                <div className="time-slider" >
                <input
                  type="range"
                  min={0}
                  value={addStartTime}
                  style={{marginTop:40,width:"100%"}}
                  max={duration}
                  onChange={(e) => onChangeAddStartTime(parseFloat(e.target.value))}
                  name='startTime'
                />
                <div className="slider-value time_range" style={{ left: `${addStartTime/duration}%`, marginTop: 20 }}>
                  {formatTime(addStartTime)}
                </div>

                <input
                  type="range"
                  min={0}
                  max={duration}
                  value={addEndTime}
                  style={{marginTop:40,width:"100%"}}
                  name='endTime'
                  onChange={(e) => onChangeAddEndTime(parseFloat(e.target.value))}
                />
                <div className="slider-value time_range" style={{ left: `${addEndTime/duration}%`, marginTop: 80 }}>
                  {formatTime(addEndTime)}
                </div>
                </div>
       </Modal>
       {/* <Modal
          open={deleteOpen}
          onOk={deleteSerOk}
          onCancel={hideDeleteModal}
          okText="确认"
          cancelText="取消"
        >
      </Modal> */}
      </div>
  );
}
export { VideoSrt}


