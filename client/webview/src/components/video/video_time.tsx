'use client';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { Modal, Input, Spin } from 'antd';
import './video_time.css';
import { v4 as uuidv4 } from 'uuid';
import { Segment, getVideoSegment, setVideoSegment } from './cache';

import { Rnd, RndResizeCallback, RndResizeStartCallback } from 'react-rnd';
import { start } from 'repl';




interface ContextMenuState {
  x: number | string;
  y: number | string;
  items:{ label: string; key: string; onClick: (params : Segment) => void }[];
  params : Segment
}

interface TimeSliderProps {
  timeKey: string;
  materialId : number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  played: number;
  duration: number;
  allow_modal? : boolean;
  handleMarkerClick?: (segment: Segment) => void;
  removeMarker?: (segment: Segment) => void;
  multiSelectFlag? : boolean;
  segments : Segment[];
  setSegments:(segment: Segment[]) => void;
  defaultChose? : boolean; 
  rightMenuItems? : { label: string; key: string; onClick: (params : Segment) => void }[];
  editFlag? : boolean;
}

const TimeSlider: React.FC<TimeSliderProps> = ({
  timeKey,
  materialId,
  min,
  max,
  played,
  duration,
  onChange,
  handleMarkerClick = (segment: Segment) =>{},
  removeMarker = (segment: Segment) =>{},
  multiSelectFlag = false,
  segments,
  setSegments,
  defaultChose = false,
  rightMenuItems = [],
  editFlag = true
}) => {

  // const [markers, setMarkers] = useState<{ [key: number]: Marker }>({});

  const [loading, setLoading] = useState(true);
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);

  const [zoomLevelNum, setZoomLevelNum] = useState(1);

  const [draggingStart, setDraggingStart] = useState(false);
  const [draggingEnd, setDraggingEnd] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartValue, setDragStartValue] = useState(0);


  const minZoomLevel = 1;
  const maxZoomLevel = 100;
  const handleCut = () => {
    addSegment(played);
  };

  const addSegment = (time : number)=>{
    let newSegments: Segment[] = [];
    let copySegments: Segment[] = segments;
    if(copySegments.length == 0){
      const currentMin = getMin();
      const currentMax = getMax();
      if(currentMax > 0){
        copySegments.push({
          id: uuidv4(),
          title: '0',
          start: currentMin,
          end: currentMax,
          select: defaultChose,
        });
      }
    }
    let preTimePushFlag = false;
    copySegments.forEach((segment) => {
      if(segment.start == 0 && segment.end == segment.start){
         return;
      }
      if (time > segment.start && time < segment.end) {
        newSegments.push({
          id: segment.id,
          title: segment.title,
          start: segment.start,
          end: time,
          select: segment.select,
        });
        newSegments.push({
          id: uuidv4(),
          title: '',
          start: time,
          end: segment.end,
          select: defaultChose,
        });
      } else{
        // If the segment is not affected, keep it as is
        if(time < segment.start && !preTimePushFlag){
          newSegments.push({
            id: uuidv4(),
            title: '',
            start: time,
            end: segment.start,
            select: defaultChose,
          });
          preTimePushFlag = true;
        }
        newSegments.push(segment);
      }
    });
    const maxSegment = newSegments[newSegments.length-1];
    if(maxSegment != null){
      if(time > maxSegment.end ){
        newSegments.push({
          id: uuidv4(),
          title: '',
          start: maxSegment.end,
          end: time,
          select: defaultChose,
        });
        if(time <= max){
          newSegments.push({
            id: uuidv4(),
            title: '',
            start: time,
            end: max,
            select: defaultChose,
          });
        }
    }
    }
   
    // Remove potential duplicates (same start and end)
    newSegments = newSegments.filter((segment, index, self) =>
      index === self.findIndex(s => s.start === segment.start && s.end === segment.end)
    );
    


    newSegments.forEach((segment,index) => {
      segment.title = `${index+1}`;
    });
    setSegments(newSegments);
  }

  const deleteSegment = () => {
    if(selectedSegment){
      // removeMarker(selectedSegment);
      // const newSegments = segments.filter((segment, index, self) =>
      //     segment.id != selectedSegment.id
      // );
      // setSegments(newSegments);
      let newSegments: Segment[] = [];

      let copySegments: Segment[] = segments;
      let start : number | null= null;
      let removeFlag = false;
      copySegments.forEach((segment) => {
          if(selectedSegment.id == segment.id){
            start = selectedSegment.start;
            return;
          }
          if(start != null && !removeFlag){
             segment.start = start;
             removeFlag = true;
          }
          newSegments.push(segment);
      });
      newSegments.forEach((segment,index) => {
        segment.title = `${index+1}`;
      });
      setSegments(newSegments);
    }
    // setSelectedSegment(null);
  };

 


  useEffect(() => {
    if(!editFlag){
      return;
    }
    if(selectedSegment){
        setVideoSegment(timeKey, materialId, segments);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedSegment]);


  useEffect(() => {
    if(!editFlag){
      return;
    }
    // setPreMinNum(getMinNum(preDecreaseFlag));
    // setPreMaxNum(getMaxNum(preDecreaseFlag));
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [played]);

  // useEffect(() => {
  //   setVideoMarkers(timeKey, materialId, markers);
  //   window.addEventListener('keydown', handleKeyDown);
  //   return () => {
  //     window.removeEventListener('keydown', handleKeyDown);
  //   };
  // }, [markers]);
 

  useEffect(() => {
    if(!editFlag){
      return;
    }
    if(loading){
      return;
    }
    setVideoSegment(timeKey, materialId, segments);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [segments]);

  // useEffect(() => {
  //   console.log(max)
  //   if(initData == undefined || initData.length ==0){
  //       // setSegments([]);
  //       return;
  //   }
  //   initSegmentData(initData)
  // },[initData]);
  
  const [refreshKey, setRefreshKey] = useState(0);

  const _handleMarkerClick = (event : any, segment: Segment) => {
    setSelectedSegment(segment);
    onChange(segment.start);
    if ((event.metaKey || event.ctrlKey) && multiSelectFlag) {
      if (segment.select){
          segment.select = false;
      }else{
          segment.select = true;
      }
    }
    setRefreshKey(prevKey => prevKey + 1); // 增加 key 的值来强制刷新
    handleMarkerClick(segment)
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCut();
    } else if (e.key === 'x') {
      deleteSegment();
    }
  };
  
  useEffect(() => {
    reset(); 
    if(!editFlag){
      return;
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };

  },[]);

 
  


  const [preMinNum, setPreMinNum] = useState<number>(min);
  const [preMaxNum, setPreMaxNum] = useState<number>(max);

  const [rightItemId, setRightItemId] = useState<string>();

  const onTimeChange = (number: number) => {
    // if (number >= (preMaxNum - 3) || number <= (preMinNum + 3)) {
    //   const minNum = getMinNum();
    //   setPreMinNum(minNum);
    //   const maxNum = getMaxNum();
    //   setPreMaxNum(maxNum);
    // }
    onChange(number);
  };

  const [preDecreaseFlag, setPreDecreaseFlag] = useState<boolean>(false);

  const onChangeZoomLevel = (number: number) => {
    if (number == minZoomLevel) {
      setPreMinNum(min);
      setPreMaxNum(max);
      return;
    }
    if(number > zoomLevelNum) {
        setPreDecreaseFlag(false);
        setPreMinNum(getMinNum(false));
        setPreMaxNum(getMaxNum(false));
    }else{
      setPreDecreaseFlag(true);
      setPreMinNum(getMinNum(true));
      setPreMaxNum(getMaxNum(true));
    }
    setZoomLevelNum(number);
  };

  const reset = async() => {
    // if(!loading){
    //   return;
    // }
    setPreMinNum(min);
    setPreMaxNum(max);

    // if(selectedSegment != undefined){
    //   if(played != selectedSegment.start){
    //     setSelectedSegment(null);
    //   }
    // }
    // if (played > preMaxNum) {
    //   setPreMaxNum(played);
    // }
    // if (played < preMinNum) {
    //   setPreMinNum(played);
    // }
    setLoading(false);
    
  };

  const initSegmentData = (data : Segment[])=>{
    if (data && data.length > 0) {
      setSegments(data);
    }else{
      setSegments([{
        id: uuidv4(),
        title: '0',
        start: 0,
        end: max,
        select: false,
      }]);
    }
  }

  const getMin = () => {
    if (preMinNum == 0) {
      return min;
    }
    return preMinNum;
  };

  const getMax = () => {
    if (preMaxNum == 0) {
      return max;
    }
    return preMaxNum;
  };

  const getMinNum = (decreaseFlag? : boolean) => {
    if (zoomLevelNum > minZoomLevel) {
      if (played == 0) {
        return min;
      }
      // let decreaseNum = (preMaxNum-preMinNum) / 10;
      let scale = 1;
      if(zoomLevelNum >= 50){
         scale = 10;
      }else if(zoomLevelNum > 10 && zoomLevelNum < 50){
        scale = 1;
      }
      let minNum = min;

      if(decreaseFlag){
         minNum = played  - (played)/(zoomLevelNum /10);
      }else{
         minNum = played  - (played)/zoomLevelNum;
      }
      if (minNum <= min) {
        return min;
      }
      // if(decreaseNum < 10) {
      //   decreaseNum = 10;
      // }
      return minNum;
    }
    return min;
  };

  const getMaxNum = (decreaseFlag? : boolean) => {
    if (zoomLevelNum < maxZoomLevel) {
      if (played == 0) {
        return max;
      }
      let maxNum = max;
      if(decreaseFlag){
        maxNum = played + played/zoomLevelNum*10;
      }else{
        maxNum = played + played/zoomLevelNum;
      }
      if (maxNum >= max) {
        return max;
      }
      return maxNum;
    }
    return max;
  };

  const getAppendNum = () =>{
    if(zoomLevelNum < 10){
        return (duration - played) /10
    }
    if(zoomLevelNum >= 10 && zoomLevelNum <=20){
      return played /20
    }
    if(zoomLevelNum >= 10 && zoomLevelNum <=20){
      return played /20
    }
  }

  const step = (getMaxNum() - getMinNum()) / duration;

  const getMarkgetLeft = (time: number) => {
    const maxNum = getMax();
    const minNum = getMin();
    if (time >= minNum && time <= maxNum) {
      return ((time - minNum) / (maxNum - minNum)) * 100;
    }

    if (time < minNum) {
      return -200;
    }
    return 200;
  };


  const sliderRef = useRef<HTMLDivElement>(null);

  const handleResizeEnd = (e: any, dir: any, ref: any,  delta: any, position : any, segment : Segment) => {
      if(!sliderRef.current){
        return;
      }
      const width = delta.width;
      const dragPlayed = width / sliderRef.current.clientWidth * (getMax() - getMin());
      if(dir == 'left'){
        let segmentStart = segment.start - dragPlayed;
        if(segmentStart <= getMin()){
           segmentStart = getMin();
        }
        segment.start = segmentStart;
        onChange(segmentStart);
      }else{
        let segmentEnd = segment.end + dragPlayed;
        if(segmentEnd >=getMax()){
          segmentEnd = getMax();
        }
        segment.end = segmentEnd;
        onChange(segmentEnd);
      }
      let newSegments = [];
      for(let segmentObj of segments){
         if(segmentObj.id == segment.id){
           newSegments.push(segment);
           continue;
         }         
         if((segment.start < segmentObj.start && segment.end > segmentObj.end) ){
            continue;
         }
         if(segment.start > segmentObj.start && segment.start < segmentObj.end){
            segmentObj.end = segment.start;;
         }
         if(segmentObj.start < segment.end && segmentObj.end > segment.end){
            segmentObj.start = segment.end;
         }
         newSegments.push(segmentObj);
      }
      setSegments(newSegments);
  };

  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const handleRightClick = (event: React.MouseEvent, segment : Segment) => {
    event.preventDefault();
    setRightItemId(segment.id);
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };



  const getMarkgets = () => {
    return segments.map((segment) => {
      let segmentStart = segment.start;
      let segmentEnd = segment.end;
      // console.log(segmentStart," getMarkgets " , segmentEnd)
      // if(segmentStart == 0 && segmentEnd <= 1){
      //     return <></>
      // }
      const uuid = uuidv4();
      let currentMinNum = preMinNum;
      let currentMaxNum = preMaxNum;
      if(currentMinNum == 0 && currentMaxNum == 0){
        currentMinNum = min;
        currentMaxNum = max;
      }
      if(segment.end < currentMinNum || segment.start > currentMaxNum) {
          return
      }
      if(segment.start < currentMinNum && segment.end > preMaxNum) {
        segmentStart = currentMinNum;
        segmentEnd = currentMaxNum;
      }
      if(segmentStart <= currentMinNum){
        segmentStart = currentMinNum;
      }
      if(segmentEnd >= currentMaxNum){
        segmentEnd = currentMaxNum;
      }


      const segmentWidth = ((segmentEnd - segmentStart) / (currentMaxNum-currentMinNum)) * 100;
      const segmentLeft = getMarkgetLeft(segmentStart);

      return (
          <div
            key = {uuid}
            className={getClassName(segment)}
            // onContextMenu={(event)=>handleRightClick(event, segment)}
            style={{
              width: `${segmentWidth}%`,
              left: `${segmentLeft}%`,
              ...getSelectStyle(segment)
            }}
            onClick={(event) => {
                _handleMarkerClick(event, segment);
            }}
            title={segment.title}
          >
      <Rnd
         default={{
          x: 0,
          y: 0,
          width: sliderRef.current ? sliderRef.current.offsetWidth * segmentWidth / 100 : 0,
          height:30,
        }}
      disableDragging={false}
      enableResizing={{
        top: false,
        right: true,
        bottom: false,
        left: true,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false,
      }}
      minHeight={30}
      className={getClassName(segment)}
      onResizeStop={(e, dir, ref, delta, position) => handleResizeEnd(e, dir, ref, delta, position, segment)}
      style={{ 
      left: `${segmentLeft}%`,
      ...getSelectStyle(segment)
      }}
    >
            {segment.title}
            </Rnd>
          </div>
      );
    });
  };

  const getSelectStyle = (segment : Segment) =>{
    if(selectedSegment != undefined && selectedSegment.id == segment.id){
      return {border : "1px solid #a3d7a6", borderRadius : "0px" };
    }
    return {};
  }

  const getClassName = (segment : Segment)=>{
    if (refreshKey>=0 && segment.select){
        return "select";
    }
    return "marker-segment";
  }

  return (
    <Spin spinning={loading}>
        <div key={`sugmentKey_${timeKey}`} className="time-slider" ref={sliderRef}>
          <input
            type="range"
            min={getMin()}
            max={getMax()}
            value={played}
            onChange={(e) => onTimeChange(parseFloat(e.target.value))}
            step={1 / zoomLevelNum}
            className="slider"
          />
          <input
            type="range"
            min={1}
            max={maxZoomLevel}
            value={zoomLevelNum}
            step = {1}
            onChange={(e) => onChangeZoomLevel(parseFloat(e.target.value))}
            className="zoom_slider"
          />
          <div className="slider-value time_range" style={{ left: '0%', marginTop: 20 }}>
            {formatTime(getMin())}
          </div>
          <div className="slider-value time_range" style={{ left: `${getMarkgetLeft(played) - 0.5}%`, marginTop: -10 }}>
            {formatTime(played)}
          </div>
          <div className="slider-value time_range" style={{ left: '99%', marginTop: 20 }}>
            {formatTime(getMax())}
          </div>
             {getMarkgets()}
        </div>
    </Spin>
  );
};
export{
  TimeSlider,
  Segment
} ;
