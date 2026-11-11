import { supabase } from '../lib/supabase';

export async function seedDefaultCategories(userId: string) {
  try {
    // Check if categories already exist for this user
    const { data: existing, error: checkError } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (checkError) {
      console.error('Error checking categories:', checkError);
      return;
    }

    if (existing && existing.length > 0) {
      // Already seeded, skip
      return;
    }

    const defaultCategories = [
      // Expenses
      { user_id: userId, name: 'Housing', type: 'Expense', icon: 'Home', color: '#3b82f6' },
      { user_id: userId, name: 'Food & Dining', type: 'Expense', icon: 'Utensils', color: '#10b981' },
      { user_id: userId, name: 'Transportation', type: 'Expense', icon: 'Car', color: '#f59e0b' },
      { user_id: userId, name: 'Education', type: 'Expense', icon: 'Book', color: '#8b5cf6' },
      { user_id: userId, name: 'Family', type: 'Expense', icon: 'Users', color: '#ec4899' },
      { user_id: userId, name: 'Personal Care', type: 'Expense', icon: 'Smile', color: '#06b6d4' },
      { user_id: userId, name: 'Healthcare', type: 'Expense', icon: 'HeartPulse', color: '#ef4444' },
      { user_id: userId, name: 'Debt & Loans', type: 'Expense', icon: 'Landmark', color: '#64748b' },
      { user_id: userId, name: 'Lifestyle', type: 'Expense', icon: 'Tv', color: '#14b8a6' },
      { user_id: userId, name: 'Other Expense', type: 'Expense', icon: 'MoreHorizontal', color: '#71717a' },
      
      // Income
      { user_id: userId, name: 'Monthly Salary', type: 'Income', icon: 'Briefcase', color: '#10b981' },
      { user_id: userId, name: 'Freelance & Gig', type: 'Income', icon: 'Laptop', color: '#3b82f6' },
      { user_id: userId, name: 'Business', type: 'Income', icon: 'TrendingUp', color: '#8b5cf6' },
      { user_id: userId, name: 'Bonus & Gift', type: 'Income', icon: 'Gift', color: '#f59e0b' },
      { user_id: userId, name: 'Other Income', type: 'Income', icon: 'PlusCircle', color: '#71717a' }
    ];

    const { error: insertError } = await supabase.from('categories').insert(defaultCategories);
    if (insertError) {
      console.error('Error inserting default categories:', insertError);
    }
  } catch (err) {
    console.error('Exception in seedDefaultCategories:', err);
  }
}