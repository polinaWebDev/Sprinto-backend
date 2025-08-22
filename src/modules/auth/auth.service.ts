import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from '@/modules/auth/dto/register.dto';
import { User } from '@/modules/users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@/modules/users/users.service';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { compare, hash } from 'bcrypt';

interface OAuthProfile {
  email: string;
  displayName: string;
  provider: 'google';
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(data: RegisterDto) {
    const { email, password } = data;
    const existingUser = await this.userService.findOneByEmail(email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }
    data.password = await hash(password, 10);

    const user = await this.userService.create({ ...data });

    const { accessToken, refreshToken } = this.generateTokens(user);

    return { user, refreshToken, accessToken };
  }

  async validateUser(data: LoginDto): Promise<User> {
    const { email, password } = data;
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Credentials is invalid');
    }
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('credentials is invalid');
    }
    return user;
  }

  generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION_TIME') * 1000,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION_TIME') * 1000,
    });
    return { accessToken, refreshToken };
  }

  async validateOAuthLogin(profile: OAuthProfile): Promise<User> {
    const user = await this.userService.findOneByEmail(profile.email);

    if (!user) {
      const newUser = await this.userService.create({
        email: profile.email,
        firstName: profile.displayName,
        password: await hash(profile.email, 10),
        lastName: '',
        phoneNumber: '',
      });
      return newUser;
    }

    return user;
  }
}
