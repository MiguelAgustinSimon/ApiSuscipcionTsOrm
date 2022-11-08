import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,UpdateDateColumn, BaseEntity, ManyToOne } from "typeorm";
import { Product } from "./Product";

@Entity('product_scope')
export class Product_Scope extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    product_scope_id: string;

    @Column('uuid')
    product_id:string;

    @Column()
    product_max_access_count:number;

    @Column()
    product_max_user_count:number;

    @Column()
    scope_start_date:Date;

    @Column()
    scope_finish_date:Date;

    @Column()
    is_active:boolean;
    
    @CreateDateColumn()
    creation_date: Date;

    @Column({nullable: true})
    creation_user: string;

    @UpdateDateColumn()
    modification_date: Date;

    @Column({nullable: true})
    modification_user: string;

    // // -------------------------------------RELACION PRODUCTO / PRODUCT-SCOPE----------------------------------------
    // // Un Product_Scope va a contener un producto
    // @ManyToOne(type => Product, (ps) => ps.product_id)
    // Product: Product;

}