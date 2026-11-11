import { categoryService } from '../services/categoryService'

export const seedDefaultCategories = async (userId: string) => {
  const existing = await categoryService.getCategories(userId);
  if (existing.length > 0) return; // Already seeded

  const defaultCategories = [
    { user_id: userId, name: 'Salary', type: 'Income', icon: 'Briefcase', color: '#10b981' },
    { user_id: userId, name: 'Freelance', type: 'Income', icon: 'Laptop', color: '#3b82f6' },
    { user_id: userId, name: 'Business', type: 'Income', icon: 'TrendingUp', color: '#8b5cf6' },
    { user_id: userId, name: 'Gift / Other', type: 'Income', icon: 'Gift', color: '#ec4899' },
    
    { user_id: userId, name: 'Housing', type: 'Expense', icon: 'Home', color: '#ef4444' },
    { user_id: userId, name: 'Food', type: 'Expense', icon: 'Utensils', color: '#f59e0b' },
    { user_id: userId, name: 'Transportation', type: 'Expense', icon: 'Car', color: '#3b82f6' },
    { user_id: userId, name: 'Education', type: 'Expense', icon: 'BookOpen', color: '#10b981' },
    { user_id: userId, name: 'Family', type: 'Expense', icon: 'Users', color: '#ec4899' },
    { user_id: userId, name: 'Personal', type: 'Expense', icon: 'User', color: '#8b5cf6' },
    { user_id: userId, name: 'Healthcare', type: 'Expense', icon: 'HeartPulse', color: '#06b6d4' },
    { user_id: userId, name: 'Lifestyle', type: 'Expense', icon: 'Smile', color: '#eab308' },
  ];

  for (const cat of defaultCategories) {
    await categoryService.createCategory(cat as any);
  }
}