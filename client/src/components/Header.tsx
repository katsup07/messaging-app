import { useEffect, useState } from 'react';
import Logout from './Logout';
import { User } from '../atoms/userAtom';
import UserSettings from './UserSettings';
import MessengerIcon from './icons/MessengerIcon';
import LogoutIcon from './icons/LogoutIcon';
import ThemeToggleSwitchIcon from './icons/ThemeToggleSwitchIcon';
import { Friend } from './FriendsList';

interface Props {
  isLoggedIn: boolean;
  mobileData: { isMobile: boolean, isPortrait: boolean };
  selectedFriend?: Friend | null;
  setShowFriendsModal: (show: React.SetStateAction<boolean>) => void;
  user?: User;
}

const Header: React.FC<Props> = ({ isLoggedIn, mobileData: {isMobile, isPortrait}, selectedFriend, user, setShowFriendsModal }: Props) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleFriendsModal = () => {
    setShowFriendsModal(prev => !prev);
  }

  const headerControlsStyle = {
    display: 'flex',
    justifyContent: isMobile ? 'space-between' : 'flex-end',
    alignItems: 'center',
    gap: '0.1rem',
    width: isMobile ? '100%' : 'auto'
  };

  return (  
    <div className="app-header">
     <h1 className="app-title">
       <MessengerIcon/>
         { isMobile && isPortrait ? '' : 'Messenger'}
      </h1>
      <div className="header-controls" style={headerControlsStyle}>
      { isMobile && <button 
              className="friends-toggle-button"
              onClick={toggleFriendsModal}
            >
              { selectedFriend ? selectedFriend.username : 'Friends'}
            </button>}
        <button 
          className="icon-button theme-switch"
          onClick={() => setIsDarkMode(!isDarkMode)}
          aria-label="Toggle dark mode"
        >
          <ThemeToggleSwitchIcon isDarkMode={isDarkMode}/>
        </button>
        {isLoggedIn && (
          <>
            <button 
              className="icon-button settings-button"
              onClick={() => setShowSettings(true)}
              aria-label="User settings"
            >
              <LogoutIcon/>
            </button>
            <Logout isMobile={isMobile} user={user}/>
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