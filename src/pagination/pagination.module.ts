import { Module } from "@nestjs/common";
import { PaginationService } from "./service/pagination.service";
import { FilterModule } from "../filter/filter.module";

@Module({
    imports: [FilterModule],
    providers: [PaginationService],
    exports: [PaginationService],
})
export class PaginationModule {}