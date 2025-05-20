// pages/api/[...all].js
import axios from "axios";
import { constants } from "buffer";
import { createProxyMiddleware } from "http-proxy-middleware";
import { headers } from "next/headers";
import formidable from 'formidable';
import FormData from 'form-data';
import fs from 'fs';

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
  const method = req.method;
  const headers = req.headers;
  if(method === 'POST'){
    const contentType = headers['content-type'];
    const isMultiPart = contentType?.includes('multipart/form-data');
    if (isMultiPart) {
      // formidable 解析
      const form = formidable({ multiples: true });
      const [fields, files] = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          resolve([fields, files]);
        });
      });

      // 用 form-data 组装
      const formData = new FormData();

      // 添加文件
      for (const [key, value] of Object.entries(files)) {
        if (Array.isArray(value)) {
          value.forEach(file => {
            formData.append(key, fs.createReadStream(file.filepath), file.originalFilename);
          });
        } else {
          formData.append(key, fs.createReadStream(value.filepath), value.originalFilename);
        }
      }

      // 添加其他字段
      for (const [key, value] of Object.entries(fields)) {
        // formidable 解析出来的 value 可能是数组
        if (Array.isArray(value)) {
          value.forEach(v => formData.append(key, v));
        } else {
          formData.append(key, value);
        }
      }

      // 合并 headers
      const formHeaders = formData.getHeaders();
      const mergedHeaders = { ...headers, ...formHeaders };
      // 去掉 content-length，form-data 会自动处理
      delete mergedHeaders['content-length'];
      url = url.replace("/file", "")
      // 发送
      const response = await axios.post(url, formData, { headers: mergedHeaders });
      return response;
    }

    // 普通 POST
    const response = await axios.post(url, req.body, { headers });
    return response;
  }
  if(method === 'PUT'){
    return await axios.put(url, req.body, {  headers});
  }
  if(method === 'DELETE'){
    return await axios.delete(url, { params: req.body, headers});
  }
  return null;
}

function getTargetUrl(url){
  url = url.replace("/api",prefix)
  return target  + url;
}