import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,UpdateDateColumn, BaseEntity, OneToOne, OneToMany, JoinColumn, ManyToOne } from "typeorm";
import { Product_Subscription } from "../entities/Product_Subscription";
import { Product_Scope } from "./Product_Scope";
import { Product_Type } from "./Product_Type";

@Entity('product')
export class Product extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    product_id: string;

    @Column()
    product_code:string;

    @Column()
    product_name:string;

    @Column()
    product_type_id:number;

    @Column()
    apply_eol:string;

    @Column()
    apply_ius:string;

    @CreateDateColumn()
    creation_date: Date;

    @Column({nullable: true})
    creation_user: string;

    @UpdateDateColumn()
    modification_date: Date;

    @Column({nullable: true})
    modification_user: string;

    //-------------------------------------RELACION PRODUCTO / PRODUCT-SUBSCRIPTION----------------------------------------
    //Relacion 1-M: https://www.youtube.com/watch?v=tEf-ch1OknA&ab_channel=nicobytes
    //Un producto va a aparecer en muchos ProducSubscription
    @OneToMany(()=> Product_Subscription, (ps) => ps.product)
    product_Subscriptions: Product_Subscription[];

    // //-------------------------------------RELACION PRODUCTO / PRODUCT-SCOPE----------------------------------------
    // //Un producto va a aparecer en muchos Product_Scope
    //  @OneToMany(type => Product_Scope, (ps) => ps.product_id)
    //  Product_Scope: Product_Scope[];
    
    //  //-------------------------------------RELACION PRODUCTO / PRODUCT-TYPE----------------------------------------
    //  //Un producto va a tener un Product_Type
    // @ManyToOne(type => Product_Type, (p) => p.product_type_id)
    // Product_Type: Product_Type;
}


