import { Column, Entity } from 'typeorm';
import { DefaultEntity } from '@/shared/helpers/default.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class User extends DefaultEntity {
  @ApiProperty()
  @Column()
  email: string;

  @ApiProperty()
  @Column()
  password: string;

  @ApiProperty()
  @Column()
  firstName: string;

  @ApiProperty()
  @Column()
  lastName: string;

  @ApiProperty()
  @Column()
  phoneNumber: string;
}
