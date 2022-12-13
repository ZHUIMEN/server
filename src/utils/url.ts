import { URL } from 'url';
import fs from 'fs';
/**
 * @Description: 根据key从一段url中获取query值
 * @param urlPath {String} url地址
 * @param key {String} 获取单独的一个key
 * @return {*}
 */
export const getUrlQuery = (urlPath: string, key: string): string | null => {
  const url = new URL(urlPath, 'https://www.');
  const params = new URLSearchParams(url.search.substring(1));
  return params.get(key);
};

export async function createDirIfNotExists(dirPath) {
  try {
    await fs.promises.access(dirPath);
  } catch (err) {
    await fs.promises.mkdir(dirPath);
  }
}
