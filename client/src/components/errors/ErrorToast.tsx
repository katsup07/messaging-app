import { useEffect } from 'react';
import { useError } from '../../services/ErrorService';

interface ErrorToastProps {
  className?: string;
}

const ErrorToast: React.FC<ErrorToastProps> = ({ className = '' }) => {
  const { error, clearError } = useError();

  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  if (!error) return null;

  return (
    <div className={`error-toast ${className}`}>
      <div className="error-toast-content">
        <h3>Error</h3>
        <p>{error.message}</p>
        <button onClick={clearError} className="close-button">
          ✕
        </button>
      </div>
    </div>
  );
};

export default ErrorToast;