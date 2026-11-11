import { supabase } from '../lib/supabase'

export interface Category {
  id: string
  user_id: string
  name: string
  type: 'Income' | 'Expense'
  parent_id?: string | null
  icon?: string
  color?: string
}

export const categoryService = {
  async getCategories(userId: string): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  },

  async createCategory(categoryData: Omit<Category, 'id'>) {
    const { data, error } = await supabase
      .from('categories')
      .insert([categoryData])
      .select()

    if (error) throw error
    return data?.[0]
  },

  async deleteCategory(id: string) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}