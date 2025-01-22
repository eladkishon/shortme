const CHARSET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const BASE = CHARSET.length;

/**
 * Encode a number to a base62 string
 * @param num - The number to encode
 * @returns The encoded string
 */
function encode(num: number): string {
  if (num === 0) return CHARSET[0];
  
  let encoded = '';
  while (num > 0) {
    encoded = CHARSET[num % BASE] + encoded;
    num = Math.floor(num / BASE);
  }
  return encoded;
}

/**
 * Decode a base62 string to a number
 * @param str - The base62 string to decode
 * @returns The decoded number
 */
function decode(str: string): number {
  return str.split('').reverse().reduce((result, char, index) => {
    return result + CHARSET.indexOf(char) * Math.pow(BASE, index);
  }, 0);
} 

export default { encode, decode };