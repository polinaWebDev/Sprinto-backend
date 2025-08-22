import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from '@/modules/auth/auth.service';
import { RegisterDto } from '@/modules/auth/dto/register.dto';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserResponse } from '@/modules/users/dto/user.dto';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { plainToInstance } from 'class-transformer';
import { AuthGuard } from '@nestjs/passport';
import { CustomRequest } from '@/shared/Request';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @ApiOkResponse({
    type: UserResponse,
  })
  @Post('register')
  async register(@Body() data: RegisterDto, @Res() res: Response) {
    const { user, accessToken, refreshToken } =
      await this.authService.register(data);
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      maxAge: this.configService.get('JWT_ACCESS_EXPIRATION_TIME') * 1000,
      sameSite: 'lax',
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      maxAge: this.configService.get('JWT_REFRESH_EXPIRATION_TIME') * 1000,
      sameSite: 'lax',
    });
    return res.json(
      plainToInstance(UserResponse, user, { excludeExtraneousValues: true }),
    );
  }

  @ApiOkResponse({
    type: UserResponse,
  })
  @Post('login')
  async login(@Body() data: LoginDto, @Res() res: Response) {
    const user = await this.authService.validateUser(data);
    const { accessToken, refreshToken } = this.authService.generateTokens(user);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      maxAge: this.configService.get('JWT_ACCESS_EXPIRATION_TIME') * 1000,
      sameSite: 'lax',
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      maxAge: this.configService.get('JWT_REFRESH_EXPIRATION_TIME') * 1000,
      sameSite: 'lax',
    });
    return res.json(
      plainToInstance(UserResponse, user, { excludeExtraneousValues: true }),
    );
  }

  @ApiOkResponse()
  @Get('oauth')
  @UseGuards(AuthGuard('oauth'))
  async oauthLogin() {}

  @ApiOkResponse({
    type: UserResponse,
  })
  @Get('google/redirect')
  @UseGuards(AuthGuard('oauth'))
  async oauthCallback(@Req() req: CustomRequest, @Res() res: Response) {
    const user = req.user;

    if (!user) {
      return res.redirect('/login');
    }

    const { accessToken, refreshToken } = this.authService.generateTokens(user);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      maxAge: this.configService.get('JWT_ACCESS_EXPIRATION_TIME') * 1000,
      sameSite: 'lax',
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      maxAge: this.configService.get('JWT_REFRESH_EXPIRATION_TIME') * 1000,
      sameSite: 'lax',
    });

    return res.redirect(this.configService.get('FRONTEND_URL') + '/');
  }
}
