import { useEffect, useState } from 'react';
import Logout from './Logout';
import { User } from '../atoms/userAtom';
import UserSettings from './UserSettings';

interface Props {
  isLoggedIn: boolean;
  isMobile: boolean;
  user?: User;
}

const Header: React.FC<Props> = ({ isLoggedIn, isMobile, user }: Props) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);
  
  console.log('isMobile in header: ', isMobile);
  return (  
    <div className="app-header">
      <h1 className="app-title">
        <svg viewBox="0 0 36 36" fill="currentColor">
          <path d="M17.305 16.57a1.998 1.998 0 00-.347-.052l-.33-.015a2 2 0 00-.359.03 1.998 1.998 0 00-.333.077l-.105.035-.322.13-.105.051a1.998 1.998 0 00-.469.324 1.999 1.999 0 00-.293.335l-.066.1-.043.073a1.999 1.999 0 00-.243.56l-.026.12-.015.104a1.999 1.999 0 003.883.482l.015-.104.005-.123a1.999 1.999 0 00-.847-1.677zm-5.954-3.284a2 2 0 103.999.001 2 2 0 00-3.999-.001zm7.683 0a2 2 0 103.999.001 2 2 0 00-3.999-.001zM18 2.099C9.247 2.099 2.099 8.97 2.099 17.399c0 4.579 2.279 8.668 5.844 11.283v4.696c0 .581.606.946 1.12.676l3.636-1.91a15.521 15.521 0 005.301.932c8.753 0 15.901-6.871 15.901-15.3C33.901 8.97 26.753 2.099 18 2.099z"/>
        </svg>
        {isMobile ? '' : 'Messenger'}
      </h1>
      <div className="header-controls">
        <button 
          className="icon-button theme-switch"
          onClick={() => setIsDarkMode(!isDarkMode)}
          aria-label="Toggle dark mode"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="6" width="20" height="12" rx="6" className={isDarkMode ? 'switch-track-dark' : 'switch-track'} />
            <circle cx={isDarkMode ? "16" : "8"} cy="12" r="4" fill="currentColor" />
          </svg>
        </button>
        {isLoggedIn && (
          <>
            <button 
              className="icon-button settings-button"
              onClick={() => setShowSettings(true)}
              aria-label="User settings"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
            <Logout user={user} />
            {showSettings && user && (
              <UserSettings 
                user={user} 
                onClose={() => setShowSettings(false)} 
              />
            )}
          </>
        )}
      </div> 
    </div>
  );
}
 
export default Header;