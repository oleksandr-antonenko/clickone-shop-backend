import { Module } from '@nestjs/common';
import { FilterService } from './service/filter.service';
import { FilterParserService } from './service/filter-parser.service';

@Module({
  providers: [FilterService, FilterParserService],
  exports: [FilterService, FilterParserService],
})
export class FilterModule {} 