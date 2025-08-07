import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { Response } from 'express';
import { Public } from '~/common/decorators/public.decorator';
import { CreateOrderDto } from '~/order/dto/create-order.dto';
import { UpdateOrderDto } from '~/order/dto/update-order.dto';
import { OrderService } from '~/order/service/order.service';

import { PaginationQueryOrderDto } from '../dto/pagination-query-order.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiBody({ type: CreateOrderDto })
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @Public()
  @Get('import-orders')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="orders.csv"')
  @ApiOperation({ summary: 'Import all orders' })
  @ApiResponse({ status: 200, description: 'Orders imported successfully' })
  @ApiResponse({ status: 404, description: 'No orders found' })
  async exportOrders(@Res() res: Response) {
    try {
      const csv = await this.orderService.exportOrders();
      res.send(csv);
    } catch (error) {
      const err = error as Error;
      res.status(400).send({ message: err.message });
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({
    status: 200,
    description: 'Orders fetched successfully',
  })
  @ApiResponse({ status: 404, description: 'No orders found' })
  findAll(@Query() query: PaginationQueryOrderDto) {
    return this.orderService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an order by ID' })
  @ApiResponse({
    status: 200,
    description: 'Order fetched successfully',
    type: CreateOrderDto,
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an order by ID' })
  @ApiResponse({
    status: 200,
    description: 'The order has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(id, updateOrderDto);
  }
}
