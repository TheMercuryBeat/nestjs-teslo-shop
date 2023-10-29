import { BadRequestException, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product, ProductImage } from './entities';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService')

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImagesRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource) { }

  async create(createProductDto: CreateProductDto) {

    try {

      const { images = [], ...productDetails } = createProductDto;

      const product = this.productRepository.create({
        ...productDetails,
        images: images.map((image) => this.productImagesRepository.create({ url: image }))

      });

      await this.productRepository.save(product);
      return { ...product, images };

    } catch (error) {
      this.handleExceptions(error);
    }

  }

  async findAll(paginationDto: PaginationDto) {

    const { limit = 10, offset = 0 } = paginationDto;

    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: { images: true }
    });

    return products.map((product) => ({
      ...product,
      images: product.images.map((image) => image.url)
    }));

  }

  async findOne(term: string) {

    let product: Product;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('product');
      product = await queryBuilder
        .leftJoinAndSelect('product.images', 'productImages')
        .where('UPPER(title)=:title or slug=:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase()
        })
        .getOne();
    }

    if (product) return product;
    throw new NotFoundException(`Product ${term} not found`);
  }

  async findeOnePlain(term: string) {

    const { images = [], ...rest } = await this.findOne(term);
    return {
      ...rest,
      images: images.map((image) => image.url)
    }

  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const { images, ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({ id, ...toUpdate });
    if (!product) throw new NotFoundException(`ProductId ${id} not found`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } });
        product.images = images.map((image) => this.productImagesRepository.create({ url: image }));
      }

      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findeOnePlain(id);

    } catch (error) {

      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.handleExceptions(error);
    }

  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  async deleteAllProducts() {
    
    const query = this.productRepository.createQueryBuilder('product');
   
    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleExceptions(error);
    }

  }

  private handleExceptions(error: any) {
    if (error.code == 23505) throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException('Unexcepted error!');
  }
}
