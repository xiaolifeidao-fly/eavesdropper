import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export const ORIGINAL_VOICE = "ORIGINAL_VOICE";
export const NARRATION = "NARRATION";

export class Subtitle {
    id: number;
    startTime: number;
    endTime: number;
    description: string;
    type : string;
    key : string;
    avgSpeed : string | undefined;

    constructor(id: number, startTime: number, endTime: number, description: string, type : string, key?: string, avgSpeed?: string) {
        this.id = id;
        this.startTime = startTime;
        this.endTime = endTime;
        this.description = description;
        this.type = type
        if(key == null){
            this.key = uuidv4();
        }else{
            this.key = key
        }
        if(this.description == null){
            return;
        }
        if(avgSpeed == null || avgSpeed == undefined){
            const tempAvgSpeed :number = 1/((this.endTime -this.startTime)/this.description.length/1000);
            this.avgSpeed = tempAvgSpeed.toFixed(2);
        }else{
            this.avgSpeed = avgSpeed;
        }
    };
}

export function toSubtitles(data: string): Subtitle[] {
    const subtitles: Subtitle[] = [];
    const pattern = /(\d+)\n(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})\n(.*?)\n\n/gs;
    let match;
    while ((match = pattern.exec(data)) !== null) {
        const id = parseInt(match[1]);
        const startTime = timeToMilliseconds(match[2]);
        const endTime = timeToMilliseconds(match[3]);
        const description = match[4].trim();
        const subtitle: Subtitle = new Subtitle(id, startTime, endTime, description, NARRATION, uuidv4());
        subtitles.push(subtitle);
    }

    return subtitles;
}

export function mergeSrt(subtitles : Subtitle[][]){
    let currentStart = 0;
    let currentEnd = 0;
    const mergeSrt : Subtitle[] = [];
    for(const subtitleArray  of subtitles){
        for(const subtitle of subtitleArray){
            currentEnd = currentEnd + subtitle.endTime - subtitle.startTime;
            subtitle.startTime = currentStart;
            subtitle.endTime = currentEnd;
            currentStart = currentEnd;
            console.log(subtitle);
            mergeSrt.push(subtitle);
        }
    }
    return mergeSrt;
}

function timeToMilliseconds(timeStr: string): number {
    const [hours, minutes, secondsMilliseconds] = timeStr.split(':');
    const [seconds, milliseconds] = secondsMilliseconds.split(',').map(Number);
    return parseInt(hours) * 3600 * 1000 + parseInt(minutes) * 60 * 1000 + seconds * 1000 + milliseconds;
}

