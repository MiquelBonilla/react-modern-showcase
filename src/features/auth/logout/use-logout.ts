import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../model/auth.store';

export const useLogout = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return handleLogout;
};
