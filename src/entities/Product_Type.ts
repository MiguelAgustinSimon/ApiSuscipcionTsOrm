import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,UpdateDateColumn, BaseEntity, OneToMany } from "typeorm";
import { Product } from "./Product";

@Entity('product_type')
export class Product_Type extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    product_type_id: string;

    @Column()
    product_type_code:string;

    @Column()
    product_type_name:string;

    @CreateDateColumn()
    creation_date: Date;

    @Column({nullable: true})
    creation_user: string;

    @UpdateDateColumn()
    modification_date: Date;

    @Column({nullable: true})
    modification_user: string;

     //-------------------------------------RELACION PRODUCTO / PRODUCT-TYPE----------------------------------------
    //Un product_type va a aparecer en muchos Product
    @OneToMany(type => Product, (p) => p.product_type_id)
    Product: Product[];
}