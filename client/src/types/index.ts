// Core Types
export interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'user' | 'organizer' | 'admin';
  avatar?: string;
  phone?: string;
  address?: string;
  isBanned?: boolean;
  isVerified?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface TicketType {
  _id?: string;
  name: string;
  price: number;
  available: number;
  sold?: number;
  description?: string;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  date: string | Date;
  time?: string;
  location: string;
  venue?: string;
  address?: string;
  image: string;
  category: string;
  organizerId: string | User;
  ticketTypes: TicketType[];
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  views?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Ticket {
  _id: string;
  eventId: string | Event;
  userId: string | User;
  type: string;
  price: number;
  currency?: string;
  quantity_total: number;
  status: 'pending' | 'paid' | 'reserved' | 'cancelled' | 'used';
  ticketCode: string;
  qrCode?: string;
  used: boolean;
  usedAt?: Date;
  purchaseDate: Date;
  paidAt?: Date;
  paymentMethod?: 'qr_code' | 'momo' | 'vnpay' | 'cash';
  extraInfo?: {
    fullName: string;
    email: string;
    phone: string;
    cccd: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrganizerApplication {
  _id: string;
  userId: string | User;
  organizationName: string;
  email: string;
  phone: string;
  website?: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string | User;
  rejectionReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BookingData {
  eventId: string;
  ticketType: string;
  quantity: number;
  customerInfo?: {
    fullName: string;
    email: string;
    phone: string;
    cccd: string;
  };
}

export interface Reservation {
  _id: string;
  reservationId: string;
  eventId: string;
  userId: string;
  ticketType: string;
  quantity: number;
  expiresAt: Date;
  createdAt: Date;
}

export interface PaymentTransaction {
  transactionId: string;
  method: 'qr_code' | 'momo' | 'vnpay';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  qrCodeUrl?: string;
  paymentUrl?: string;
  ticketId?: string;
  reservationId?: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalEvents: number;
  totalTickets: number;
  totalRevenue: number;
  recentUsers: User[];
  recentEvents: Event[];
  revenueByMonth: Array<{ month: string; revenue: number }>;
  eventsByCategory: Array<{ category: string; count: number }>;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface FormEvent {
  title: string;
  description: string;
  date: string;
  time?: string;
  location: string;
  venue?: string;
  address?: string;
  image: string;
  category: string;
  ticketTypes: TicketType[];
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Hook Return Types
export interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User> & { password: string }) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

export interface UseEventsReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
  fetchEvents: () => Promise<void>;
  createEvent: (event: FormEvent) => Promise<void>;
  updateEvent: (id: string, event: Partial<FormEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
}
