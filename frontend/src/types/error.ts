export interface ApiError {
  error: string;
  details?: {
    msg: string;
    path: string;
    location: string;
    type: string;
    value: string;
  }[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ErrorResponse {
  status: number;
  data: ApiError;
}
