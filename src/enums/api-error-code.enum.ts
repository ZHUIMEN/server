export enum ApiErrorCode {
  /** 系统繁忙 */
  TIMEOUT = -1,
  /** 系统错误 */
  ERROR = 9999,
  /** 成功 */
  SUCCESS = 200, // 成功
  /** 无效参数 */
  PARAMS_INVAL = 40001, // 无效参数
  /** 无效token */
  TOKEN_INVAL = 40002, // 无效token
  /** 账号冻结 */
  ACCOUNT_INVAL = 40003, // 账号冻结
  /** 密码错误 */
  PASSWORD_INVAL = 40004, // 密码错误
  /** 账号不存在 */
  NOT_ACCOUNT_INVAL = 40005, // 账号不存在
}
