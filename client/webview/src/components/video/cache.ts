import { Subtitle } from "@/utils/srt";
import storeInstance from "@/utils/store";
import { plainToInstance } from "class-transformer";



export function getVideoPath(key : string, materialId: number): string | null{
   return storeInstance.getItem(`${materialId}_${key}`); 
}

export function setVideoPath(key : string, materialId : number, videoPath: string): void{
    storeInstance.setItem(`${materialId}_${key}`, videoPath);
}


export function getVideoSrt(key : string, materialId: number): Subtitle[]{
    const data = storeInstance.getItem(`${materialId}_${key}`); 
    if(data == null){
        return [];
    }
    const dataJson : {}[]= JSON.parse(data);
    const result : Subtitle[] = [];
    for (let value of dataJson) {
        const itemInstance : Subtitle = plainToInstance(Subtitle, value);
        result.push(itemInstance);
    }
    return result
 }

export function getVideoDuration(key : string, materialId: number){
    const result = storeInstance.getItem(`${materialId}_${key}_duration`);
    if(!result){
        return undefined;
    }
    return Number(result);
}

export function setVideoDuration(key : string, materialId: number, duration : number){
    storeInstance.setItem(`${materialId}_${key}_duration`, duration);
}
 
export function setVideoSrt(key : string, materialId : number, content: Subtitle[]): void{
    storeInstance.setItem(`${materialId}_${key}`, toJsonString(content));
}

export class Segment {
    id : string;
    title: string;
    start: number;
    end: number;
    select : boolean;

    constructor(id : string, title : string, start : number, end : number, select : boolean){
        this.id = id;
        this.title = title;
        this.start = start;
        this.end = end;
        this.select = select;
    }
}

  
export function getVideoSegment(key : string, materialId: number): Segment[]{
    const segments = storeInstance.getItem(`${materialId}_${key}`); 
    if (segments == null || segments.length == 0){
        return [];
    }
    const segmentsJson : {}[]= JSON.parse(segments);
    const data : Segment[] = []
    for (let value of segmentsJson) {
        const itemInstance : Segment = plainToInstance(Segment, value);
        data.push(itemInstance);
    }
    return data;
 }
 
export function setVideoSegment(key : string, materialId : number, segments: Segment[]): void{
    storeInstance.setItem(`${materialId}_${key}`, toJsonString(segments));
}


export function removeVideoSegment(key : string, materialId : number): void{
    storeInstance.removeItem(`${materialId}_${key}`);
}

function toJsonString(data : any){
    const json_string = JSON.stringify(data, null, 2);
    return json_string;
}
 
 

