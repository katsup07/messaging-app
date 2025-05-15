import { useState } from 'react';
import { User } from '../atoms/userAtom';
import { useSetAtom } from 'jotai';
import { userAtom } from '../atoms/userAtom';
import ServiceFacade from '../services/ServiceFacade';
import { validatePassword } from '../helpers/validation-utils';
import { useIsMobile } from '../helpers/useIsMobile';

interface Props {
  user: User;
  onClose: () => void;
}

const UserSettings: React.FC<Props> = ({ user, onClose }) => {
  const setUser = useSetAtom(userAtom);
  const { isMobile } = useIsMobile();
  const [formData, setFormData] = useState({
    username: user.username,
    email: user.email,
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<{username?: string, email?: string, password?: string, confirmPassword?: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validate = () => {
    const newErrors: {username?: string, email?: string, password?: string, confirmPassword?: string} = {};
    
    if (!formData.username.trim())
      newErrors.username = 'Username is required';
    
    if (!formData.email.trim())
      newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'Email format is invalid';
    
    // Only validate password if user is trying to update it
    if (formData.password) {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid)
        newErrors.password = passwordValidation.message;

      if (formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      const serviceFacade = ServiceFacade.getInstance();
      // Only include password in update if it was entered
      const updateData = {
        username: formData.username,
        email: formData.email,
        ...(formData.password && { password: formData.password })
      };
        const updatedUser = await serviceFacade.updateUserDetails(user._id.toString(), updateData);
      // update global state (will automatically persist to storage)
      setUser(updatedUser);
      
      setUpdateSuccess(true);
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
      
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to update user details:', error);
      setErrors({ 
        username: (error as Error).message.includes('username') ? (error as Error).message : undefined,
        email: (error as Error).message.includes('email') ? (error as Error).message : undefined,
        password: (error as Error).message.includes('Password') ? (error as Error).message : undefined
      });
    } finally {
      setIsSubmitting(false);
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
        
        <form onSubmit={handleSubmit}>
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
              name="username" 
              value={formData.username} 
              onChange={handleChange}
              className={errors.username ? 'error' : ''}
            />
            {errors.username && <div className="error-message">{errors.username}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
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
              name="password" 
              value={formData.password} 
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="•••••••••"
            />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input 
              type="password" 
              id="confirmPassword" 
              name="confirmPassword" 
              value={formData.confirmPassword} 
              onChange={handleChange}
              className={errors.confirmPassword ? 'error' : ''}
              placeholder="•••••••••"
            />
            {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
          </div>
          
          {updateSuccess && <div className="success-message">User details updated successfully!</div>}
          
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