import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  Req,
  Query,
} from '@nestjs/common';
import {ApiBody, ApiConsumes, ApiOperation, ApiResponse} from '@nestjs/swagger';
import {CreateProductDto} from '../dto/create-product.dto';
import {FastifyReply, FastifyRequest} from 'fastify';
import {PaginationQueryDto} from '../dto/pagination-query.dto';
import {ProductService} from '../service/product.service';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiOperation({summary: 'Create a new product'})
  @ApiConsumes('multipart/form-data')
  @ApiResponse({status: 201, description: 'Product created successfully'})
  @ApiBody({type: CreateProductDto})
  async create(@Req() req: FastifyRequest, res: FastifyReply) {
    return this.productService.createProductFromRequest(req, res);
  }

  @Get()
  @ApiOperation({summary: 'Get all products'})
  @ApiResponse({status: 200, description: 'Products fetched successfully'})
  @ApiResponse({status: 404, description: 'No products found'})
  async findAll(@Query() query: PaginationQueryDto) {
    return this.productService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({summary: 'Get a product by ID'})
  @ApiResponse({status: 200, description: 'Product fetched successfully'})
  @ApiResponse({status: 404, description: 'Product not found'})
  async findOne(@Param('id') id: string, res: FastifyReply) {
    return this.productService.findOne(+id, res);
  }

  @Patch(':id')
  @ApiOperation({summary: 'Update a product by ID'})
  @ApiConsumes('multipart/form-data')
  @ApiResponse({status: 200, description: 'Product updated successfully'})
  @ApiResponse({status: 404, description: 'Product not found'})
  async update(
    @Param('id') id: string,
    @Req() req: FastifyRequest,
    res: FastifyReply
  ) {
    return this.productService.updateProduct(+id, req, res);
  }

  @Delete(':id')
  @ApiOperation({summary: 'Delete a product by ID'})
  @ApiResponse({status: 200, description: 'Product deleted successfully'})
  @ApiResponse({status: 404, description: 'Product not found'})
  async remove(@Param('id') id: string, res: FastifyReply) {
    return this.productService.remove(+id, res);
  }
}
