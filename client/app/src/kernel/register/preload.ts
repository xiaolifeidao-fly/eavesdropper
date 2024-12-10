
// const { contextBridge, ipcRenderer } = require('electron');




// contextBridge.exposeInMainWorld('shopAPI', {
//   getShopData: () => ipcRenderer.invoke('get-shop-data'),

//   // send: (channel, data) => ipcRenderer.send(channel, data),
//   // receive: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
// });


// contextBridge.exposeInMainWorld('electronAPI', {
//   startProduce: (filePath: string, materialId: number, segmentKey: string) => ipcRenderer.invoke('start-produce', filePath, materialId, segmentKey),

//   getProduceStatus: (segmentKey : string) => ipcRenderer.invoke('get-produce-status', segmentKey),

//   produceIsFinish: (segmentKey : string) => ipcRenderer.invoke('produce-is-finish', segmentKey),

//   getProduceProgressPercent: (segmentKey : string) => ipcRenderer.invoke('get-produce-progress-percent', segmentKey),
  
//   cancelProduceStatus: (segmentKey : string) => ipcRenderer.invoke('cancel-produce-status', segmentKey),

//   openFile: (filePath : string) => ipcRenderer.invoke('open-file', filePath),

//   batchExport: (materailId : number, videoPathList : string[], mergeSrtData : []) => ipcRenderer.invoke('batch-export', materailId, videoPathList, mergeSrtData),
// });



// contextBridge.exposeInMainWorld('windowsAPI', {
//   navigateBack: () => ipcRenderer.invoke('navigate-back'),
//   navigateForward: () => ipcRenderer.invoke('navigate-forward'),
//   openTargetWindow: (url : string, windowId : string = "targetWindow", views : string[] = [], independentSession : boolean = false, allowListener : boolean = false) => ipcRenderer.invoke('open-target-window', url, windowId, views, independentSession, allowListener)

// });



// contextBridge.exposeInMainWorld('sessionAPI', {

//   onTriggerSession: (callback: (sessionId : string, type: string, eventType : string, data : {}) => void) => {
//     ipcRenderer.on('trigger-session', (event, sessionId : string, type: string, eventType : string, data : {}) => {
//       callback(sessionId, type, eventType, data); // 将参数传递给回调函数
//     });
//   },

//   isBusy: (type : string) => ipcRenderer.invoke('session-is-busy', type),

//   sessionFlush: () => ipcRenderer.invoke('session-flush'),

//   registerSession: () => ipcRenderer.invoke('register-session'),


//   onTriggerStreamSession: (callback: (data : string) => void) => {
//     ipcRenderer.on('trigger-stream-session', (event, data: string) => {
//       callback(data); // 将参数传递给回调函数
//     });
//   },

// });

// contextBridge.exposeInMainWorld('storeAPI', {
//   set: (key : string, value : string) => ipcRenderer.invoke('set', key, value),
//   get: (key : string) => ipcRenderer.invoke('get', key),
// });

// contextBridge.exposeInMainWorld('windowViewAPI', {
//   executeJavaScript: (sessionId : string, code : string, view : string) => ipcRenderer.invoke('execute-javascript',sessionId, code, view),
//   show: (views : string[] = []) => ipcRenderer.invoke('show',views),
//   hide: (views : string[] = [], code : string, view : string) => ipcRenderer.invoke('hide',views),

// });




// contextBridge.exposeInMainWorld('taskAPI', {
//   getTaskResult: (materialId : number) => ipcRenderer.invoke('get-task-result', materialId),
//   startTask: (materialId : number, taskId : number, taskModel : string = TaskModel.TYPICAL) => ipcRenderer.invoke('start-task', materialId, taskId, taskModel),
//   stopTask: (materialId : number, taskId : number) => ipcRenderer.invoke('stop-task', materialId, taskId),
//   initTask: (materialId : number, taskId : number) => ipcRenderer.invoke('init-task', materialId, taskId),
//   getSegmentTask: (materialId : number) => ipcRenderer.invoke('get-segment-task', materialId),
//   completeSegmentTask: (materialId : number, segmentId : number, segmentTaskId:number, status : string, message : string) => ipcRenderer.invoke('complete-segment-task', materialId, segmentId, segmentTaskId, status, message),
// });




