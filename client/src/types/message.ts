export interface Message {
  senderId: number | string;
  sender: string;
  content: string;
  receiverId: number | string;
  time: string;
  isRead?: boolean;
}