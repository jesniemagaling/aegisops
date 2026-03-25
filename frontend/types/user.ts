export interface User {
  id: string;
  email: string;
  fullName: string;
  status: string;
  roles: string[];
}

export interface CreateUserRequest {
  email: string;
  fullName: string;
}
