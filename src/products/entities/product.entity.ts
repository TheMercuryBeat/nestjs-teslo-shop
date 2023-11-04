import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";
import { User } from "src/auth/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity({ name: 'products' })
export class Product {

    @ApiProperty({ example: '0652d8bc-7dfb-494a-9655-2ab6cd640066', description: 'Product Id', uniqueItems: true })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ example: 'T-Shirt', description: 'Product title', uniqueItems: true })
    @Column('text', { unique: true })
    title: string;

    @ApiProperty({ example: 0, description: 'Product price' })
    @Column('float', { default: 0 })
    price: number;

    @ApiProperty({ example: 'Lorem ipsum dolor sit amet consectetur adipiscing', description: 'Product description', default: null })
    @Column('text', { nullable: true })
    description: string;

    @ApiProperty({ example: 't-shirt', description: 'Product slug', uniqueItems: true })
    @Column('text', { unique: true })
    slug: string;

    @ApiProperty({ example: 10, description: 'Product stock', default: 0 })
    @Column('numeric', { default: 0 })
    stock: number;

    @ApiProperty({ example: ['S', 'M', 'L'], description: 'Product size', default: [], isArray: true })
    @Column('text', { array: true })
    sizes: string[];

    @ApiProperty({ example: 'unisex', description: 'Product gender' })
    @Column('text')
    gender: string;

    @ApiProperty({ example: ['tshirt'], description: 'Product tags', default: [], isArray: true })
    @Column('text', { array: true, default: [] })
    tags: string[];

    @ApiProperty({ example: ['https://image01.jpg'], description: 'Product images', default: [], isArray: true })
    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        { cascade: true, eager: true }
    )
    images?: ProductImage[];

    @ApiProperty({ type: User, description: 'User information who created the product' })
    @ManyToOne(
        () => User,
        (user) => user.product,
        { eager: true, onDelete: 'CASCADE' }
    )
    user: User;

    @BeforeInsert()
    checkSlugInsert() {
        if (!this.slug) this.slug = this.title;
        this.slug = this.slug.toLowerCase().replaceAll(' ', '_')
    }

    @BeforeUpdate()
    checkSlugUpdate() {
        this.slug = this.slug.toLowerCase().replaceAll(' ', '_')
    }
}
