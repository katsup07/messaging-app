export type Message = {
  senderId: string;
  sender: string;
  content: string;
  receiverId: string;
  time: string;
  isRead?: boolean;
}