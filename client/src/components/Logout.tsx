import React from 'react';
import { useSetAtom } from 'jotai';
import { userAtom } from '../atoms/userAtom';

const Logout: React.FC = () => {
  const setUser = useSetAtom(userAtom);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(undefined);
  };

  return (
    <button onClick={handleLogout}>Logout</button>
  );
};

export default Logout;