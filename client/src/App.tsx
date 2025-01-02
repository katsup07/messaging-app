import { useAtomValue } from 'jotai';
import './App.css'
import Chat from './components/Chat'
import { userAtom } from './atoms/userAtom';
import Login from './components/Login';
import Logout from './components/Logout';
import FriendsList, { Friend } from './components/FriendsList';
import { useState } from 'react';

function App() {
  const user = useAtomValue(userAtom);
    const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);

  if (!user)
    return <Login />;

  return (
   <div className="app-container">
     <Logout />
     <hr></hr>
    <h1>Messenger</h1>
    <FriendsList 
    onSelectFriend={setSelectedFriend}
    selectedFriend={selectedFriend}
    user={user}
    />
    <Chat selectedFriend={selectedFriend}/>
   </div>
  )
}

export default App
