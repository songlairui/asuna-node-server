import { BadRequestException, Controller, Get, Param, Query } from '@nestjs/common';
import { ApiUseTags } from '@nestjs/swagger';
import * as _ from 'lodash';
import * as R from 'ramda';
import { getConnection } from 'typeorm';
import { Profile } from '../common';
import {
  DBHelper,
  parseListParam,
  parseNormalWhereAndRelatedFields,
  parseOrder,
  parseWhere,
} from '../core/db';
import { LoggerFactory } from '../common/logger';

const logger = LoggerFactory.getLogger('SearchController');

@ApiUseTags('core')
@Controller('api/search')
export class SearchController {
  @Get(':model')
  async search(
    @Param('model') model: string,
    @Query('keywords') keywords: string,
    @Query('page') page: number = 1,
    @Query('size') size: number = 10,
    @Query('profile') profile?: Profile,
    @Query('fields') fields?: string | string[],
    @Query('on') onFields?: string | string[],
    @Query('where') whereStr?: string,
    @Query('sort') sortStr?: string,
    @Query('relations') relationsStr?: string,
  ): Promise<{ query: object; items: any[]; total: number; page: number; size: number }> {
    const repository = DBHelper.repo(model);
    const select = parseListParam(fields, field => `${model}.${field}`);
    const on = parseListParam(onFields);

    if (!on) {
      throw new BadRequestException('`on` is required.');
    }

    const where = parseWhere(whereStr);
    const order = parseOrder(model, sortStr);
    const allRelations = repository.metadata.relations.map(r => r.propertyName);
    const relations = profile === Profile.detail ? allRelations : parseListParam(relationsStr);

    // 处理关联条件查询

    const { normalWhere, relatedFields } = parseNormalWhereAndRelatedFields(where, repository);

    const selectFilter = R.map(field => `${model}.${field} like :${field}`, on).join(' or ');
    const selectParams = R.mergeAll(R.map(field => ({ [field]: `%${keywords}%` }), on));
    const query = {
      keywords,
      on,
      where,
      order,
      select,
      normalWhere,
      selectFilter,
      selectParams,
      relations,
      skip: (page - 1) * size,
      take: +size,
    };

    // console.log({ query, relatedFields });

    const queryBuilder = repository.createQueryBuilder(model);

    // 依次加载对应的关联数据 TODO using DBHelper.wrapProfile
    relatedFields.forEach(field => {
      // console.log('[innerJoinAndSelect]', { field, model, where });
      const elementCondition = where[field] as any;

      if (_.isObjectLike(elementCondition)) {
        let innerValue = elementCondition._value;

        if (_.isObjectLike(innerValue) && innerValue.toSql) {
          innerValue = elementCondition._value.toSql(
            getConnection(),
            `${field}.id`,
            elementCondition._value._value,
          );
        } else {
          innerValue = elementCondition.toSql(getConnection(), `${field}.id`, innerValue);
        }

        if (elementCondition._type === 'not') {
          const sqlList = innerValue.split(' ');
          sqlList.splice(1, 0, 'NOT');
          const sql = sqlList.join(' ');
          // console.log({ field, sql });

          queryBuilder.innerJoinAndSelect(`${model}.${field}`, field, sql);
        } else {
          queryBuilder.innerJoinAndSelect(`${model}.${field}`, field, innerValue);
        }
      } else {
        queryBuilder.innerJoinAndSelect(
          `${model}.${field}`,
          field,
          `${field}.id = :${field}`,
          where,
        );
      }
    });

    if (order) {
      queryBuilder.orderBy(order as any);
    }

    // _.map(sorts, (order, sort) => {
    //   if (sort.includes('.')) {
    //     queryBuilder.addOrderBy(sort, order);
    //   } else {
    //     queryBuilder.addOrderBy(`${model}.${sort}`, order);
    //   }
    // });

    queryBuilder
      .loadAllRelationIds({ relations: relations || [] })
      .select(select)
      .where(`(${selectFilter})`, selectParams);

    DBHelper.wrapNormalWhere(model, queryBuilder, normalWhere);

    const total = await queryBuilder.getCount();
    const items = await queryBuilder
      .take(query.take)
      .skip(query.skip)
      .getMany();

    return { query, items, total, page: +page, size: +size };
  }
}
