import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({nullable: true})
  name: string;

  @Column({nullable: true})
  email: string;

  @Column({nullable: true})
  birthdate: string;

  @Column({nullable: true})
  sex: string;
}
