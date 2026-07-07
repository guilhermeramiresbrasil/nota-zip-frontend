export interface Category {
  id: string;
  userId?: string | null;
  name: string;
  type: 'credit' | 'debit' | 'both';
  parentId?: string | null;
  color?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
  subcategories?: Category[];
}

// Hardcoded production URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const categoryService = {
  async fetchCategories(type?: 'credit' | 'debit' | 'both', userId?: string): Promise<Category[]> {
    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (userId) params.set('userId', userId);
    const qs = params.toString();
    const url = qs ? `${API_URL}/api/notes/categories?${qs}` : `${API_URL}/api/notes/categories`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch categories');
    const data = await response.json();
    return data.data || [];
  },

  async createCategory(category: { name: string; type?: 'credit' | 'debit' | 'both'; parentId?: string; userId?: string; color?: string; icon?: string }): Promise<Category> {
    const response = await fetch(`${API_URL}/api/notes/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(category),
    });
    if (!response.ok) throw new Error('Failed to create category');
    const data = await response.json();
    return data.data;
  },

  async updateCategory(id: string, updates: { userId: string; name?: string; type?: 'credit' | 'debit' | 'both'; color?: string; icon?: string }): Promise<Category> {
    const response = await fetch(`${API_URL}/api/notes/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update category');
    const data = await response.json();
    return data.data;
  },

  async deleteCategory(id: string, userId: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/notes/categories/${id}?userId=${userId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete category');
  },

  async normalizeCategory(categoryName: string, type: 'credit' | 'debit' | 'both' = 'both'): Promise<Category> {
    const response = await fetch(`${API_URL}/api/notes/categories/normalize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ categoryName, type }),
    });
    if (!response.ok) {
      throw new Error('Failed to normalize category');
    }
    const data = await response.json();
    return data.data;
  },
};
