import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {ProductFamily} from '../entity/product-family.entity';
import {CreateProductFamilyDto} from '../dto/product-family.dto';
import {FastifyReply} from 'fastify';

@Injectable()
export class FamiliesService {
  constructor(
    @InjectRepository(ProductFamily)
    private productFamilyRepository: Repository<ProductFamily>
  ) {}

  async create(
    createProductFamilyDto: CreateProductFamilyDto,
    res: FastifyReply
  ) {
    try {
      const productFamily = this.productFamilyRepository.create(
        createProductFamilyDto
      );
      return await this.productFamilyRepository.save(productFamily);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.code(400).send({
          statusCode: 400,
          message: 'Failed to create product family',
          error:
            error instanceof Error
              ? error.message
              : 'Failed to create product family',
        });
      }
    }
  }

  async findAll() {
    return await this.productFamilyRepository.find();
  }
}
