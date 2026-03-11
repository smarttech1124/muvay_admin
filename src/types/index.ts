export type AdminRoleId = 'super_admin' | 'operations_admin' | 'finance_admin' | 'support_admin';
export type PermAction = 'view'|'create'|'edit'|'delete'|'approve'|'suspend'|'reject'|'refund';

export interface Permission { resource: string; actions: PermAction[]; }

export const ROLE_META: Record<AdminRoleId, { label: string; color: string; description: string }> = {
  super_admin:      { label: 'Super Admin',      color: '#8b5cf6', description: 'Full system access. Can manage all admins and settings.' },
  operations_admin: { label: 'Operations Admin', color: '#3b82f6', description: 'Manages trips, activities, and influencer approvals.' },
  finance_admin:    { label: 'Finance Admin',    color: '#10b981', description: 'Access to transactions, revenue, and financial reports.' },
  support_admin:    { label: 'Support Admin',    color: '#f59e0b', description: 'Handles user management and booking support.' },
};

export const ROLE_PERMISSIONS: Record<AdminRoleId, Record<string, PermAction[]>> = {
  super_admin: {
    users:       ['view','create','edit','delete','suspend'],
    trips:       ['view','create','edit','delete','approve'],
    activities:  ['view','create','edit','delete','approve'],
    influencers: ['view','approve','reject'],
    bookings:    ['view','edit','delete'],
    transactions:['view','refund'],
    analytics:   ['view'],
    admins:      ['view','create','edit','delete'],
    logs:        ['view'],
    settings:    ['view','edit'],
  },
  operations_admin: {
    users:       ['view'],
    trips:       ['view','create','edit','approve'],
    activities:  ['view','create','edit','approve'],
    influencers: ['view','approve'],
    bookings:    ['view','edit'],
    transactions:[],
    analytics:   ['view'],
    admins:      [],
    logs:        ['view'],
    settings:    [],
  },
  finance_admin: {
    users:       ['view'],
    trips:       ['view'],
    activities:  ['view'],
    influencers: [],
    bookings:    ['view'],
    transactions:['view'],
    analytics:   ['view'],
    admins:      [],
    logs:        ['view'],
    settings:    [],
  },
  support_admin: {
    users:       ['view','edit','suspend'],
    trips:       ['view'],
    activities:  ['view'],
    influencers: ['view'],
    bookings:    ['view','edit'],
    transactions:['view'],
    analytics:   [],
    admins:      [],
    logs:        ['view'],
    settings:    [],
  },
};

export interface AdminUser {
  _id: string; id?: string; name: string; email: string;
  role: AdminRoleId; isActive: boolean;
  lastLogin?: string; createdAt: string; updatedAt: string; avatar?: string;
}

export type UserStatus = 'active' | 'suspended' | 'pending';
export type MemberTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface PlatformUser {
  _id: string; name: string; email: string; phone?: string;
  role: 'user' | 'influencer' | 'admin'; memberTier: MemberTier;
  isVerified: boolean; isActive: boolean; avatar?: string;
  createdAt: string; updatedAt: string;
  bookingCount?: number; totalSpent?: number;
}

export type TripStatus = 'active' | 'inactive' | 'pending' | 'rejected';

export interface AdminTrip {
  _id: string; title: string; slug: string; location: string;
  country: string; duration: string; price: number; originalPrice?: number;
  discount?: number; rating: number; reviewCount: number; category: string;
  tags: string[]; slots: number; image: string; description: string;
  status: TripStatus; featured: boolean;
  createdBy?: { _id: string; name: string; email: string };
  departure: string; createdAt: string; updatedAt: string;
  bookingCount?: number; revenue?: number;
}

export interface AdminActivity {
  _id: string; title: string; location: string; country: string;
  category: string; price: number; rating: number; reviewCount: number;
  duration: string; slots: number; image: string; description: string;
  status: 'active' | 'inactive' | 'pending';
  createdBy?: { _id: string; name: string; email: string };
  createdAt: string;
}

export type BookingStatus = 'pending'|'confirmed'|'upcoming'|'completed'|'cancelled'|'refunded';

export interface AdminBooking {
  _id: string; reference: string;
  userId: { _id: string; name: string; email: string };
  tripId?: { _id: string; title: string; location: string; image: string };
  activityId?: { _id: string; title: string; location: string };
  guests: number; date: string; totalAmount: number;
  discountAmount: number; serviceFee: number; status: BookingStatus;
  guestInfo: { firstName: string; lastName: string; email: string; phone: string };
  specialRequests?: string; createdAt: string;
}

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';

export interface AdminTransaction {
  _id: string; bookingId: { _id: string; reference: string };
  userId: { _id: string; name: string; email: string };
  amount: number; currency: string; status: PaymentStatus;
  method: string; transactionRef: string; createdAt: string;
}

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface InfluencerApplication {
  _id: string;
  userId: { _id: string; name: string; email: string; avatar?: string };
  fullName: string; platform: string; profileUrl: string;
  followerCount: string; niche: string; status: ApplicationStatus;
  reviewedBy?: { _id: string; name: string }; bio?: string;
  createdAt: string;
}

export interface ActivityLog {
  _id: string;
  adminId: { _id: string; name: string; email: string };
  action: string; resource: string; resourceId?: string;
  details?: string; ipAddress?: string;
  severity: 'info' | 'warning' | 'critical';
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number; newUsersToday: number; userGrowth7d: number;
  totalRevenue: number; revenueToday: number; revenueGrowth7d: number;
  totalBookings: number; bookingsToday: number; bookingGrowth7d: number;
  activeTrips: number; pendingApprovals: number; pendingInfluencers: number;
  revenueChart: { month: string; revenue: number; bookings: number }[];
  userGrowthChart: { date: string; count: number }[];
  bookingsByStatus: { status: string; count: number; color: string }[];
  topExperiences: { title: string; bookings: number; revenue: number; rating: number }[];
}

export interface PaginatedResponse<T> {
  success: boolean; data: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface TableFilters {
  search?: string; status?: string; page?: number; limit?: number;
  sort?: string; role?: string; category?: string;
  startDate?: string; endDate?: string;
}

export interface SystemSettings {
  siteName: string; siteUrl: string; supportEmail: string;
  maintenanceMode: boolean; allowRegistrations: boolean;
  maxBookingsPerUser: number; defaultCurrency: string;
  serviceFeePercent: number; commissionPercent: number;
  sessionTimeoutMinutes: number;
  emailNotifications: { bookingConfirmation: boolean; newUser: boolean; newBooking: boolean; paymentFailed: boolean };
}
