import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,UpdateDateColumn, BaseEntity, ManyToOne, OneToOne, JoinColumn } from "typeorm";
import { Product } from "./Product";
import { Product_Scope } from "./Product_Scope";
import { Subscriber } from "./Subscriber";

@Entity('comm_prod.product_subscription')
export class Product_Subscription extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    product_subscription_id: string;

    @Column('uuid')
    subscriber_id:string;

    @Column('uuid')
    product_id:string;

    @Column()
    subscription_start_date:Date;

    @Column()
    subscription_finish_date:Date;

    @Column({
        default:true
    })
    is_active:Boolean;
    
    @Column('uuid')
    account_executive_ref_id:string;

    @CreateDateColumn()
    creation_date: Date;

    @Column({nullable: true})
    creation_user: string;

    @UpdateDateColumn()
    modification_date: Date;

    @Column({nullable: true})
    modification_user: string;

    //-------------------------------------RELACION PRODUCTO / PRODUCT-SUBSCRIPTION----------------------------------------
   //Un productSubscription va a contener un producto
    @ManyToOne(() => Product, (p) => p.product_Subscriptions)
    @JoinColumn({name:'product_id'})
    product: Product;

    //-------------------------------------RELACION SUBSCRIBER / PRODUCT-SUBSCRIPTION----------------------------------------
   //Un productSubscription va a contener un producto
   @ManyToOne(type => Subscriber, (p) => p.product_Subscriptions)
   @JoinColumn({name:'subscriber_id'})
   subscriber: Subscriber;

 
}