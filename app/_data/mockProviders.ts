import { ServiceProvider } from '../types/swappyfeed';

export const MOCK_PROVIDERS: readonly ServiceProvider[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    avatar: 'AJ',
    title: 'Passionate designer with 7 years of experience',
    serviceName: 'Web Design & UI/UX Mentorship',
    rating: 4.8,
    reviews: 2,
    category: 'skill-practice',
    acceptsSwap: true,
    isActiveNow: true,
    skillsOffered: [
      { name: 'Web Design', level: 'Expert' },
      { name: 'Graphic Design', level: 'Expert' },
      { name: 'UI/UX Mentorship', level: 'Expert' },
      { name: 'Frontend Development', level: 'Intermediate' },
      { name: 'Illustration', level: 'Amateur' }
    ],
    skillsWanted: [
      { name: 'Photography', level: 'Intermediate' },
      { name: 'Video Editing', level: 'Beginner' },
      { name: 'Marketing Strategy', level: 'Intermediate' },
      { name: 'Copywriting', level: 'Beginner' }
    ],
    availability: ['Weekdays', 'Evenings', 'Flexible Weekends'],
    timeSlots: 'Monday & Wednesday 10 AM - 2 PM',
    bio: 'Passionate web designer with 7 years of experience crafting intuitive and beautiful user interfaces. I love helping small businesses establish a strong online presence and teaching aspiring designers the fundamentals of great design.',
    detailedReviews: [
      {
        id: '1',
        userName: 'Sarah Chen',
        userAvatar: 'SC',
        rating: 5,
        comment: 'Alex did an amazing job on my website! Very communicative and delivered exactly what I asked for. Highly recommend for any design needs.',
        timeAgo: '2 days ago'
      },
      {
        id: '2',
        userName: 'Mark Davis',
        userAvatar: 'MD',
        rating: 4,
        comment: 'Great experience working with Alex on a logo design. He\'s very skilled, though communication could be a bit faster.',
        timeAgo: '1 week ago'
      }
    ]
  },
  {
    id: '2',
    name: 'Sriram T.',
    avatar: 'SK',
    title: 'Senior Product Manager at PepsiCo',
    serviceName: 'PM Mock Interview - CIRCLES Framework',
    rating: 4.9,
    reviews: 82,
    category: 'mock-interviews',
    paidPrice: 75,
    acceptsSwap: true,
  },
  {
    id: '3',
    name: 'Emily Chen',
    avatar: 'EC',
    title: 'Senior Software Engineer at Google',
    serviceName: 'Technical Interview Prep - System Design',
    rating: 5.0,
    reviews: 124,
    category: 'mock-interviews',
    paidPrice: 120,
    acceptsSwap: false,
  },
  {
    id: '4',
    name: 'Michael Torres',
    avatar: 'MT',
    title: 'Career Coach & HR Professional',
    serviceName: 'Resume & LinkedIn Profile Review',
    rating: 4.8,
    reviews: 95,
    category: 'resume-review',
    paidPrice: 50,
    acceptsSwap: true,
  },
  {
    id: '5',
    name: 'Sarah Williams',
    avatar: 'SW',
    title: 'MBA & Strategy Consultant',
    serviceName: 'Consulting Case Interview Prep',
    rating: 4.9,
    reviews: 67,
    category: 'case-study',
    paidPrice: 90,
    acceptsSwap: true,
  },
  {
    id: '6',
    name: 'David Park',
    avatar: 'DP',
    title: 'UX Design Lead at Adobe',
    serviceName: 'Portfolio Review & Design Mentorship',
    rating: 4.7,
    reviews: 53,
    category: 'skill-practice',
    paidPrice: 65,
    acceptsSwap: true,
  },
  {
    id: '7',
    name: 'Jessica Martinez',
    avatar: 'JM',
    title: 'VP of Marketing at Tech Startup',
    serviceName: 'Career Strategy & Growth Planning',
    rating: 5.0,
    reviews: 41,
    category: 'career-guidance',
    acceptsSwap: true,
  },
] as const;

export const validateProviders = (providers: readonly ServiceProvider[]): boolean => {
  if (!Array.isArray(providers)) return false;

  return providers.every(provider =>
    provider?.id &&
    provider?.name &&
    typeof provider?.rating === 'number' &&
    provider?.rating >= 1 &&
    provider?.rating <= 5 &&
    provider?.category &&
    typeof provider?.acceptsSwap === 'boolean'
  );
};