import { Http, toKebabCase, type SessionInfo } from 'dff-util';
import JwtService from '../modules/jwt/jwt.service';
import { env, env_base_name, session_meta, session_user } from './app-util';

const API_BASE_URL = env('API_BASE_URL') || '-';

export default class AppHttp {
  static MsUrl = {
    base: env('MS_BASE_URL') || API_BASE_URL + '/' + toKebabCase(env_base_name()) + '-base/',
    auth: env('MS_AUTH_URL') || API_BASE_URL + '/' + toKebabCase(env_base_name()) + '-auth/',
    util: env('MS_UTIL_URL') || API_BASE_URL + '/' + toKebabCase(env_base_name()) + '-util/',
    main: env('MS_MAIN_URL') || API_BASE_URL + '/' + toKebabCase(env_base_name()) + '-main/',
    sor: env('MS_SOR_URL') || API_BASE_URL + '/' + toKebabCase(env_base_name()) + '-sor/',
    events: env('MS_EVENTS_URL') || API_BASE_URL + '/' + toKebabCase(env_base_name()) + '-events/',
  };

  static AUTHORIZATION_TOKEN: string | undefined = undefined;

  static async Get(url: string, params: any) {
    url = url.includes('http') ? url : API_BASE_URL + url;
    const { logger, token, request_id, tenant_id, branch_id } = session_meta();
    const headers = {
      ['Content-Type']: 'application/json',
      authorization: AppHttp.AUTHORIZATION_TOKEN || token || this.Token(),
      'request-id': request_id,
      'x-tenant-id': tenant_id,
      ...(branch_id ? { 'x-branch-id': branch_id } : {}),
    };
    logger.info(
      'HTTP GET Call: ' +
        url +
        ', params: ' +
        JSON.stringify(params || {}) +
        ', headers: ' +
        JSON.stringify(headers || {})
    );
    return await Http.Get(url, params, headers);
  }

  static async Post(url: string, params: any) {
    url = url.includes('http') ? url : API_BASE_URL + url;
    const { logger, token, request_id, tenant_id, branch_id } = session_meta();
    const headers = {
      ['Content-Type']: 'application/json',
      authorization: AppHttp.AUTHORIZATION_TOKEN || token || this.Token(),
      'request-id': request_id,
      'x-tenant-id': tenant_id,
      ...(branch_id ? { 'x-branch-id': branch_id } : {}),
    };
    logger.info(
      'HTTP POST Call: ' +
        url +
        ', params: ' +
        JSON.stringify(params || {}) +
        ', headers: ' +
        JSON.stringify(headers || {})
    );
    return await Http.Post(url, params, headers);
  }

  static async Put(url: string, params: any) {
    url = url.includes('http') ? url : API_BASE_URL + url;
    const { logger, token, request_id, tenant_id, branch_id } = session_meta();
    const headers = {
      ['Content-Type']: 'application/json',
      authorization: AppHttp.AUTHORIZATION_TOKEN || token || this.Token(),
      'request-id': request_id,
      'x-tenant-id': tenant_id,
      ...(branch_id ? { 'x-branch-id': branch_id } : {}),
    };
    logger.info(
      'HTTP PUT Call: ' +
        url +
        ', params: ' +
        JSON.stringify(params || {}) +
        ', headers: ' +
        JSON.stringify(headers || {})
    );
    return await Http.Put(url, params, headers);
  }

  static async Delete(url: string, params: any) {
    url = url.includes('http') ? url : API_BASE_URL + url;
    const { logger, token, request_id, tenant_id, branch_id } = session_meta();
    const headers = {
      ['Content-Type']: 'application/json',
      authorization: AppHttp.AUTHORIZATION_TOKEN || token || this.Token(),
      'request-id': request_id,
      'x-tenant-id': tenant_id,
      ...(branch_id ? { 'x-branch-id': branch_id } : {}),
    };
    logger.info(
      'HTTP DELETE Call: ' +
        url +
        ', params: ' +
        JSON.stringify(params || {}) +
        ', headers: ' +
        JSON.stringify(headers || {})
    );
    return await Http.Delete(url, params, headers);
  }

  static async Token() {
    const session: SessionInfo = session_user();
    return JwtService.GenerateToken({
      ...session,
      roles: ['api'],
      type: 'api',
    });
  }
}
