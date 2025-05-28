import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User } from '../atoms/userAtom';
import { useSetAtom } from 'jotai';
import { userAtom } from '../atoms/userAtom';
import ServiceFacade from '../services/ServiceFacade';
import { useIsMobile } from '../helpers/useIsMobile';
import { userSettingsSchema, UserSettingsForm } from '../schemas/validation';

interface Props {
  user: User;
  onClose: () => void;
}

const UserSettings: React.FC<Props> = ({ user, onClose }) => {
  const setUser = useSetAtom(userAtom);
  const { isMobile } = useIsMobile();
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
    watch
  } = useForm<UserSettingsForm>({
    resolver: zodResolver(userSettingsSchema),
    defaultValues: {
      username: user.username,
      email: user.email,
      password: '',
      confirmPassword: ''
    },
    mode: 'onBlur'
  });

  const watchedPassword = watch('password');  const onSubmit = async (data: UserSettingsForm) => {
    try {
      const serviceFacade = ServiceFacade.getInstance();
      // Only include password in update if it was entered
      const updateData = {
        username: data.username,
        email: data.email,
        ...(data.password && { password: data.password })
      };
      
      const updatedUser = await serviceFacade.updateUserDetails(user._id.toString(), updateData);
      // update global state (will automatically persist to storage)
      setUser(updatedUser);
      
      setUpdateSuccess(true);
      
      // Clear password fields
      reset({
        username: data.username,
        email: data.email,
        password: '',
        confirmPassword: ''
      });
      
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to update user details:', error);
      const message = error instanceof Error ? error.message : 'Update failed';
      
      if (message.includes('username')) {
        setError('username', { message });
      } else if (message.includes('email')) {
        setError('email', { message });
      } else if (message.includes('Password')) {
        setError('password', { message });
      } else {
        setError('root', { message });
      }
    }
  };

  // Close modal when clicking outside
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className={`modal-content settings-modal ${isMobile ? 'mobile-settings' : ''}`}>
        <div className="modal-header">
          <h2>User Settings</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
          <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="userId">User ID</label>
            <input 
              type="text" 
              id="userId" 
              value={user._id.toString()} 
              disabled 
              className="readonly-field"
            />
            <small className="field-hint">ID cannot be modified</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input 
              type="text" 
              id="username" 
              {...register('username')}
              className={errors.username ? 'error' : ''}
            />
            {errors.username && <div className="error-message">{errors.username.message}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              {...register('email')}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <div className="error-message">{errors.email.message}</div>}
          </div>
          
          <div className="form-section">
            <h3>Password Update</h3>
            <p className="section-description">Leave blank if you don't want to change your password</p>
          </div>
          
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input 
              type="password" 
              id="password" 
              {...register('password')}
              className={errors.password ? 'error' : ''}
              placeholder="•••••••••"
            />
            {errors.password && <div className="error-message">{errors.password.message}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input 
              type="password" 
              id="confirmPassword" 
              {...register('confirmPassword')}
              className={errors.confirmPassword ? 'error' : ''}
              placeholder="•••••••••"
              disabled={!watchedPassword}
            />
            {errors.confirmPassword && <div className="error-message">{errors.confirmPassword.message}</div>}
          </div>

          {errors.root && (
            <div className="error-message">{errors.root.message}</div>
          )}

          {updateSuccess && (
            <div className="success-message">Profile updated successfully!</div>
          )}
          
          <div className="button-group">
            <button 
              type="button" 
              className="button secondary" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="button primary" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserSettings;