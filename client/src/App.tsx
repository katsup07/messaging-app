import { useAtomValue } from 'jotai';
import './App.css'
import Chat from './components/Chat'
import { userAtom } from './atoms/userAtom';
import Login from './components/Login';

import FriendsList, { Friend } from './components/FriendsList';
import { useState } from 'react';
import Header from './components/Header';
import useAuth from './helpers/useAuth';
import ErrorBoundary from './components/ErrorBoundary';
import { ErrorProvider } from './services/ErrorService';
import ErrorToast from './components/ErrorToast';
import { useIsMobile } from './helpers/useIsMobile';

function App() {
  const { isLoading } = useAuth();
  const user = useAtomValue(userAtom);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const isLoggedIn = !!user;
  const mobileData = useIsMobile();


  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget)
      setShowFriendsModal(prev => !prev);
  };

  const toggleFriendsListModal = () => {
    setShowFriendsModal(prev => !prev);
  }

  if(isLoading)
    return <div className="loading">Loading...</div>;

  if (!user)
    return (
      <ErrorBoundary>
        <ErrorProvider>
          <div className="app-container">
            <Header isLoggedIn={isLoggedIn} mobileData={mobileData} setShowFriendsModal={setShowFriendsModal} />
            <Login />
            <ErrorToast />
          </div>
        </ErrorProvider>
      </ErrorBoundary>
    )
    
// Desktop layout - always show friends sidebar  
if(!mobileData.isMobile)
  return (
    <ErrorBoundary>
      <ErrorProvider>
        <div className="app-container">
          <Header isLoggedIn={isLoggedIn} user={user} mobileData={mobileData} setShowFriendsModal={setShowFriendsModal} />
          <div className="main-content">
            <div className="friends-container">
              <FriendsList 
                onSelectFriend={setSelectedFriend}
                selectedFriend={selectedFriend}
                user={user}
                isMobile={mobileData.isMobile}
              />
            </div>
            <Chat selectedFriend={selectedFriend}/>
          </div>
          <ErrorToast />
        </div>
      </ErrorProvider>
    </ErrorBoundary>
  );

// Mobile layout
  return (
    <ErrorBoundary>
      <ErrorProvider>
        <div className="app-container">
          <Header isLoggedIn={isLoggedIn} user={user} mobileData={mobileData} setShowFriendsModal={setShowFriendsModal} selectedFriend={selectedFriend}/>
          <div className="main-content">
            <Chat selectedFriend={selectedFriend}/>
            
            {showFriendsModal && (
              <div className="modal-overlay" onClick={(e) => handleBackdropClick(e)}>
                <div className="modal-content friends-modal">
                  <FriendsList 
                    onSelectFriend={(friend) => {
                      setSelectedFriend(friend);
                      setShowFriendsModal(false);
                    }}
                    selectedFriend={selectedFriend}
                    user={user}
                    isMobile={mobileData.isMobile}
                    toggleFriendsListModal={toggleFriendsListModal}
                  />
                </div>
              </div>
            )}
          </div>
          <ErrorToast />
        </div>
      </ErrorProvider>
    </ErrorBoundary>
  );

// Mobile landscape layout - side-by-side layout with smaller friends list
// return (
//   <ErrorBoundary>
//     <ErrorProvider>
//       <div className="app-container">
//         <Header isLoggedIn={isLoggedIn} user={user} mobileData={mobileData} setShowFriendsModal={setShowFriendsModal} />
//         <div className="main-content landscape">
//           <div className="friends-container landscape">
//             <FriendsList 
//               onSelectFriend={setSelectedFriend}
//               selectedFriend={selectedFriend}
//               user={user}
//             />
//           </div>
//           <Chat selectedFriend={selectedFriend}/>
//         </div>
//         <ErrorToast />
//       </div>
//     </ErrorProvider>
//   </ErrorBoundary>
// );
}

export default App;
