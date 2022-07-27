import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,UpdateDateColumn, BaseEntity } from "typeorm";

@Entity()
export class Product extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

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

}