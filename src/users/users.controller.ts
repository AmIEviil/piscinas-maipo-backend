import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES } from '../auth/constants/roles';
import { Audit } from '../audit/audit.decorator';
import { CreateUserAdminDto, UpdateUserAdminDto } from './dto/manage-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
@Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN)
@Audit('User')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<User> {
    return this.userService.findOne(id);
  }

  @Post()
  create(@Body() user: CreateUserAdminDto): Promise<User> {
    return this.userService.createUser(user);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() user: UpdateUserAdminDto,
  ): Promise<User> {
    return this.userService.update(id, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.userService.remove(id);
  }
}
