'use client';
import { Input, Spin, Table, theme } from 'antd';
import { useRouter } from 'next/navigation';
import styles from './index.module.less';
import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { getVideoPath, setVideoDuration, setVideoPath } from '@/components/video/cache';
import { key } from 'localforage';

interface VideoProps {
  videoKey : string;
  materialId : number;
  playerRef?: React.MutableRefObject<ReactPlayer | null>;
  onDuration?: (duration: number) => void;
  setPlayed?: Dispatch<SetStateAction<number>>
  allowUpload? : boolean;
  videoMarignTop? : string;
  defaultWidth ? : string;
  defaultHeight ? : string;

}

const Video : React.FC<VideoProps> = ({videoKey, materialId, playerRef,onDuration=()=>{},setPlayed=()=>{},allowUpload = true,videoMarignTop = "0px", defaultWidth, defaultHeight: defaultHegiht}) => {
  const { token } = theme.useToken();
  const handleProgress = (state: { played: number,playedSeconds:number }) => {
    if (!state.playedSeconds) return;
    if(setPlayed){
      setPlayed(state.playedSeconds);
    }
  };
  const [isClient, setIsClient] = useState(false)
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const handleFileChange = (event : any) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(file.path);
      setVideoPath(videoKey, materialId, file.path);
      // window.electron.send('file-upload', file.path); 
    }
  };
  const [selectedFile, setSelectedFile] = useState(null);

 

  const [isPlaying, setIsPlaying] = useState(false);

  // const handleKeyDown = (e: KeyboardEvent) => {
  //   if (e.key === ' ') {
  //      if(!isPlaying){
  //       setIsPlaying(true);
  //      }else{
  //         setIsPlaying(false);
  //      }
  //   }
  // };

  // useEffect(() => {
  //   document.addEventListener('keydown', handleKeyDown);
  //   return () => {
  //     document.removeEventListener('keydown', handleKeyDown);
  //   };
  // },[isPlaying])
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsClient(true);
    const lastFileUrl = getVideoPath(videoKey, materialId);
    setFileUrl(lastFileUrl);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [materialId])

  const initDuration = (duration: number)=>{
    setVideoDuration(videoKey, materialId, duration);
    onDuration(duration);
  }

  return (
      <Spin spinning = {!isClient}>
     
        <div   style={{ display: 'flex', flexDirection: 'column' }}>   
                <div style={{flex: '1 0 auto', marginTop : `${allowUpload ? videoMarignTop : "0px"}`}}>
                  {fileUrl  ? 
                  <ReactPlayer 
                    url={`localfile://${fileUrl}`}
                    style={{textAlign: "center"}}
                    controls
                    ref={playerRef}
                    width={defaultWidth}
                    height={defaultHegiht}
                    // onPlay={handleOnPlay}
                    // onPause={handleOnPause}
                    playing={isPlaying}
                    onProgress={handleProgress}
                    onDuration={onDuration}
                    />  : "未找到影片"
                  }
                </div>
                {allowUpload &&
                  <div  style={
                      {
                        marginTop:`${fileUrl ? "25px":"0px"}`
                      } 
                    }>
                    <input type="file" ref={fileInputRef} accept="video/*,audio/*" onChange={handleFileChange} />   
                  </div> }
          </div>
        </Spin>
  );
}
export default Video;
