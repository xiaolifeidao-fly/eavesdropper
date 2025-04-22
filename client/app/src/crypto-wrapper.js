// 直接使用 require 加载 algorithm 模块
// 这样 webpack 不会试图打包它，避免 native 模块的问题
const algorithm = require('algorithm');

/**
 * Crypto 工具类，包装了算法模块的加密解密功能
 */
class CryptoUtils {
  static machineId = null;
  
  /**
   * 初始化加密工具，获取机器 ID
   */
  static async initialize() {
    if (!this.machineId) {
      try {
        this.machineId = await algorithm.getCurrentMachineId();
      } catch (error) {
        console.error('初始化 CryptoUtils 失败:', error);
        throw error;
      }
    }
  }
  
  /**
   * 加密数据
   * @param {string} plaintext 要加密的文本
   * @param {string} password 密码
   * @returns {Promise<string>} 加密后的文本
   */
  static async encrypt(plaintext, password) {
    if (!this.machineId) {
      await this.initialize();
    }
    
    try {
      return await algorithm.encrypt(plaintext, password, this.machineId);
    } catch (error) {
      console.error('加密失败:', error);
      throw error;
    }
  }
  
  /**
   * 解密数据
   * @param {string} ciphertext 加密后的文本
   * @param {string} password 密码
   * @returns {Promise<string>} 解密后的文本
   */
  static async decrypt(ciphertext, password) {
    if (!this.machineId) {
      await this.initialize();
    }
    
    try {
      return await algorithm.decrypt(ciphertext, password, this.machineId);
    } catch (error) {
      console.error('解密失败:', error);
      throw error;
    }
  }
  
  /**
   * 获取当前机器 ID
   * @returns {Promise<string>} 机器 ID
   */
  static async getMachineId() {
    if (!this.machineId) {
      await this.initialize();
    }
    
    return this.machineId;
  }
}

// 导出 CryptoUtils 类和原始 algorithm 模块
module.exports = {
  CryptoUtils,
  algorithm
}; 