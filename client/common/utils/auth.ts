import * as crypto from 'crypto'

const publicKeyPem = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvtVIa4OJSZShf5l80DMB
7MZzQqazPAgJikE+DBupGWjBsyyy++xSuHXNtKGnzQbStjc9gP7Yl5daVWoG6CMe
+r224k+CLbpB9nYdqghRH0e7sl/9Q3bVsVJIy4F1Gm6crX3QOVyaICWEB/G5Ju/T
iINtNoBVCi3mmsdpzg2lE9/cSeKM/OLzmztEXKUXfDYMkqMtqVriLUfuvk/YkKNb
RgpqVsdCnRTlQiKXrTQqc/R2xN3cphoX8V0aCslcz2m+JUNjo+8seyAgQhmlNH9x
0XYR5nyRqfN6tyChMWNvyMbTwm/9iFIs3d/KjjXW5jWt9xx74NvivM81IKDic49K
yQIDAQAB
-----END PUBLIC KEY-----
`

export const encrypt = (content: string) => {
  let hash = crypto.createHmac("md5", process.env.JWT_SECRET || '')
  hash.update(content)
  return hash.digest('hex')
}

/**
 * 使用公钥对数据加密
 * @param {string} plainText 明文
 * @param {string} publicKeyPem 公钥
 * @returns {string} 加密后的密文
 * @throws {Error} 如果加密过程失败
 */
export function encryptRSA(plainText: string) {
  try {
    // 使用 RSA 公钥加密，采用 OAEP 填充模式和 SHA-256 哈希函数
    const encryptedBuffer = crypto.publicEncrypt(
      {
        key: publicKeyPem,
        padding: crypto.constants.RSA_PKCS1_PADDING,
        oaepHash: 'sha256'
      },
      Buffer.from(plainText) // 明文转换为 Buffer
    )

    // 返回 Base64 编码的加密结果
    return encryptedBuffer.toString('base64')
  } catch (err: any) {
    throw new Error(`加密失败: ${err.message}`)
  }
}

/**
 * DecryptRSA 使用私钥对数据解密
 * @param {string} cipherText - Base64 编码的密文字符串
 * @param {string} privateKeyPem - 私钥的 PEM 格式字符串
 * @returns {string} - 解密后的明文字符串
 * @throws {Error} - 如果解密过程失败
 */
export function decryptRSA(cipherText: string, privateKeyPem: string) {
  try {
    // 将密文从 Base64 解码为 Buffer
    const encryptedBuffer = Buffer.from(cipherText, 'base64')

    // 使用 RSA 私钥解密，采用 OAEP 填充模式和 SHA-256 哈希函数
    const decryptedBuffer = crypto.privateDecrypt(
      {
        key: privateKeyPem,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
      },
      encryptedBuffer
    )

    // 返回解密后的明文字符串
    return decryptedBuffer.toString()
  } catch (err: any) {
    throw new Error(`解密失败: ${err.message}`)
  }
}