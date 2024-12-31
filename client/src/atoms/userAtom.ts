import { atom } from 'jotai';

export interface User {
  username: string;
  email: string;
}

export const userAtom = atom<User | null>(null);