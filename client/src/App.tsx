import { useAtomValue } from 'jotai';
import './App.css'
import Chat from './components/Chat'
import { userAtom } from './atoms/userAtom';
import Login from './components/Login';

import FriendsList, { Friend } from './components/FriendsList';
import { useState } from 'react';
import Header from './components/Header';

function App() {
  const user = useAtomValue(userAtom);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
 

  if (!user)
    return <Login />;

  return (
    <div className="app-container">
      <Header />
      <div className="main-content">
        <div className="friends-container">
          <FriendsList 
            onSelectFriend={setSelectedFriend}
            selectedFriend={selectedFriend}
            user={user}
          />
        </div>
        <Chat selectedFriend={selectedFriend}/>
      </div>
    </div>
  )
}

export default App
