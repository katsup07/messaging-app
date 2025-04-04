import { atom } from 'jotai';

export interface User {
  _id: number;
  id: number;
  username: string;
  email: string;
}

export const userAtom = atom<User>();