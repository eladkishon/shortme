const CHARSET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const BASE = CHARSET.length;

function encode(num: number): string {
  if (num === 0) return CHARSET[0];
  
  let encoded = '';
  while (num > 0) {
    encoded = CHARSET[num % BASE] + encoded;
    num = Math.floor(num / BASE);
  }
  return encoded;
}

function decode(str: string): number {
  return str.split('').reverse().reduce((result, char, index) => {
    return result + CHARSET.indexOf(char) * Math.pow(BASE, index);
  }, 0);
} 

export default { encode, decode };