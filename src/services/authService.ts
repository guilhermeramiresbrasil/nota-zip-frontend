import { generateCorrelationId } from "../lib/utils";

// Hardcoded production URL to avoid build issues
const GATEWAY_URL = 'http://api.notazip.com.br';

class AuthService {
  
  
  async login(data: any): Promise<any> {
    try {
        const correlationId = generateCorrelationId();
    const response = await fetch(`${GATEWAY_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-correlation-id': correlationId,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.message || 'Failed to login');
    }

    return await response.json();
    } catch (error) {
      throw error;
    }
    
  } 
  
  async logout(sessionId: string): Promise<any> {
    try {
    const accessToken = localStorage.getItem('accessToken');
    const correlationId = generateCorrelationId();
    await fetch(`${GATEWAY_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-correlation-id': correlationId,
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ sessionId }),
    });
    
    return 
    } catch (error) {
      throw error;
    }
  }
  
}

export default AuthService;