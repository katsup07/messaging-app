import React, { useEffect, useState } from 'react';
import { useSetAtom } from 'jotai';
import { MdLogin } from 'react-icons/md';
import { validateEmail, validatePassword } from '../../helpers/validation-utils';
import { userAtom } from '../../atoms/userAtom';
import ServiceFacade from '../../services/ServiceFacade';
import { registerForLiveUpdates } from '../../socket-io-client';

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

    const serviceFacade = ServiceFacade.getInstance();
    const response = await serviceFacade.auth({ email, password, isSignup });

    if (!response || !response.accessToken) {
      alert('Invalid email or password');
      return;
    }
    // api
    serviceFacade.setAccessToken(response.accessToken);
    serviceFacade.setRefreshToken(response.refreshToken);
    // session
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);

    const userData = { 
      _id: response.user._id,
      username: response.user.username, 
      email: response.user.email 
    };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    
    registerForLiveUpdates(response.user._id.toString());
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