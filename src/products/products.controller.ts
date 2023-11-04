import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';
import { ValidRoles } from 'src/auth/interfaces';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';
import { Product } from './entities';

@ApiTags('Products')
@Controller('products')
export class ProductsController {

  constructor(private readonly productsService: ProductsService) { }

  @Post()
  @Auth(ValidRoles.ADMIN)
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: 'Product was created', type: Product })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiForbiddenResponse({ description: 'No valid token' })
  create(
    @Body() createProductDto: CreateProductDto,
    @GetUser() user: User) {
    return this.productsService.create(createProductDto, user);
  }

  @Get()
  @ApiOkResponse({ description: 'Found product' })
  @ApiNotFoundResponse({ description: 'Not found product' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.productsService.findAll(paginationDto);
  }

  @Get(':term')
  @ApiParam({ name: 'term', description: 'Term of seach' })
  @ApiOkResponse({ description: 'Found product' })
  @ApiNotFoundResponse({ description: 'Not found product' })
  findOne(@Param('term') term: string) {
    return this.productsService.findeOnePlain(term);
  }

  @Patch(':id')
  @Auth(ValidRoles.ADMIN)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Product was updated', type: Product })
  @ApiNotFoundResponse({ description: 'Not found product' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiForbiddenResponse({ description: 'No valid token' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @GetUser() user: User) {
    return this.productsService.update(id, updateProductDto, user);
  }

  @Delete(':id')
  @Auth(ValidRoles.ADMIN)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Product was updated', type: Product })
  @ApiNotFoundResponse({ description: 'Not found product' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiForbiddenResponse({ description: 'No valid token' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
