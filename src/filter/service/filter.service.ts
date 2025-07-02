import { Injectable } from '@nestjs/common';

import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class FilterService {
  private operatorMap = {
    eq: '=',
    ne: '!=',
    gt: '>',
    gte: '>=',
    lt: '<',
    lte: '<=',
    like: 'LIKE',
    notLike: 'NOT LIKE',
    in: 'IN',
    nin: 'NOT IN',
    between: 'BETWEEN',
    notBetween: 'NOT BETWEEN',
    isNull: 'IS NULL',
    isNotNull: 'IS NOT NULL',
  };

  private normalizeOperator(op: string): string {
    const aliases = {
      isIn: 'in',
      isNotIn: 'nin',
      isLike: 'like',
      isNotLike: 'notLike',
      isBetween: 'between',
    };
    return aliases[op] || op;
  }

  applyFilters<T extends ObjectLiteral>(
    qb: SelectQueryBuilder<T>,
    alias: string,
    filters: Record<string, Record<string, any>>
  ): void {
    if (!filters) return;
    let index = 0;

    for (const [field, operations] of Object.entries(filters)) {
      for (const [opRaw, value] of Object.entries(operations)) {
        const opKey = this.normalizeOperator(opRaw);
        const sqlOperator = this.operatorMap[opKey];
        if (!sqlOperator) continue;

        const column = `${alias}.${field}`;
        const paramName = `${field}_${opKey}_${index++}`;

        if (
          [
            'isNull',
            'isNotNull',
            'isTrue',
            'isFalse',
            'isNotTrue',
            'isNotFalse',
          ].includes(opKey)
        ) {
          qb.andWhere(`${column} ${sqlOperator}`);
          continue;
        }
        if (['in', 'nin'].includes(opKey)) {
          console.log(`${column} ${sqlOperator} (:...${paramName})`, {
            [paramName]: value,
          });
          qb.andWhere(`${column} ${sqlOperator} (:...${paramName})`, {
            [paramName]: value,
          });
          continue;
        }

        if (['between', 'notBetween'].includes(opKey) && Array.isArray(value)) {
          console.log(
            `${column} ${sqlOperator} :${paramName}1 AND :${paramName}2`,
            {
              [`${paramName}1`]: value[0],
              [`${paramName}2`]: value[1],
            }
          );
          qb.andWhere(
            `${column} ${sqlOperator} :${paramName}1 AND :${paramName}2`,
            {
              [`${paramName}1`]: value[0],
              [`${paramName}2`]: value[1],
            }
          );
          continue;
        }

        const paramValue = ['like', 'notLike'].includes(opKey)
          ? `%${value}%`
          : value;

        qb.andWhere(`${column} ${sqlOperator} :${paramName}`, {
          [paramName]: paramValue,
        });
      }
    }
  }
}
