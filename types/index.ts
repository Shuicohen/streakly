export type Habit = {
  id: string
  user_id: string
  name: string
  description: string | null
  color: string
  created_at: string
}

export type HabitCompletion = {
  id: string
  habit_id: string
  user_id: string
  completed_on: string // YYYY-MM-DD
  created_at: string
}

export type Profile = {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  updated_at: string
}