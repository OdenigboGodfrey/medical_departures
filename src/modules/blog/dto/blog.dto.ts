import { ApiProperty } from '@nestjs/swagger';
import { IBlog } from '../interfaces/blog.interface';

export class BlogDTO implements IBlog {
  public constructor(init?: Partial<BlogDTO>) {
    Object.assign(this, init);
  }
  @ApiProperty()
  title: string;
  @ApiProperty()
  userId: number;
  @ApiProperty()
  content: string;

  @ApiProperty()
  createdAt?: Date;
  @ApiProperty()
  updatedAt?: Date;
  @ApiProperty()
  deletedAt?: Date;
}

export type BlogType = Omit<
  BlogDTO,
  'createdAt' | 'updatedAt' | 'deletedAt' | 'userId'
>;

export class BlogTypeDTO implements BlogType {
  public constructor(init?: Partial<BlogTypeDTO>) {
    Object.assign(this, init);
  }
  @ApiProperty()
  title: string;
  @ApiProperty()
  userId: number;
  @ApiProperty()
  content: string;
}

export class UpdateBlogTypeDTO {
  public constructor(init?: Partial<UpdateBlogTypeDTO>) {
    Object.assign(this, init);
  }
  @ApiProperty()
  id: number;
  @ApiProperty()
  title: string;
  @ApiProperty()
  userId: number;
  @ApiProperty()
  content: string;
}
