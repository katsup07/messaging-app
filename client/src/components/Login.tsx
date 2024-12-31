import React, { useEffect, useState } from 'react';
import { useSetAtom } from 'jotai';
import { userAtom, User } from '../atoms/userAtom';
import { validateEmail, validatePassword, validateUsername } from '../helpers/validation-utils';
import ApiService from '../services/ApiService';

const validateLogin = (username: string, email: string, password: string): boolean => {
  const isValidEmail = validateEmail(email);
  if (!isValidEmail) {
    alert('Invalid email');
    return false;
  }
  const isValidPassword = validatePassword(password);
  if (!isValidPassword) {
    alert('Password must be at least 6 characters long');
    return false;
  }
  const isValidUsername = validateUsername(username);
  if (!isValidUsername) {
    alert('Username must be at least 3 characters long');
    return false;
  }
  return true;
}

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const setUser = useSetAtom(userAtom);

  // Initialize current
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) 
      setUser(JSON.parse(user));

    }, [setUser] )


  const handleLogin = async() => {
    const isValid = validateLogin(username, email, password);
    if(!isValid)
      return;

    const apiService = new ApiService();
    const fetchedUser = await apiService.findUser({username, email, password});

    localStorage.setItem('user', JSON.stringify(fetchedUser));

    const user: User = { 
      username: fetchedUser.username, 
      email: fetchedUser.email 
    };
    setUser(user);
  };

  return (
    <div>
      <h2>Login</h2>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;