import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from "bcrypt";


@Injectable()
export class SeedService {

  constructor(
    private readonly productsService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>) { }

  async runSeed() {
    await this.deleteTables();
    const adminUser = await this.insertUsers();
    await this.insertNewProducts(adminUser);
    return 'Seed Executed!'
  }

  private async deleteTables() {
    await this.productsService.deleteAllProducts();
    await this.userRepository.delete({});
  }

  private async insertUsers() {
    const seedUsers = initialData.users;
    const users = seedUsers
      .map(({ password, ...userInfo }) => ({
        ...userInfo,
        password: bcrypt.hashSync(password, 10)
      }))
      .map((seedUser) => this.userRepository.create(seedUser));
    const dbUsers = await this.userRepository.save(users);
    return dbUsers[0];
  }

  private async insertNewProducts(user: User) {

    await this.productsService.deleteAllProducts();

    const products = initialData.products;
    const insertPromises = products.map((product) => (this.productsService.create(product, user)));

    await Promise.all(insertPromises);
    return true;

  }

}
