import { Injectable } from "@nestjs/common";
import { ObjectLiteral, SelectQueryBuilder } from "typeorm";
import { PaginationQuery, PaginationResult } from "../interface/pagination.interface";
import { FilterService } from "../../filter/service/filter.service";

@Injectable()
export class PaginationService {
    private readonly DEFAULT_PAGE = 1;
    private readonly DEFAULT_LIMIT = 10;
    private readonly MAX_LIMIT = 100;

    constructor(private readonly filterService: FilterService) {}


    async paginate<T extends ObjectLiteral>(
       qb: SelectQueryBuilder<T>,
       alias: string,
       options: PaginationQuery,
       filters?: Record<string, Record<string, any>>
    ): Promise<PaginationResult<T>> {
        if (filters) {
            this.filterService.applyFilters(qb, alias, filters);
        }

        this.applySorting(qb, alias, options.sortBy, options.sortOrder);

        const total = await qb.getCount();

        const { page, limit } = this.normalizePaginationOptions(options);
        const offset = (page - 1) * limit;

        qb.skip(offset).take(limit);

        const data = await qb.getMany();

        const paginationMeta = this.calculatePaginationMeta(total, page, limit);

        return {
            data,
            total,
            page,
            limit,
            ...paginationMeta,
        };
    }

    private applySorting<T extends ObjectLiteral>(
        qb: SelectQueryBuilder<T>,
        alias: string,
        sortBy?: string,
        sortOrder?: string
    ): void {
        if (sortBy) {
            const order = sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
            qb.orderBy(`${alias}.${sortBy}`, order);
        }
    }

    private normalizePaginationOptions(options: PaginationQuery): { page: number; limit: number } {
        const page = Math.max(1, options.page || this.DEFAULT_PAGE);
        const limit = Math.min(
            this.MAX_LIMIT,
            Math.max(1, options.limit || this.DEFAULT_LIMIT)
        );

        return { page, limit };
    }

    private calculatePaginationMeta(total: number, page: number, limit: number) {
        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;

        return {
            totalPages,
            hasNextPage,
            hasPreviousPage,
        };
    }

    createPaginationMeta(result: PaginationResult<any>) {
        return {
            pagination: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
                hasNextPage: result.hasNextPage,
                hasPreviousPage: result.hasPreviousPage,
            },
        };
    }
}