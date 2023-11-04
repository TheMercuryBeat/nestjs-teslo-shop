import { ApiProperty } from "@nestjs/swagger";
import { Product } from "src/products/entities";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ValidRoles } from "../interfaces";

@Entity('users')
export class User {

    @ApiProperty({ example: 'a7861318-6eef-4daf-942b-8f94fff08ddd', description: 'User Id' })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ example: 'user@mail.com', description: 'User email', uniqueItems: true })
    @Column('text', { unique: true })
    email: string;

    @Column('text', { select: false })
    password: string;

    @ApiProperty({ example: 'User Lastname', description: 'User fullname' })
    @Column('text')
    fullname: string;

    @Column('bool', { default: true })
    isActive: boolean;

    @ApiProperty({ example: ['user'], enum: ValidRoles, description: 'User roles', isArray: true })
    @Column('text', { array: true, default: ['user'] })
    roles: string[];

    @OneToMany(
        () => Product,
        (product) => product.user
    )
    product?: Product[];

    @BeforeInsert()
    @BeforeUpdate()
    checkFieldsBeforeInsert() {
        this.email = this.email.toLowerCase().trim();
    }

}
