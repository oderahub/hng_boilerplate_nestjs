import { Repository } from 'typeorm';
import { User, UserType } from './entities/user.entity';
import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import CreateNewUserOptions from './options/CreateNewUserOptions';
import UserIdentifierOptionsType from './options/UserIdentifierOptions';
import UserResponseDTO from './dto/user-response.dto';
import { UpdateUserDto } from './dto/update-user-dto';
import UpdateUserResponseDTO from './dto/update-user-response.dto';
import { UserPayload } from './interfaces/user-payload.interface';

@Injectable()
export default class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async createUser(user: CreateNewUserOptions) {
    const newUser = new User();
    Object.assign(newUser, user);
    newUser.is_active = true;
    await this.userRepository.save(newUser);
  }

  private async getUserByEmail(email: string) {
    const user: UserResponseDTO = await this.userRepository.findOne({ where: { email: email } });
    return user;
  }

  private async getUserById(identifier: string) {
    const user: UserResponseDTO = await this.userRepository.findOne({ where: { id: identifier } });
    return user;
  }

  async getUserRecord(identifierOptions: UserIdentifierOptionsType) {
    const { identifier, identifierType } = identifierOptions;

    const GetRecord = {
      id: async () => this.getUserById(String(identifier)),
      email: async () => this.getUserByEmail(String(identifier)),
    };

    return await GetRecord[identifierType]();
  }

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
    currentUser: UserPayload
  ): Promise<UpdateUserResponseDTO> {
    if (!userId) {
      throw new BadRequestException('UserId is required');
    }

    const identifierOptions: UserIdentifierOptionsType = {
      identifierType: 'id',
      identifier: userId,
    };
    const user = await this.getUserRecord(identifierOptions);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if the current user is a super admin or the user being updated
    if (currentUser.user_type !== UserType.SUPER_ADMIN && currentUser.id !== userId) {
      throw new ForbiddenException('You are not authorized to update this user');
    }

    try {
      Object.assign(user, updateUserDto);
      await this.userRepository.save(user);
    } catch (error) {
      throw new BadRequestException('Failed to update user');
    }

    return {
      status: 'success',
      message: 'User Updated Successfully',
      user: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        phone_number: user.phone_number,
      },
    };
  }
}
