import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  Index,
} from 'sequelize-typescript';
import { IBlog } from '../interfaces/blog.interface';
import { User } from './../../../modules/user/entities/user.entity';

@Table({ tableName: 'Blog' })
export class Blog extends Model<Blog> implements IBlog {
  @Column(DataType.STRING)
  content: string;
  @Index('post-title')
  @Column(DataType.STRING)
  title: string;
  @ForeignKey(() => User)
  userId: number;
  @BelongsTo(() => User)
  readonly user: User;
}
