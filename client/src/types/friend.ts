// filepath: c:\Users\katsup\Desktop\Programs\Apps\messaging-app\message-app\client\src\types\friend.ts
export interface Friend {
  _id: number | string;
  username: string;
  email: string;
  isLoggedIn?: boolean;
  isPending?: boolean;
  isRejected?: boolean;
}

export interface FriendRequest {
  _id: number | string;
  fromUserId: number | string;
  toUserId: number | string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}
