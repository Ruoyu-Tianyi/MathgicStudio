// Supabase 客户端（anon key 可公开，权限由数据库 RLS 策略强制）
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://mdeuteqbnrmnqofubsbz.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZXV0ZXFibnJtbnFvZnVic2J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0MjAyODEsImV4cCI6MjEwMTk5NjI4MX0.2fKqMseGovQc4eGR00Fvt_hgXXkfFmfHYIf0QF6V6Rg'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

/** 管理员邮箱（与数据库 RLS delete 策略一致） */
export const ADMIN_EMAIL = 'ruoyu_tianyi@163.com'

export interface MessageRow {
  id: string
  name: string
  text: string
  pinned: boolean
  likes: number
  created_at: string
}

export interface ReplyRow {
  id: string
  message_id: string
  name: string
  text: string
  created_at: string
}
