export interface User {
  id: number;
  name: string;
  password: string;
  email?: string;
  avatar?: string;
}

export interface Credentials {
  name: string;
  password: string;
}

interface UserDto {
  id: string;
  name: string;
  password: string;
  email?: string;
  avatar?: string;
}

export const dtoToUser = (dto: UserDto): User => ({
  id: Number(dto.id),
  name: dto.name,
  password: dto.password,
  email: dto.email,
  avatar: dto.avatar,
});
