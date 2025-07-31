import { Injectable } from '@nestjs/common';

import { CreateWarehouseDto } from '../dto/create-warehouse.dto';
import { UpdateWarehouseDto } from '../dto/update-warehouse.dto';

@Injectable()
export class WarehouseService {
  create(createWarehouseDto: CreateWarehouseDto) {
    return 'This action adds a new warehouse';
  }

  findAll() {
    return `This action returns all warehouse`;
  }

  findOne(id: string) {
    return `This action returns a #${id} warehouse`;
  }

  update(id: string, updateWarehouseDto: UpdateWarehouseDto) {
    return `This action updates a #${id} warehouse`;
  }

  remove(id: string) {
    return `This action removes a #${id} warehouse`;
  }
}
