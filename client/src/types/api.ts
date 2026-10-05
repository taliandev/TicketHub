import type { AxiosError } from 'axios';

// API Error Types
export interface ApiErrorResponse {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export type ApiError = AxiosError<ApiErrorResponse>;

// Generic API Response wrapper
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success?: boolean;
}

// Event handler types
export type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;
export type TextAreaChangeEvent = React.ChangeEvent<HTMLTextAreaElement>;
export type SelectChangeEvent = React.ChangeEvent<HTMLSelectElement>;
export type FormSubmitEvent = React.FormEvent<HTMLFormElement>;
export type ButtonClickEvent = React.MouseEvent<HTMLButtonElement>;

// Chart data types
export interface ChartDataItem {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface RevenueChartData {
  name: string;
  revenue: number;
  tickets: number;
}

export interface CategoryChartData {
  name: string;
  value: number;
  color: string;
}
