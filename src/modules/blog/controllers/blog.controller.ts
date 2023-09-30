import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiProduces,
  ApiConsumes,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseDTO } from '../../../shared/dto/response.dto';
import { BlogDTO, BlogTypeDTO, UpdateBlogTypeDTO } from '../dto/blog.dto';
import { BlogService } from '../services/blog.service';
import {
  PaginationParameterDTO,
  PaginationParameterRequestDTO,
  PaginationParameterResponseDTO,
} from '../../../shared/dto/pagination.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('blog')
@ApiTags('blog')
export class BlogController {
  constructor(private readonly service: BlogService) {}

  @ApiOperation({
    description: 'Create a new blog post',
  })
  @ApiProduces('json')
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiResponse({
    type: BlogDTO,
  })
  @Post('/create')
  @ApiBody({ type: BlogTypeDTO })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async create(@Body() data: BlogTypeDTO): Promise<ResponseDTO<BlogDTO>> {
    const response = await this.service.createBlog(data);
    return response.getResponse();
  }

  @ApiOperation({
    description: 'get all posts',
  })
  @ApiProduces('json')
  @ApiConsumes('application/json')
  @ApiResponse({
    type: BlogDTO,
    isArray: true,
  })
  @Get('/get-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getAll(
    @Query() pagination: PaginationParameterRequestDTO,
  ): Promise<ResponseDTO<PaginationParameterResponseDTO<BlogDTO>>> {
    const result = await this.service.getAllPosts(
      new PaginationParameterDTO(pagination),
    );
    const response = new ResponseDTO<PaginationParameterResponseDTO<BlogDTO>>({
      status: result.status,
      message: result.message,
      code: result.code,
    });
    response.data = new PaginationParameterResponseDTO<BlogDTO>({
      count: result.status ? result.data.count : 1,
      totalPages: result.status ? result.data.totalPages : 1,
    });
    if (result.status) {
      response.data.rows = result.data.rows.map((x) => x['dataValues']);
    }
    return response.getResponse();
  }

  @ApiOperation({
    description: 'get a blog post ',
  })
  @ApiProduces('json')
  @ApiConsumes('application/json')
  @ApiResponse({
    type: BlogDTO,
  })
  @Get('/get/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async get(@Param('id') id: number): Promise<ResponseDTO<BlogDTO>> {
    const result = await this.service.getBlogById(id);
    const response = new ResponseDTO<BlogDTO>({
      status: result.status,
      message: result.message,
      code: result.code,
    });
    if (result.status && result.data) {
      response.data = result.data['dataValues'];
    }
    return response.getResponse();
  }

  @ApiOperation({
    description: 'update a blog post',
  })
  @ApiProduces('json')
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiResponse({
    type: Boolean,
  })
  @Post('/update-blog')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: UpdateBlogTypeDTO })
  async update(@Body() data: UpdateBlogTypeDTO): Promise<ResponseDTO<boolean>> {
    let response = new ResponseDTO<boolean>();
    const result = await this.service.getBlogById(data.id);
    if (!result.status) {
      response = new ResponseDTO<boolean>({
        code: result.code,
        message: result.message,
        status: result.status,
      });
      return response.getResponse();
    }
    response = await this.service.updateBlog(result.data, data);
    return response.getResponse();
  }

  @ApiOperation({
    description: 'delete blog',
  })
  @ApiProduces('json')
  @ApiConsumes('application/json')
  @ApiResponse({
    type: Boolean,
  })
  @Delete('/delete/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async deletePatientAccount(
    @Param('id') id: number,
  ): Promise<ResponseDTO<boolean>> {
    const result = await this.service.getBlogById(id);
    const response = new ResponseDTO<boolean>();
    response.message = result.message;
    response.code = result.code;
    response.message = result.message;
    response.status = result.status;
    if (result.status) {
      // delete
      this.service.deleteBlog(result.data);
      response.message = 'Blog post deleted';
      response.data = null;
    }
    return response.getResponse();
  }
}
