import { IUser } from "@/contexts/AuthContext";
import { generateCorrelationId } from "../lib/utils";

// Production URL
const GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';


class UserService {
  private getHeaders(): Record<string, string> {
    const accessToken = localStorage.getItem('accessToken');
    const correlationId = generateCorrelationId();
    return {
      'Content-Type': 'application/json',
      'x-correlation-id': correlationId,
      ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
    };
  }

  async getUserById(userId: string): Promise<any> {
    try {
      const response = await fetch(`${GATEWAY_URL}/api/users/${userId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to get user');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async registerUser(data: any): Promise<any> {
    try {
      const correlationId = generateCorrelationId();
      const response = await fetch(`${GATEWAY_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-correlation-id': correlationId,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to register');
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async updateUser(data: IUser): Promise<any> {
    try {
      const response = await fetch(`${GATEWAY_URL}/api/users/${data.id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to update profile');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<any> {
    try {
      const response = await fetch(`${GATEWAY_URL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to delete account');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
    
  }
}

export default UserService;
