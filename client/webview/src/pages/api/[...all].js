// pages/api/[...all].js
import axios from "axios";
import { constants } from "buffer";
import { createProxyMiddleware } from "http-proxy-middleware";
import { headers } from "next/headers";

require('dotenv').config();

const prefix = process.env.APP_URL_PREFIX;
const target = process.env.SERVER_TARGET;

// Next.js API 路由处理函数


// export const config = {
//   api: {
//     bodyParser: false
//   }
// }


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

    console.log(typeof req.body)
    // console.log(contentType)
    const isMultiPart = contentType.includes('multipart/form-data')
    if (isMultiPart) {
      // delete headers['content-type'];
      headers["x-requested-with"] = "XMLHttpRequest";
      // console.log(headers);
      return axios.post(url, req.body, { headers});
    }

     const response = await axios.post(url, req.body, { headers});
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