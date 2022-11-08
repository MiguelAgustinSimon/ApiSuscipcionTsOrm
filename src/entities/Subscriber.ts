import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,UpdateDateColumn, BaseEntity, OneToMany } from "typeorm";
import { Product_Subscription } from "./Product_Subscription";

@Entity('subscriber')
export class Subscriber extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    subscriber_id: string;

    @Column('uuid')
    organization_id:string;

    @Column()
    subscriber_name:string;

    @Column()
    subscriber_ref_id:string;

    @Column()
    subscriber_max_user_count:number;

    @CreateDateColumn()
    creation_date: Date;

    @Column({nullable: true})
    creation_user: string;

    @UpdateDateColumn()
    modification_date: Date;

    @Column({nullable: true})
    modification_user: string;

    //  //-------------------------------------RELACION SUBSCRIBER / PRODUCT-SUBSCRIPTION----------------------------------------
    // //Un producto va a aparecer en muchos ProducSubscription
    // @OneToMany(type => Product_Subscription, (ps) => ps.subscriber_id)
    // Product_Subscription: Product_Subscription[];

}