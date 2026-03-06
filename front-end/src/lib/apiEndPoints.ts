import Env from "./env";

 
export const BASE_URL = Env.BACKEND_URL;
export const API_URL = BASE_URL + "/api";
export const LOGIN_URL = API_URL + "/auth/login";

export const BASE_URL1 = `${Env.BACKEND_URL}/api`;
export const REGISTER_URL = `${BASE_URL1}/auth/register`;
export const check_credential = `${BASE_URL1}/auth/logincheck`;
export const forgetPassword = `${BASE_URL1}/auth/forgot-password`;
export const resetPassword = `${BASE_URL1}/auth/reset-password`;
export const createClash = `${BASE_URL1}/clash`;
export const clashItems = `${BASE_URL1}/clash/items`;