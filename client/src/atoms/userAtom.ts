import { atom } from 'jotai';

export interface User {
  id: number;
  username: string;
  email: string;
}

export const userAtom = atom<User>();