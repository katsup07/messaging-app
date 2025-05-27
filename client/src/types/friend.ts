

export type Friend = {
  _id: string;
  username: string;
  email: string;
  isLoggedIn?: boolean;
  isPending?: boolean;
  isRejected?: boolean;
}

type FriendRequestStatus = 'pending' | 'accepted' | 'rejected';
export type FriendRequest = {
  _id: string;
  fromUserId: string;
  toUserId: string;
  status: FriendRequestStatus;
  createdAt: string;
}

export type FriendRequestResponse = Omit<FriendRequest, '_id'>;

export type RespondToFriendRequestResponse = {
  fromUserId: string;
  toUserId: string;
  status: FriendRequestStatus;
  createdAt: string;
  respondedAt: string;
}

export type OnlineStatus = 'online' | 'offline';