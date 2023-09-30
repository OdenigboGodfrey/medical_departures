/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import { MockRepo } from './../../../../../test/mocks/repo.mock';
import { BlogDTO } from '../../dto/blog.dto';
import { AppModule } from './../../../../app.module';
import { BlogController } from '../../controllers/blog.controller';
import { BlogService } from '../blog.service';
import { UserDTO } from './../../../../modules/user/dtos/user.dto';

dotenv.config();
jest.useFakeTimers();

describe('BlogController (e2e)', () => {
  let app: INestApplication;
  let serviceMockRepo: MockRepo<BlogDTO>;
  const userData: UserDTO = {
    email: 'test@yahoo.com',
    phone: '08108766400',
    password: 'password',
    fullName: 'Test User',
    gender: 'Male',
    dateOfBirth: undefined,
    status: '',
    id: 1,
  };
  const blogData: BlogDTO = {
    title: 'Title',
    userId: 1,
    content: 'Content',
  };
  let jwtService: JwtService;
  let jwtServiceMock = {};
  let authToken: string;

  beforeEach(async () => {
    serviceMockRepo = new MockRepo<BlogDTO>();
    jwtServiceMock = {
      sign: (arg1) => 'TOkseneuenffusns19383nfnidi',
      verifyAsync: (token: string, options?: any) => userData,
    };
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [BlogController],
      providers: [
        BlogService,
        {
          provide: 'BlogRepositoryInterface',
          useValue: serviceMockRepo,
        },
        {
          provide: 'JwtService',
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
    authToken = jwtService.sign(userData);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/create blog', () => {
    it('should create a new post', async () => {
      const response = await request(app.getHttpServer())
        .post('/blog/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send(blogData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data['dataValues'].id).toBeDefined();
    });
    it('should failed to create a new blog post', async () => {
      const mockError = new Error('Some error');
      serviceMockRepo.create = jest.fn().mockRejectedValue(mockError);
      const response = await request(app.getHttpServer())
        .post('/blog/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send(blogData);

      expect(response.status).toBe(500);
      expect(response.body.data).toEqual(null);
    });
  });

  describe('get all posts', () => {
    it('should retrieve all post', async () => {
      serviceMockRepo.findByCondition = async (
        entityModel: any,
        filterCondition: any,
      ) => {
        return [{ dataValues: blogData }];
      };
      const response = await request(app.getHttpServer())
        .get(`/blog/get-all`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body['data']['rows'][0].title).toBeDefined();
    });
    it('should not retrieve any user by user type', async () => {
      serviceMockRepo.findByCondition = async (
        entityModel,
        filterCondition,
      ): Promise<any> => {
        return [];
      };

      const response = await request(app.getHttpServer())
        .get(`/blog/get-all`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(response.status).toBe(200);
      expect(response.body.data['rows']).toBeDefined();
      expect(response.body.data['count']).toBe(1);
      expect(response.body.data['totalPages']).toBe(1);
    });
  });
});
