import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Auth, GetUser, RawHeaders } from './decorators';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RoleProtected } from './decorators/role-protected.decorator';
import { ValidRoles } from './interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('check')
  @Auth()
  checkAuthStatus(@GetUser() user: User){
    return this.authService.checkAuthStatus(user);
  }  

  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    @RawHeaders() rawHeaders: string[],
    @GetUser() user: User,
    @GetUser('email') userEmail: string) {
    return {
      msg: 'HI Private!!',
      user,
      userEmail,
      rawHeaders
    }
  }

  @Get('private2')
  @RoleProtected(ValidRoles.ADMIN, ValidRoles.SUPERUSER)
  @UseGuards(AuthGuard(), UserRoleGuard)
  testingPrivate2Route(@GetUser() user: User) {
    return {
      msg: 'HI Private 2!!',
      user,
    }
  }

  @Get('private3')
  @Auth(ValidRoles.SUPERUSER, ValidRoles.ADMIN)
  testingPrivate3Route(@GetUser() user: User) {
    return {
      msg: 'HI Private 3!!',
      user,
    }
  }

}
