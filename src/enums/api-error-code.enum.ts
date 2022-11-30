export enum ApiErrorCode {
  TIMEOUT = -1, // 系统繁忙
  ERROR = 9999, // 系统错误
  SUCCESS = 200, // 成功
  PARAMS_INVAL = 40001, // 无效参数
  TOKEN_INVAL = 40002, // 无效token
  ACCOUNT_INVAL = 40003, // 账号冻结
  PASSWORD_INVAL = 40004, // 密码错误
}
