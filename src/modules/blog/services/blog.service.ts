import { Inject, Injectable } from '@nestjs/common';
import { BlogRepositoryInterface } from '../repository/blog.repository';
import { BlogTypeDTO } from '../dto/blog.dto';
import { ResponseDTO } from './../../../shared/dto/response.dto';
import { Blog } from '../entities/blog.entity';
import { RESPONSE_CODE } from './../../../shared/enums/response-code.enum';
import { ErrorClass } from './../../../shared/dto/error-class.dto';
import {
  PaginationParameterDTO,
  PaginationParameterResponseDTO,
} from './../../../shared/dto/pagination.dto';

@Injectable()
export class BlogService {
  constructor(
    @Inject('BlogRepositoryInterface')
    private readonly repository: BlogRepositoryInterface,
  ) {}

  async createBlog(payload: BlogTypeDTO): Promise<ResponseDTO<Blog>> {
    const response = new ResponseDTO<Blog>();
    try {
      const user = await this.repository.create(Blog, payload);
      response.data = user;
      response.status = true;
      response.message = 'Blog post created.';
      response.code = RESPONSE_CODE._201;
    } catch (e) {
      const errorObject: ErrorClass<BlogTypeDTO> = {
        payload,
        error: e['errors'],
        response: null,
      };
      response.message = 'Something went wrong, please try again.';
      response.code = RESPONSE_CODE._500;
      errorObject.response = response;
      console.error(e.toString(), errorObject);
    }
    return response;
  }

  async getAllPosts(
    pagination: PaginationParameterDTO,
  ): Promise<ResponseDTO<PaginationParameterResponseDTO<Blog>>> {
    const response = new ResponseDTO<PaginationParameterResponseDTO<Blog>>();
    response.code = RESPONSE_CODE._200;
    response.message = 'No records found.';
    try {
      const paginationResponse = new PaginationParameterResponseDTO<Blog>();
      paginationResponse.rows = [];

      const buildQuery = { search: 'title' };
      const query = pagination.buildQuery(buildQuery);

      const result = await pagination.fetchPaginatedRecords<Blog>(
        Blog,
        this.repository,
        {
          query: query.where,
          sort: query.order,
        },
      );

      if (result && result.length > 0) {
        paginationResponse.rows = result;
        paginationResponse.count = await pagination.count(
          Blog,
          this.repository,
          query.where,
        );
        paginationResponse.totalPages = pagination.totalPages({
          count: paginationResponse.count,
        });
        response.data = paginationResponse;
        response.status = true;
        response.code = RESPONSE_CODE._200;
        response.message = 'Records fetched.';
      }
    } catch (e) {
      console.error('function', e);
      response.message = 'An error occurred.';
      response.extra_data = e.toString();
      response.code = RESPONSE_CODE._500;
      const errorObject: ErrorClass<any> = {
        payload: null,
        error: e['errors'],
        response: response,
      };
      console.error(e.toString(), errorObject);
    }
    return response;
  }

  async getBlogById(id: number): Promise<ResponseDTO<Blog>> {
    const response = new ResponseDTO<Blog>();
    try {
      const result = await this.repository.findOneByCondition(Blog, {
        id,
      });
      response.status = false;
      if (!result) {
        response.code = RESPONSE_CODE._404;
        response.message = 'Blog not found .';
        return response;
      } else {
        response.status = true;
        response.code = RESPONSE_CODE._200;
        response.data = result;
      }
    } catch (e) {
      response.message = 'An error occurred.';
      response.extra_data = e.toString();
      response.code = RESPONSE_CODE._500;
      const errorObject: ErrorClass<any> = {
        payload: null,
        error: e['errors'],
        response: response,
      };
      console.error(e.toString(), errorObject);
    }
    return response;
  }

  async updateBlog(
    blog: Blog,
    payload: BlogTypeDTO,
  ): Promise<ResponseDTO<boolean>> {
    const response = new ResponseDTO<boolean>();
    response.data = false;
    try {
      this.repository.UpdateOne(blog, payload);
      response.status = true;
      response.code = RESPONSE_CODE._200;
      response.data = true;
    } catch (e) {
      response.message = 'An error occurred.';
      response.extra_data = e.toString();
      response.code = RESPONSE_CODE._500;
      const errorObject: ErrorClass<any> = {
        payload: null,
        error: e['errors'],
        response: response,
      };
      console.error(e.toString(), errorObject);
    }
    return response;
  }

  async deleteBlog(blog: Blog): Promise<ResponseDTO<boolean>> {
    const response = new ResponseDTO<boolean>();
    response.data = false;
    try {
      // update password
      this.repository.remove(blog);
      response.status = true;
      response.code = RESPONSE_CODE._200;
      response.data = true;
    } catch (e) {
      response.message = 'An error occurred.';
      response.extra_data = e.toString();
      response.code = RESPONSE_CODE._500;
      const errorObject: ErrorClass<any> = {
        payload: null,
        error: e['errors'],
        response: response,
      };
      console.error(e.toString(), errorObject);
    }
    return response;
  }
}
