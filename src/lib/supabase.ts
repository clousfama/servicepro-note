import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tymvycpohivlgkfmbyar.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5bXZ5Y3BvaGl2bGdrZm1ieWFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3NjE5MjgsImV4cCI6MjA1MTMzNzkyOH0.0JyBz6RVJvvx15BMQ65jmmyVd1wc5RnNPCQijZztjjc';

export const supabase = createClient(supabaseUrl, supabaseKey);