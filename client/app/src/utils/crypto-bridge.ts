// 导入 JavaScript 模块并添加类型定义
const cryptoWrapper = require('../crypto-wrapper');

// 从 JavaScript 模块导出类型安全的接口
export interface ICryptoUtils {
  initialize(): Promise<void>;
  encrypt(plaintext: string, password: string): Promise<string>;
  decrypt(ciphertext: string, password: string): Promise<string>;
  getMachineId(): Promise<string>;
}

// 导出 CryptoUtils 对象，添加类型
export const CryptoUtils: ICryptoUtils = cryptoWrapper.CryptoUtils;

// 也可选择性地导出原始算法模块
export const algorithm = cryptoWrapper.algorithm; 