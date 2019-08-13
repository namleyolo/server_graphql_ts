// import {Entity, PrimaryGeneratedColumn, Column, BaseEntity} from "typeorm";

// @Entity("users")
// export class User  extends BaseEntity{

//     @PrimaryGeneratedColumn()
//     id: number;

//     @Column("text")
//     email: string;
    
//     @Column("text",{nullable: true})
//     stripeId: string;

//     @Column("text",{default:"free-trial"})
//     type: string;

//     @Column("text")
//     password: string;

// }

import {Entity, PrimaryGeneratedColumn, Column, BaseEntity} from "typeorm";

@Entity("device")
export class Device  extends BaseEntity{

    @PrimaryGeneratedColumn()
    id: number;
  
    @Column("int",{default:0})
    count: number; 

    @Column("int",{default:0})
    status: number; 

}
