import { BrowserView, BrowserWindow, session } from "electron";
// import { registerSessionInterceptor } from "./session/session.manager";


export const DEFAULT_HEIGHT = 500;
export const DEFAULT_WIDTH= 500;

export class TargetView{
    windowId : string;
    viewType : string;
    view : BrowserView;
    sessionInstance? : Electron.Session;
    allowListener : boolean = false;


    constructor(windowId : string, viewType : string, view : BrowserView, sessionInstance? : Electron.Session, allowListener : boolean = false) {
        this.windowId = windowId;
        this.viewType = viewType;
        this.view = view;
        if(sessionInstance){
            this.sessionInstance = sessionInstance;
        }
        if(allowListener){
            this.allowListener = allowListener;
        }
    }

    init(){
        if(this.sessionInstance && this.allowListener){
            // registerSessionInterceptor(this.windowId, this.sessionInstance);
        }
    }

    release(){
        if(this.sessionInstance && this.allowListener){
            // registerSessionInterceptor(this.windowId, this.sessionInstance);
        }
    }
}

export class TargetWindow {

    windowId : string;
    
    window : BrowserWindow;
    views : TargetView[]

    constructor(windowId : string, window : BrowserWindow,  views : TargetView[]) {
        this.windowId = windowId;
        this.window = window;
        this.views = views;
    }

    getView(viewType : string){
        for(let view of this.views){
            if(view.viewType == viewType){
                return view.view;
            }
        }
        return undefined;
    }

}

export let mainWindow: BrowserWindow | null = null;


const targetWindows : any = {};

export let updateWindow: BrowserWindow | null = null;

export let gatherToolWindow: BrowserWindow;

export const setMainWindow = (window: BrowserWindow)=>{
    mainWindow = window;
}

export const setUpdateWindow = (window: BrowserWindow)=>{
    updateWindow = window;
}

export let gatherToolView: BrowserView;

export const setGatherToolView = (view: BrowserView) => {
    gatherToolView = view
}

export const getGatherToolView = (): BrowserView => {
    return gatherToolView;    
}

export let gatherPreviewView: BrowserView;

export const setGatherPreviewView = (view: BrowserView) => {
    gatherPreviewView = view
}

export const getGatherPreviewView = (): BrowserView => {
    return gatherPreviewView;    
}


export const setGatherToolWindow = (window: BrowserWindow) => {
    gatherToolWindow = window
}




export const getGatherToolWindow = (): BrowserWindow => {
    return gatherToolWindow;    
}

export function getTargetWinodw(windowId: string): TargetWindow{
    return targetWindows[windowId];
}


export let gatherWindow: BrowserView;

export function getGatherWindow(): BrowserView{
    return gatherWindow;
}

export function setGatherWindow(window: BrowserView){
    gatherWindow = window;
}

export let pxxDetailWindow: BrowserWindow;

export function getPxxDetailWindow(): BrowserWindow{
    return pxxDetailWindow;
}

export function setPxxDetailWindow(window: BrowserWindow){
    pxxDetailWindow = window;
}



export const addTargetWindow = (windowId : string, window : BrowserWindow, views : TargetView[])=>{
    const targetWindow = new TargetWindow(windowId, window, views);
    for(const view of views){
        view.init();
    }
    targetWindows[windowId] = targetWindow;
}

export const removeTargetWindow = (windowId: string)=>{
    if(windowId in targetWindows){
        const targetWindow : TargetWindow = targetWindows[windowId];
        for(const view of targetWindow.views){
            view.release();
        }
    }
}

