import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { JwtStrategy } from './jwt.strategy';
import { UserService } from '../user/services/user.service';
import { UserRepository } from '../user/repository/user.repository';

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.register({
      secret: jwtConstants.getSecret(),
      signOptions: { expiresIn: '6000s' },
    }),
    // CacheModule.register(),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: 'JwtService',
      useClass: JwtService,
    },
    {
      provide: 'UserService',
      useClass: UserService,
    },
    {
      provide: 'UserRepositoryInterface',
      useClass: UserRepository,
    },
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
