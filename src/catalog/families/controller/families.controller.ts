import { Body, Controller, Post } from '@nestjs/common';
import { FamiliesService } from '../service/families.service';
import { CreateProductFamilyDto } from '../dto/product-family.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('families')
export class FamiliesController {
    constructor(private readonly familiesService: FamiliesService) {}

@Post()
@ApiOperation({ summary: 'Create a new product family' })
@ApiResponse({ status: 201, description: 'Product family created successfully' })
@ApiBody({ type: CreateProductFamilyDto })
async create(@Body() createProductFamilyDto: CreateProductFamilyDto) {
    return this.familiesService.create(createProductFamilyDto);
}



}
