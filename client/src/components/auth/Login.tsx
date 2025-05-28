import React, { useState } from 'react';
import { useSetAtom } from 'jotai';
import { MdLogin } from 'react-icons/md';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userAtom } from '../../atoms/userAtom';
import ServiceFacade from '../../services/ServiceFacade';
import { registerForLiveUpdates } from '../../socket-io-client';
import { loginAndSignupSchema, LoginAndSignupForm } from '../../schemas/validation';

const Login: React.FC = () => {
  const [isSignup, setIsSignup] = useState<boolean>(false);
  const setUser = useSetAtom(userAtom);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting },
    setError 
  } = useForm<LoginAndSignupForm>({
    resolver: zodResolver(loginAndSignupSchema),
    mode: 'onBlur'
  });

  const onSubmit = async (data: LoginAndSignupForm) => {
    try {
      const serviceFacade = ServiceFacade.getInstance();
      const response = await serviceFacade.auth({ 
        email: data.email, 
        password: data.password, 
        isSignup 
      });

      if (!response || !response.accessToken) {
        setError('root', { message: 'Invalid email or password' });
        return;
      }

      // Set tokens
      serviceFacade.setAccessToken(response.accessToken);
      serviceFacade.setRefreshToken(response.refreshToken);
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      // Set user data
      const userData = { 
        _id: response.user._id,
        username: response.user.username, 
        email: response.user.email 
      };
      setUser(userData);
      
      registerForLiveUpdates(response.user._id.toString());
    } catch (error) {
      setError('root', { 
        message: error instanceof Error ? error.message : 'Authentication failed' 
      });
    }
  };
  
  return (
    <div className="login-container">
      <div className="login-form">
        <h2>{isSignup ? 'Create Account' : 'Welcome Back'}</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="login-input-group">
            <input
              type="email"
              {...register('email')}
              placeholder="Email"
              className={`login-input ${errors.email ? 'error' : ''}`}
            />
            {errors.email && (
              <div className="error-message">{errors.email.message}</div>
            )}
            
            <input
              type="password"
              {...register('password')}
              placeholder="Password"
              className={`login-input ${errors.password ? 'error' : ''}`}
            />
            {errors.password && (
              <div className="error-message">{errors.password.message}</div>
            )}
          </div>
          
          {errors.root && (
            <div className="error-message">{errors.root.message}</div>
          )}
          
          <button 
            type="submit" 
            className="login-button"
            disabled={isSubmitting}
          >
            <MdLogin size={20} />
            {isSubmitting ? 'Loading...' : isSignup ? 'Register' : 'Login'}
          </button>
        </form>
        
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