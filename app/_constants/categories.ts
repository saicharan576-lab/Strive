import { Category } from '../types/swappyfeed';

export const CATEGORIES: readonly Category[] = [
  { id: 'mock-interviews', name: 'Mock Interviews', icon: 'briefcase-outline' },
  { id: 'resume-review', name: 'Resume Review', icon: 'document-outline' },
  { id: 'career-guidance', name: 'Career Guidance', icon: 'compass-outline' },
  { id: 'case-study', name: 'Case Study Practice', icon: 'book-outline' },
  { id: 'skill-practice', name: 'Skill Practice', icon: 'code-outline' },
] as const;

export const AVAILABILITY_OPTIONS = [
  'Weekdays',
  'Evenings',
  'Weekends',
  'Flexible',
] as const;

export const EXCHANGE_TYPES = [
  { id: 'paid', label: 'Paid Services' },
  { id: 'swap', label: 'Skill Swap' },
] as const;