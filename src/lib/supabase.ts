import { createClient } from '@/utils/supabase/client';

// Export a singleton browser supabase client for use across all client components
export const supabase = createClient();

export interface UserProfile {
  id?: string;
  uid: string;
  email: string;
  name: string;
  role: 'student' | 'teacher';
  class_name?: string;
  className?: string;
  created_at?: string;
}

export interface TimetableItem {
  id?: string;
  class_name?: string;
  className?: string;
  subject: string;
  day: string;
  start_time?: string;
  startTime?: string;
  end_time?: string;
  endTime?: string;
  room?: string;
  teacher_id?: string;
  teacherId?: string;
  created_at?: string;
}

export interface QuizItem {
  id?: string;
  title: string;
  class_name?: string;
  className?: string;
  subject: string;
  questions: any[];
  created_by?: string;
  createdBy?: string;
  created_at?: string;
}

export interface QuizResultItem {
  id?: string;
  quiz_id?: string;
  quizId?: string;
  student_id?: string;
  studentId?: string;
  student_name?: string;
  studentName?: string;
  score: number;
  total_questions?: number;
  totalQuestions?: number;
  completed_at?: string;
}

export interface WorksheetItem {
  id?: string;
  title: string;
  class_name?: string;
  className?: string;
  subject: string;
  description?: string;
  file_url?: string;
  fileUrl?: string;
  created_at?: string;
}

export interface LeadItem {
  id?: string;
  parent_name?: string;
  parentName?: string;
  child_name?: string;
  childName?: string;
  child_age?: string;
  childAge?: string;
  phone: string;
  email: string;
  status?: string;
  created_at?: string;
}

export interface BadgeItem {
  id?: string;
  student_id?: string;
  studentId?: string;
  badge_title?: string;
  badgeTitle?: string;
  awarded_by?: string;
  awardedBy?: string;
  awarded_at?: string;
}
