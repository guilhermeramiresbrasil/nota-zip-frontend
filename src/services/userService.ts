import { IUser } from "@/contexts/AuthContext";
import { generateCorrelationId } from "../lib/utils";

const GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';


class UserService {
  async getUserById(userId: string): Promise<Promise<any>> {
    try {
    const accessToken = localStorage.getItem('accessToken');
    const correlationId = generateCorrelationId()
    const response = await fetch(`${GATEWAY_URL}/api/users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-correlation-id': correlationId,
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.message || 'Failed to get user');
    }
     
    const result = await response.json()

    return result.data;
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
  
      const result = await response.json();
      return result.data;
      } catch (error) {
        throw error;
      }
    }

  async updateUser(data: IUser): Promise<any> {
    try {
    const accessToken = localStorage.getItem('accessToken');
    const correlationId = generateCorrelationId()
    const response = await fetch(`${GATEWAY_URL}/api/users/${data.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-correlation-id': correlationId,
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.message || 'Failed to update profile');
    }

  const result = await response.json()

    return  result.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<any> {
    try {
    const accessToken = localStorage.getItem('accessToken');
    const correlationId = generateCorrelationId()
    const response = await fetch(`${GATEWAY_URL}/api/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-correlation-id': correlationId,
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.message || 'Failed to delete account');
    }

  const result = await response.json()

    return  result.data;
    } catch (error) {
      throw error;
    }
  }
}

export default UserService;
