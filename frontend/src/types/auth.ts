export interface User {
  id: number;
  email: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  name: string;
}
