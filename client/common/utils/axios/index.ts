import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { plainToClass,plainToInstance } from 'class-transformer';
import { getItem } from '@utils/store/web';
const REQUEST_HEADER_TOKEN = 'Authorization'
import * as dotenv from 'dotenv';
const path = require('path');
dotenv.config({path: path.join(__dirname, '.env')}); // 加载 .env 文件中的环境变量

// 定义一个 HttpError 类，扩展自 Error
class HttpError extends Error {
  code?: any;

  constructor(message: string, code?: any) {
    super(message);
    this.name = 'HttpError';
    if (code != null) {
      this.code = code;
    }
  }
}

// 抛出 http 异常
function rejectHttpError(message: string, code?: any): Promise<never> {
  const error = new HttpError(message, code);
  return Promise.reject(error);
}

function getBaseUrl() {
  try{
    console.log("process.env.APP_URL_PREFIX", "start ");
    // @ts-ignore
    if(window != undefined){
      //@ts-ignore
      return process.env.APP_URL_PREFIX;
    }
    console.log("process.env.APP_URL_PREFIX", "dddd");
    //@ts-ignore
    return process.env.APP_URL_PREFIX;
  }catch(e){
    console.log("process.env.SERVER_TARGET", e);
    //@ts-ignore
    return process.env.SERVER_TARGET + process.env.APP_URL_PREFIX;
  }
}

const instance: AxiosInstance = axios.create({
  timeout: 60000,
  // baseURL: '',
  //@ts-ignore
  baseURL: "http://101.43.28.195:8081/api",
  withCredentials: true,
  // 登录成功后，设置请求头 Authorization
  // headers: {
  //   Authorization: ""
  // },
});


// 前端请求拦截器
instance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {

    // 添加请求头 Authorization
    const token = await getItem(REQUEST_HEADER_TOKEN);
    // console.log("token", token);
    if (token) {
      config.headers[REQUEST_HEADER_TOKEN] = token;
    }
    return config;
  },
);

// 后端响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    let result = response.data;
    if (!result.success) {
      return rejectHttpError(
        result.error || result.message || result.errorMessage || '请求异常！',
        500
      );
    }
    return result.data;
  },
  (error: AxiosError) => {
    if (error.response) {
      const data = error.response.data as { error?: string; code?: any };
      if (data && data.error) {
        return rejectHttpError(data.error, data.code);
      }
      return rejectHttpError('请求异常：' + error.response.statusText);
    }

    if (error.request) {
      return rejectHttpError('请求异常：无返回结果');
    }
    return rejectHttpError(error.message);
  }
);
const getData = async <T>(clazz: new (...args: any[]) => T, url : string, params? : {}): Promise<T|null> =>{
    const data = await instance.get(url, {params})
    return plainToInstance(clazz, data)
}

const getDataList = async <T>(clazz: new (...args: any[]) => T, url : string, params? : {}) : Promise<T[]> => {
  const data : {}[] = await instance.get(url, {params})
  if (data == undefined || data.length  == 0) {
     return [];
  }
  const dataList : T[] = []
  data.forEach(item => {
     const item_instance : T = plainToInstance(clazz, item);
     dataList.push(item_instance);
  })
  return dataList;
}

class PageData<T> {
   data : T[];
   total : number;

   constructor(data : T[], total : number) {
      this.data = data;
      this.total = total;
   }

} 

const getPage = async <T>(clazz: new (...args: any[]) => T, url : string, params? : {}) : Promise<PageData<T>> => {
  const pageData : any = await instance.get(url, {params})
  if (pageData == undefined) {
     return new PageData<T>([], 0);
  }
  const dataList : T[] = []
  const responseDataList : {}[] = pageData.data;
  responseDataList.forEach(item=> {
     const item_instance : T = plainToInstance(clazz, item);
     dataList.push(item_instance);
  })
  const total : number = pageData.total;
  return new PageData<T>(dataList, total);
}


export {
  getData,
  getDataList,
  getPage,
  PageData,
  instance
} ;


