import axios from 'axios';

const USERS_SERVICE_URL = 'http://localhost:3001';

export const validateUserExists = async (usuarioId: number): Promise<boolean> => {
  try {
    await axios.get(`${USERS_SERVICE_URL}/internal/users/${usuarioId}`);
    return true;
  } catch (err: any) {
    if (err.response && err.response.status === 404) {
      return false;
    }
    console.error('Error validating user:', err.message);
    throw new Error('Error de validación del servicio de usuarios');
  }
};
