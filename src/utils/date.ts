import moment from 'moment';
/**
 * @param dateNum 时间
 * @param isDue 是否显示时分秒
 * @return:
 * @Description: 格式化日期
 */
export const formatDate = (dateNum: string | number, isDue = false): string => {
  if (isDue) {
    return moment(dateNum).format('YYYY-MM-DD HH:mm:ss');
  } else {
    return moment(dateNum).format('YYYY-MM-DD HH:mm:ss');
  }
};

/**
 * @Description: 获取年月日时间
 * @param {type}
 * @return:
 */
export const getDay = (date: Date = new Date()): string => {
  return moment(date).format('YYYYMMDD');
};

/**
 * @Description: 获取当前的时间鹾
 * @param {type}
 * @return:
 */
export const getTime = (): number => {
  return new Date().getTime();
};

/**
 * 根据生日计算年龄
 * @param date
 */
export const birthdayYear = (date: Date): string | null => {
  try {
    return date ? `${moment().diff(date, 'years')}` : null;
  } catch (e) {
    console.log(e);
    return null;
  }
};

/**
 * @Description: 传递时间距离现在多少毫秒过期
 * @param {string} date 时间格式为:2020-12-15 14:20:10
 * @return {*}
 */
export const dueDateMillisecond = (date: string): number => {
  // 当前时间
  const currentTime = Number.parseInt(String(new Date().getTime() / 1000));
  // 未来时间
  const futureTime = Number.parseInt(String(new Date(date).getTime() / 1000));
  if (futureTime <= currentTime) {
    return 0;
  } else {
    // 这里把秒数转成毫秒
    return (futureTime - currentTime) * 1000;
  }
};
