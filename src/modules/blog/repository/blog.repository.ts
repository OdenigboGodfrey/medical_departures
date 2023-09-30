import { Injectable } from '@nestjs/common';
import { BaseAbstractRepository } from '../../../repositories/base/base.abstract.repository';
import { BaseInterfaceRepository } from '../../../repositories/base/base.interface.repository';
import { Blog } from '../entities/blog.entity';

export type BlogRepositoryInterface = BaseInterfaceRepository<Blog>;

@Injectable()
export class BlogRepository
  extends BaseAbstractRepository<Blog>
  implements BlogRepositoryInterface
{
  constructor() {
    super();
  }
}
