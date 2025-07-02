import { Injectable, Logger } from '@nestjs/common';


@Injectable()
export class FilterParserService {
  private readonly logger = new Logger(FilterParserService.name);


  parseFilters(
    filtersString?: string,
    rawQuery?: Record<string, any>
  ): Record<string, Record<string, any>> | undefined {
    if (filtersString) {
      const parsedFromString = this.parseFiltersString(filtersString);
      if (parsedFromString) {
        return parsedFromString;
      }
    }


    if (rawQuery?.filters) {
      const parsedFromRaw = this.parseFiltersString(rawQuery.filters);
      if (parsedFromRaw) {
        return parsedFromRaw;
      }
    }


    if (rawQuery) {
      const parsedFromIndividual = this.parseIndividualFilters(rawQuery);
      if (parsedFromIndividual && Object.keys(parsedFromIndividual).length > 0) {
        return parsedFromIndividual;
      }
    }

    return undefined;
  }


  private parseFiltersString(
    filtersString: string
  ): Record<string, Record<string, any>> | undefined {
    if (!filtersString || typeof filtersString !== 'string') {
      return undefined;
    }

    try {
      return JSON.parse(filtersString);
    } catch (error) {
      try {
        const decodedValue = decodeURIComponent(filtersString);
        return JSON.parse(decodedValue);
      } catch (decodeError) {
        this.logger.warn(
          `Failed to parse filters string: ${filtersString}`, 
          decodeError
        );
        return undefined;
      }
    }
  }


  private parseIndividualFilters(
    rawQuery: Record<string, any>
  ): Record<string, Record<string, any>> {
    const individualFilters: Record<string, Record<string, any>> = {};

    Object.entries(rawQuery).forEach(([key, value]) => {
      if (key.startsWith('filter_')) {
        const parts = key.split('_');
        if (parts.length === 3) {
          const [, field, operator] = parts;
          if (!individualFilters[field]) {
            individualFilters[field] = {};
          }
          individualFilters[field][operator] = value;
        }
      }
    });

    return individualFilters;
  }


  validateAndSanitizeFilters(
    filters: Record<string, Record<string, any>>
  ): Record<string, Record<string, any>> {
    if (!filters || typeof filters !== 'object') {
      return {};
    }

    const sanitized: Record<string, Record<string, any>> = {};

    Object.entries(filters).forEach(([field, operations]) => {
      if (typeof operations === 'object' && operations !== null) {
        sanitized[field] = {};
        
        Object.entries(operations).forEach(([operator, value]) => {
          if (value !== null && value !== undefined) {
            sanitized[field][operator] = value;
          }
        });
        if (Object.keys(sanitized[field]).length === 0) {
          delete sanitized[field];
        }
      }
    });

    return sanitized;
  }
} 