export interface Category {
  id: string;
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
  async fetchCategories(type?: 'credit' | 'debit' | 'both'): Promise<Category[]> {
    const url = type
      ? `${API_URL}/api/notes/categories?type=${type}`
      : `${API_URL}/api/notes/categories`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    const data = await response.json();
    return data.data || [];
  },

  async createCategory(category: { name: string; type?: 'credit' | 'debit' | 'both'; parentId?: string; color?: string; icon?: string }): Promise<Category> {
    const response = await fetch(`${API_URL}/api/notes/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(category),
    });
    if (!response.ok) {
      throw new Error('Failed to create category');
    }
    const data = await response.json();
    return data.data;
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
