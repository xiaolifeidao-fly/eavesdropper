// pages/api/[...all].js
import axios from "axios";
import { constants } from "buffer";
import { createProxyMiddleware } from "http-proxy-middleware";
import { headers } from "next/headers";
import formidable from 'formidable';

require('dotenv').config();

const prefix = process.env.APP_URL_PREFIX;
const target = process.env.SERVER_TARGET;

// Next.js API 路由处理函数

// 添加这个配置来禁用默认的 body 解析
export const config = {
  api: {
    bodyParser: false
  }
}

export default async function handler(req, res) {
  // 创建代理中间件
  if(req.method == 'GET'){
    const proxy = createProxyMiddleware({
      target: target, // 设置代理目标地址
      changeOrigin: true, // 设置请求头中的 Host 为目标地址的 Host
      pathRewrite: {
        "^/api": prefix, // 将请求中的 /api 前缀替换为空字符串
      },
      headers: req.headers,
      onProxyReq: (proxyReq, req, res) => {
        // Add debug logs
        // console.log('Proxy Request Headers:', proxyReq.getHeaders());
      },
      onProxyRes: (proxyRes, req, res) => {
        // Add debug logs
        // console.log('Proxy Response Headers:', proxyRes.headers);
      },
      onError: (err, req, res) => {
        // Handle errors
        console.error('Proxy error:', err);
        res.status(500).send('Proxy error');
      },
    });
    return proxy(req, res);
  }
  try {
    const url = getTargetUrl(req.url);
    const response = await request(url, req)
    // 获取目标服务器的响应
    const data = response.data;
    // 将目标服务器的响应返回给客户端
    res.status(response.status).json(data);
  } catch (error) {
      console.error('Error forwarding request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function request(url, req){
  const menthd = req.method;
  const headers = req.headers;
  if(menthd === 'POST'){
    const contentType = headers['content-type'];


    const isMultiPart = contentType?.includes('multipart/form-data')
    
    if (isMultiPart) {
      // 使用 formidable 处理文件上传
      const form = formidable({ multiples: true });
      
      const [fields, files] = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          resolve([fields, files]);
        });
      });

      // 创建 FormData 对象
      const formData = new FormData();
      
      // 添加文件到 FormData
      for (const [key, value] of Object.entries(files)) {
        // 如果是单个文件
        if (!Array.isArray(value)) {
          formData.append(key, value);
        } else {
          // 如果是多个文件
          value.forEach(file => {
            formData.append(key, file);
          });
        }
      }
      
      // 添加其他字段到 FormData
      for (const [key, value] of Object.entries(fields)) {
        formData.append(key, value);
      }
      // 使用 axios 发送文件
      const response = await axios.postForm(url, formData, { headers });
      return response;
    }

    const response = await axios.post(url, req.body, { headers });
    return response;
  }
  if(menthd === 'PUT'){
    return await axios.put(url, req.body, {  headers});
  }
  if(menthd === 'DELETE'){
    return await axios.delete(url, { params: req.body, headers});
  }
  return null;
}

function getTargetUrl(url){
  url = url.replace("/api",prefix)
  return target  + url;
}