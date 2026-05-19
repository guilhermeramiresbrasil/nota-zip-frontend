const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3011';

export const api = {
  expenses: {
    create: async (data: {
      userId: string;
      amount: number;
      category: string;
      description: string;
      date?: string;
      tags?: string[];
    }) => {
      const response = await fetch(`${API_BASE_URL}/api/notes/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, userId: 'user-1' }),
      });
      return response.json();
    },
    
    getAll: async (userId: string = 'user-1') => {
      const response = await fetch(`${API_BASE_URL}/api/notes/expenses?userId=${userId}`);
      return response.json();
    },
  },
  
  reports: {
    get: async (params: {
      userId?: string;
      month?: number;
      year?: number;
      category?: string;
    }) => {
      const queryParams = new URLSearchParams({
        userId: params.userId || 'user-1',
        ...(params.month && { month: params.month.toString() }),
        ...(params.year && { year: params.year.toString() }),
        ...(params.category && { category: params.category }),
      });
      const response = await fetch(`${API_BASE_URL}/api/notes/report?${queryParams}`);
      return response.json();
    },
  },
  
  notes: {
    create: async (data: {
      userId: string;
      title: string;
      content: string;
      tags?: string[];
    }) => {
      const response = await fetch(`${API_BASE_URL}/api/notes/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, userId: 'user-1' }),
      });
      return response.json();
    },
    
    search: async (params: {
      userId?: string;
      query?: string;
      tags?: string[];
      limit?: number;
    }) => {
      const response = await fetch(`${API_BASE_URL}/api/notes/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...params, userId: params.userId || 'user-1' }),
      });
      return response.json();
    },
  },
  
  categories: {
    create: async (data: {
      userId: string;
      name: string;
      color?: string;
      icon?: string;
    }) => {
      const response = await fetch(`${API_BASE_URL}/api/notes/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, userId: 'user-1' }),
      });
      return response.json();
    },
  },
};
