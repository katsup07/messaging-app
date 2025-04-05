import { atom } from 'jotai';

export interface User {
  _id: number | string;
  // id: number | string;
  username: string;
  email: string;
}

export const userAtom = atom<User>();