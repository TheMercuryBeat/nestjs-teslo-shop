import { BadRequestException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from "bcrypt";
import { Repository } from 'typeorm';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  private readonly logger = new Logger('AuthService')

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService) { }

  async create(createUserDto: CreateUserDto) {

    try {

      const { password, ...userData } = createUserDto;
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });

      await this.userRepository.save(user);
      delete user.password;

      const jwtPayload: JwtPayload = { id: user.id };
      return {
        ...user,
        token: this.generateJwt(jwtPayload)
      };

    } catch (error) {
      this.handleError(error);
    }

  }

  async login(loginUserDto: LoginUserDto) {


    const { email, password } = loginUserDto;
    const user = await this.userRepository.findOne({
      select: { id: true, email: true, password: true },
      where: { email }
    });

    if (user && bcrypt.compareSync(password, user.password)) {
      const jwtPayload: JwtPayload = { id: user.id };
      return {
        ...user,
        token: this.generateJwt(jwtPayload)
      };
    }

    throw new UnauthorizedException('No valid credentials')

  }

  async checkAuthStatus(user: User) {

    const jwtPayload: JwtPayload = { id: user.id };
    return {
      ...user,
      token: this.generateJwt(jwtPayload)
    };

  }

  private generateJwt(jwtPayload: JwtPayload) {
    return this.jwtService.sign(jwtPayload);
  }

  private handleError(error: any): never {

    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException('Check server logs')

  }

}
