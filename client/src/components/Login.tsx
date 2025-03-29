import React, { useEffect, useState } from 'react';
import { useSetAtom } from 'jotai';
import { userAtom, User } from '../atoms/userAtom';
import { validateEmail, validatePassword } from '../helpers/validation-utils';
import ApiService from '../services/ApiService';
import { MdLogin } from 'react-icons/md';

const validateLogin = (email: string, password: string): boolean => {
  const isValidEmail = validateEmail(email);
  if (!isValidEmail) {
    alert('Invalid email format');
    return false;
  }
  const isValidPassword = validatePassword(password);
  if (!isValidPassword) {
    alert('Password must be at least 6 characters long');
    return false;
  }
  return true;
}

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSignup, setIsSignup] = useState<boolean>(false);
  const setUser = useSetAtom(userAtom);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) 
      setUser(JSON.parse(user));
  }, [setUser]);

  const handleLogin = async() => {
    const isValid = validateLogin(email, password);
    if(!isValid)
      return;

    const apiService = new ApiService();
    const fetchedUser = await apiService.auth({ email, password, isSignup });
    console.log('fetched user: ', fetchedUser);
    if (!fetchedUser) {
      alert('Invalid email or password');
      return;
    }

    localStorage.setItem('user', JSON.stringify(fetchedUser));

    const user: User = { 
      id: fetchedUser.id,
      username: fetchedUser.username, 
      email: fetchedUser.email 
    };
    setUser(user);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>{ isSignup ? 'Create Account' : 'Welcome Back'}</h2>
        <div className="login-input-group">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="login-input"
            onKeyDown={handleKeyDown}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="login-input"
            onKeyDown={handleKeyDown}
          />
        </div>
        <button className="login-button" onClick={handleLogin}>
          <MdLogin size={20} />
          { isSignup ? 'Register' : 'Login' }
        </button>
        <button className="toggle-login-button">
          <span onClick={() => setIsSignup(!isSignup)}>
            {isSignup ? 'Login' : 'Create Account'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default Login;