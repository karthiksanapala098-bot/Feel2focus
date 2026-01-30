
import React from 'react';
import { BookOpen, Code, GraduationCap, Gavel, Cpu, LayoutGrid, Award } from 'lucide-react';
import { Goal } from './types';

export const EXAM_GOALS: Goal[] = [
  { id: 'rrb', name: 'RRB NTPC/Group D', icon: '🚂', description: 'Railway Recruitment Board preparation' },
  { id: 'upsc', name: 'UPSC CSE', icon: '🏛️', description: 'Civil Services Examination mastery' },
  { id: 'jee', name: 'JEE Mains', icon: '🧪', description: 'Engineering entrance excellence' },
  { id: 'programming', name: 'Programming', icon: '💻', description: 'C, Java, Python, SQL, Web Dev' },
  { id: 'semester', name: 'College Subjects', icon: '🎓', description: 'Semester exams & GPA optimization' },
  { id: 'custom', name: 'Other Goals', icon: '✨', description: 'Specify your own custom study path' },
];

export const MOTIVATIONAL_QUOTES = [
  "Don't stop when you're tired. Stop when you're done.",
  "Your energy is your greatest asset. Use it wisely.",
  "Focus on being productive instead of busy.",
  "The only way to do great work is to love what you do.",
  "Believe you can and you're halfway there.",
  "Discipline is doing what needs to be done, even if you don't want to.",
  "It's not about how much time you spend, but how much you focus."
];
