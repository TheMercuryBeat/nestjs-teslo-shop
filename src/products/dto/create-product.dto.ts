import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator";

export class CreateProductDto {

    @ApiProperty({ example: 'Teslo T-Shirt', description: 'Product Title' })
    @IsString()
    @MinLength(1)
    title: string;

    @ApiProperty({ example: 5.99, description: 'Product price', required: false })
    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?: number;

    @ApiProperty({ example: 'Vulputate eleifend nibh', description: 'Product description', required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: 'teslo_t-shirt', description: 'Product Slug', required: false })
    @IsString()
    @IsOptional()
    slug?: string;

    @ApiProperty({ example: 10, description: 'Product stock', required: false })
    @IsInt()
    @IsPositive()
    @IsOptional()
    stock?: number;

    @ApiProperty({ example: ['L', 'XL'], description: 'Product sizes', isArray: true, })
    @IsString({ each: true })
    @IsArray()
    sizes: string[];

    @ApiProperty({ example: 'kid', description: 'Product gender' })
    @IsString()
    @IsIn(['men', 'women', 'kid', 'unisex'])
    gender: string;

    @ApiProperty({ example: ['tshirt'], description: 'Product tags', isArray: true, required: false })
    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    tags?: string[];

    @ApiProperty({ example: ['https://image_100.jpg'], description: 'Product images', isArray: true, required: false })
    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    images?: string[];

}
