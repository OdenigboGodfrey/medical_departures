import { Module } from '@nestjs/common';
import { BlogController } from './controllers/blog.controller';
import { BlogService } from './services/blog.service';
import { BlogRepository } from './repository/blog.repository';

@Module({
  controllers: [BlogController],
  providers: [
    BlogService,
    {
      provide: 'BlogRepositoryInterface',
      useClass: BlogRepository,
    },
  ],
})
export class BlogModule {}
