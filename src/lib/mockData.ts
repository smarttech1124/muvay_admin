import { DashboardStats, PlatformUser, AdminTrip, AdminActivity, AdminBooking, AdminTransaction, InfluencerApplication, ActivityLog, AdminUser } from '@/types';

const rnd = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = <T>(arr: T[]) => arr[rnd(0, arr.length - 1)];

// ── Dashboard Stats ──────────────────────────────────────────────────────────
export const MOCK_STATS: DashboardStats = {
  totalUsers: 10482, newUsersToday: 47, userGrowth7d: 8.3,
  totalRevenue: 482950, revenueToday: 8340, revenueGrowth7d: 12.7,
  totalBookings: 3841, bookingsToday: 23, bookingGrowth7d: 5.2,
  activeTrips: 48, pendingApprovals: 7, pendingInfluencers: 4,
  revenueChart: [
    { month:'Aug', revenue:28400, bookings:182 },
    { month:'Sep', revenue:34800, bookings:221 },
    { month:'Oct', revenue:41200, bookings:268 },
    { month:'Nov', revenue:38900, bookings:249 },
    { month:'Dec', revenue:52600, bookings:341 },
    { month:'Jan', revenue:47800, bookings:305 },
    { month:'Feb', revenue:55200, bookings:358 },
    { month:'Mar', revenue:61400, bookings:394 },
  ],
  userGrowthChart: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 864e5).toLocaleDateString('en', { month:'short', day:'numeric' }),
    count: rnd(18, 72),
  })),
  bookingsByStatus: [
    { status:'Confirmed', count:1240, color:'#3b82f6' },
    { status:'Completed', count:1820, color:'#10b981' },
    { status:'Pending',   count:380,  color:'#f59e0b' },
    { status:'Cancelled', count:290,  color:'#ef4444' },
    { status:'Refunded',  count:111,  color:'#8b5cf6' },
  ],
  topExperiences: [
    { title:'Santorini Sunset Weekend',    bookings:142, revenue:120700, rating:4.9 },
    { title:'Serengeti Wildlife Safari',   bookings:98,  revenue:274400, rating:5.0 },
    { title:'Kyoto Tea & Tradition Trail', bookings:124, revenue:148800, rating:4.8 },
    { title:'Bali Yoga & Wellness',        bookings:186, revenue:182280, rating:4.7 },
    { title:'Bangkok Street Food Crawl',   bookings:312, revenue:118656, rating:4.8 },
  ],
};

// ── Users ────────────────────────────────────────────────────────────────────
const NAMES = ['Aisha Mensah','Marcus Adeyemi','Camille Fontaine','James Ochieng','Sofia Conti','Layla Osei','Carlos Soto','Yuki Tanaka','Elena Vasquez','Haruki Sato','Malee Charin','Pablo Ruiz','Keiko Yamamoto','Niko Papadakis','Brad Wilson'];
const COUNTRIES = ['Lagos, NG','London, UK','Paris, FR','Nairobi, KE','Rome, IT','Dubai, UAE','Tokyo, JP','Bangkok, TH','NYC, US','Berlin, DE'];

export const MOCK_USERS: PlatformUser[] = Array.from({ length: 50 }, (_, i) => ({
  _id: `user_${i + 1}`,
  name: NAMES[i % NAMES.length] + (i >= NAMES.length ? ` ${Math.floor(i/NAMES.length)+1}` : ''),
  email: `user${i+1}@example.com`,
  phone: `+1 555 ${rnd(100,999)} ${rnd(1000,9999)}`,
  role: i < 3 ? 'influencer' : 'user' as any,
  memberTier: pick(['bronze','silver','gold','platinum'] as any),
  isVerified: Math.random() > 0.3,
  isActive: Math.random() > 0.08,
  createdAt: new Date(Date.now() - rnd(1, 500) * 864e5).toISOString(),
  updatedAt: new Date().toISOString(),
  bookingCount: rnd(0, 15),
  totalSpent: rnd(0, 8000),
}));

// ── Trips ────────────────────────────────────────────────────────────────────
const TRIP_TITLES = ['Santorini Sunset Weekend','Kyoto Tea & Tradition Trail','Patagonia Wilderness Trek','Bali Yoga & Wellness Retreat','Serengeti Wildlife Safari','Amalfi Foodie Road Trip','Morocco Desert Adventure','Iceland Northern Lights','Maldives Dive & Snorkel','Peru Machu Picchu Trek'];
const TRIP_STATUS: any[] = ['active','active','active','active','pending','inactive'];

export const MOCK_TRIPS: AdminTrip[] = TRIP_TITLES.map((title, i) => ({
  _id: `trip_${i+1}`, title, slug: title.toLowerCase().replace(/\s+/g,'-'),
  location: COUNTRIES[i % COUNTRIES.length], country: 'Various',
  duration: `${rnd(3,12)} Days`, price: rnd(400, 3000),
  originalPrice: rnd(500, 3500), discount: rnd(10,25),
  rating: parseFloat((rnd(42,50) / 10).toFixed(1)),
  reviewCount: rnd(40, 420),
  category: pick(['Hiking','Wellness','Adventure','Food & Culture','Road Trip','Photography']),
  tags: ['Community','Adventure','Nature'],
  slots: rnd(4, 20), image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400',
  description: 'A community-driven experience hosted on Muvay.',
  status: pick(TRIP_STATUS), featured: i < 3,
  createdBy: { _id: `user_${i+1}`, name: NAMES[i % NAMES.length], email: `host${i+1}@example.com` },
  departure: 'Every Saturday',
  createdAt: new Date(Date.now() - rnd(10, 200) * 864e5).toISOString(),
  updatedAt: new Date().toISOString(),
  bookingCount: rnd(10, 200), revenue: rnd(5000, 150000),
}));

// ── Activities ───────────────────────────────────────────────────────────────
const ACT_TITLES = ['Dawn Yoga on the Caldera','Ramen From Scratch Masterclass','Ice Trek on Perito Moreno','Sunset Catamaran Sail','Bamboo Forest & Matcha','Bangkok Street Food Crawl','Helicopter Glacier Landing','Pottery Workshop Kyoto'];

export const MOCK_ACTIVITIES: AdminActivity[] = ACT_TITLES.map((title, i) => ({
  _id: `act_${i+1}`, title, location: COUNTRIES[i % COUNTRIES.length],
  country: 'Various', category: pick(['Wellness','Food & Drink','Adventure','Culture','Creative Arts']),
  price: rnd(0, 280), rating: parseFloat((rnd(42,50)/10).toFixed(1)),
  reviewCount: rnd(20, 450), duration: `${rnd(1,6)} hours`,
  slots: rnd(6, 20), image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
  description: 'A hands-on community activity hosted on Muvay.',
  status: pick(['active','active','active','pending','inactive'] as any),
  createdBy: { _id: `user_${i+1}`, name: NAMES[i % NAMES.length], email: `host${i+1}@example.com` },
  createdAt: new Date(Date.now() - rnd(5, 180) * 864e5).toISOString(),
}));

// ── Bookings ─────────────────────────────────────────────────────────────────
const BOOKING_STATUS: any[] = ['confirmed','confirmed','completed','completed','pending','cancelled','upcoming','refunded'];
const REFS = Array.from({length:30}, (_,i) => `MVY-${Math.random().toString(36).substr(2,6).toUpperCase()}`);

export const MOCK_BOOKINGS: AdminBooking[] = Array.from({ length: 30 }, (_, i) => ({
  _id: `booking_${i+1}`, reference: REFS[i],
  userId: { _id: `user_${rnd(1,15)}`, name: NAMES[i % NAMES.length], email: `user${i+1}@example.com` },
  tripId: { _id: `trip_${rnd(1,8)}`, title: TRIP_TITLES[i % TRIP_TITLES.length], location: COUNTRIES[i % COUNTRIES.length], image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=200' },
  guests: rnd(1, 4), date: new Date(Date.now() + rnd(-30, 120) * 864e5).toLocaleDateString(),
  totalAmount: rnd(400, 5800), discountAmount: rnd(0, 200), serviceFee: rnd(20, 200),
  status: pick(BOOKING_STATUS),
  guestInfo: { firstName: NAMES[i%NAMES.length].split(' ')[0], lastName: NAMES[i%NAMES.length].split(' ')[1] || 'Doe', email: `user${i+1}@example.com`, phone: '+1 555 0000' },
  specialRequests: i % 4 === 0 ? 'Vegetarian meals please' : undefined,
  createdAt: new Date(Date.now() - rnd(1, 90) * 864e5).toISOString(),
}));

// ── Transactions ─────────────────────────────────────────────────────────────
const TX_STATUS: any[] = ['success','success','success','pending','failed','refunded'];

export const MOCK_TRANSACTIONS: AdminTransaction[] = MOCK_BOOKINGS.slice(0, 25).map((b, i) => ({
  _id: `txn_${i+1}`,
  bookingId: { _id: b._id, reference: b.reference },
  userId: b.userId,
  amount: b.totalAmount, currency: 'USD',
  status: pick(TX_STATUS),
  method: pick(['card','bank_transfer','paypal']),
  transactionRef: `TXN-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
  createdAt: b.createdAt,
}));

// ── Influencer Applications ───────────────────────────────────────────────────
const PLATFORMS = ['Instagram','TikTok','YouTube','Podcast','Newsletter'];
const NICHES = ['Yoga & Wellness','Street Food & Travel','Adventure & Hiking','Photography','Music & Culture','Fitness Coaching'];

export const MOCK_INFLUENCERS: InfluencerApplication[] = Array.from({ length: 12 }, (_, i) => ({
  _id: `inf_${i+1}`,
  userId: { _id: `user_${i+1}`, name: NAMES[i % NAMES.length], email: `creator${i+1}@example.com` },
  fullName: NAMES[i % NAMES.length], platform: pick(PLATFORMS),
  profileUrl: `https://instagram.com/creator${i+1}`,
  followerCount: `${rnd(1, 250)}K`, niche: pick(NICHES),
  status: pick(['pending','pending','approved','rejected'] as any),
  bio: 'Passionate about sharing meaningful experiences with my community.',
  createdAt: new Date(Date.now() - rnd(1, 45) * 864e5).toISOString(),
}));

// ── Activity Logs ─────────────────────────────────────────────────────────────
const LOG_ACTIONS = [
  { action:'USER_SUSPENDED', resource:'users', severity:'warning' as const },
  { action:'TRIP_APPROVED', resource:'trips', severity:'info' as const },
  { action:'BOOKING_CANCELLED', resource:'bookings', severity:'warning' as const },
  { action:'INFLUENCER_APPROVED', resource:'influencers', severity:'info' as const },
  { action:'ADMIN_CREATED', resource:'admins', severity:'info' as const },
  { action:'SETTINGS_UPDATED', resource:'settings', severity:'warning' as const },
  { action:'USER_DELETED', resource:'users', severity:'critical' as const },
  { action:'TRIP_REJECTED', resource:'trips', severity:'warning' as const },
  { action:'REFUND_PROCESSED', resource:'transactions', severity:'info' as const },
];

export const MOCK_LOGS: ActivityLog[] = Array.from({ length: 40 }, (_, i) => {
  const log = LOG_ACTIONS[i % LOG_ACTIONS.length];
  return {
    _id: `log_${i+1}`,
    adminId: { _id: 'admin_1', name: 'Super Admin', email: 'admin@muvay.com' },
    action: log.action, resource: log.resource,
    resourceId: `${log.resource}_${rnd(1,20)}`,
    details: `${log.action.replace(/_/g,' ')} performed successfully`,
    ipAddress: `192.168.${rnd(1,5)}.${rnd(1,254)}`,
    severity: log.severity,
    createdAt: new Date(Date.now() - rnd(0, 7) * 864e5 - rnd(0, 86400) * 1000).toISOString(),
  };
});

// ── Admin Users ───────────────────────────────────────────────────────────────
export const MOCK_ADMINS: AdminUser[] = [
  { _id:'admin_1', name:'Elena Vasquez', email:'elena@muvay.com', role:'super_admin', isActive:true, lastLogin:new Date(Date.now()-3600000).toISOString(), createdAt:'2023-01-01T00:00:00Z', updatedAt:new Date().toISOString() },
  { _id:'admin_2', name:'Marcus Chen',   email:'marcus@muvay.com', role:'operations_admin', isActive:true, lastLogin:new Date(Date.now()-7200000).toISOString(), createdAt:'2023-03-15T00:00:00Z', updatedAt:new Date().toISOString() },
  { _id:'admin_3', name:'Aisha Okonkwo', email:'aisha@muvay.com', role:'support_admin', isActive:true, lastLogin:new Date(Date.now()-86400000).toISOString(), createdAt:'2023-06-01T00:00:00Z', updatedAt:new Date().toISOString() },
  { _id:'admin_4', name:'Luca Bianchi',  email:'luca@muvay.com', role:'finance_admin', isActive:false, createdAt:'2023-09-01T00:00:00Z', updatedAt:new Date().toISOString() },
];
