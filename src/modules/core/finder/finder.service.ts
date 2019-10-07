import { Injectable } from '@nestjs/common';
import { IsString } from 'class-validator';
import * as _ from 'lodash';
import { join } from 'path';
import { AsunaError, AsunaException, deserializeSafely, LoggerFactory, r } from '../../common';
import { AsunaCollections, KvHelper } from '../kv';

const logger = LoggerFactory.getLogger('FinderService');

export class FinderAssetsSettings {
  @IsString()
  endpoint: string;
}

@Injectable()
export class FinderService {
  async getUrl({
    key,
    type,
    name,
    path,
    internal,
  }: {
    key: string;
    type: 'assets' | 'zones';
    name?: string; // default is default
    path: string;
    internal?: boolean;
  }) {
    if (!(key && type && path)) {
      throw new AsunaException(AsunaError.BadRequest, JSON.stringify({ type, name, path }));
    }

    const upstreams = await KvHelper.get(AsunaCollections.SYSTEM_SERVER, key);
    logger.debug(`upstreams ${r(upstreams)}`);
    if (!(upstreams && upstreams.value && _.isObject(upstreams.value))) {
      logger.warn(`${name || 'default'} not available in upstream ${key}`);
      throw new AsunaException(AsunaError.Unprocessable, `${name || 'default'} not available in upstream ${key}`);
    }

    if (type === 'assets') {
      const upstream = upstreams.value[`${internal ? 'internal-' : ''}${name || 'default'}`];
      const finderAssetsSettings = deserializeSafely(FinderAssetsSettings, upstream);
      if (!finderAssetsSettings) {
        throw new AsunaException(AsunaError.Unprocessable, `invalid upstream ${JSON.stringify(upstream)} for finder`);
      }
      const resourcePath = join('/', path).replace(/\/+/g, '/');
      /* const portStr = upstream.port ? `:${upstream.port}` : '';

      // get same domain if hostname startswith /
      if (_.startsWith(upstream.hostname, '/')) {
        return `${upstream.endpoint}${resourcePath}`;
      }
*/
      return `${upstream.endpoint || ''}${resourcePath}`;
    }
    // TODO add other handlers later
    logger.warn('only type assets is available');
    throw new AsunaException(AsunaError.InvalidParameter, 'only type assets is available');
  }
}
