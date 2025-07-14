import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ozbvvxhhehqubqxqruko.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96YnZ2eGhoZWhxdWJxeHFydWtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MjU3NDIsImV4cCI6MjA2ODAwMTc0Mn0.leGIlPtPn82jurb9sRA9L2ycDDxnL5fQivS5sY4hYew'

export const supabase = createClient(supabaseUrl, supabaseKey) 