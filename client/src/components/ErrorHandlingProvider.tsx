import { ReactNode } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { ErrorProvider } from '../services/ErrorService';
import ErrorToast from './ErrorToast';

interface ErrorWrapperProps {
  children: ReactNode;
}

const ErrorHandlingProvider = ({ children }: ErrorWrapperProps) => (
  <ErrorBoundary>
    <ErrorProvider>
      <div className="app-container">
        {children}
        <ErrorToast />
      </div>
    </ErrorProvider>
  </ErrorBoundary>
);

export default ErrorHandlingProvider;