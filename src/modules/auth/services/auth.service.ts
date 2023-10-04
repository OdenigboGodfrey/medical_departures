import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from '../constants';
import { AuthUserDTO } from '../dto/auth.dto';
import { ResponseDTO } from '../../../shared/dto/response.dto';
import { UserService } from '../../user/services/user.service';
import { UserDTO } from '../../user/dtos/user.dto';
import { RESPONSE_CODE } from './../../../shared/enums/response-code.enum';
import { ErrorClass } from './../../../shared/dto/error-class.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject('JwtService') private jwtService: JwtService,
    @Inject('UserService') private readonly userService: UserService,
  ) {}

  logger = {
    error: (...args: any) => console.error(args),
    info: (...args: any) => console.log(args),
  };

  userDTO(data: any) {
    return this.userService.newUserDTO(data);
  }

  async fetchUserFromDB(
    login: string,
    password: string,
  ): Promise<ResponseDTO<UserDTO>> {
    console.log('login', login, 'password', password);
    const result = await this.userService.getUserByLoginAndPassword(
      login,
      password,
    );
    console.log('result', result);
    return result;
  }

  generateJWT(userObject: any): ResponseDTO<AuthUserDTO> {
    const response = new ResponseDTO<AuthUserDTO>();
    try {
      const authUserDTO = new AuthUserDTO({});
      authUserDTO.token = this.jwtService.sign(
        { ...userObject },
        { secret: jwtConstants.secret },
      );
      response.data = authUserDTO;
      response.status = true;
      response.code = '200';
    } catch (e) {
      console.error('generateJWT', e);
      response.message = 'An error occurred.';
      response.extra_data = e.toString();
      response.code = RESPONSE_CODE._500;
      const errorObject: ErrorClass<any> = {
        payload: null,
        error: e['errors'],
        response: response,
      };
      this.logger.error(e.toString(), errorObject);
    }
    return response;
  }

  async fetchUserFromDBWithEmail(email: string): Promise<ResponseDTO<UserDTO>> {
    const response = new ResponseDTO<UserDTO>();
    const result = await this.userService.getUserByEmail(email);
    if (result.status) {
      response.data = this.userService.newUserDTO(result.data);
    }

    response.code = result.code;
    response.message = result.message;
    response.status = result.status;

    return response;
  }
}
