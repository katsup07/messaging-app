import { atomWithStorage } from 'jotai/utils';

export interface User {
  _id: number | string;
  username: string;
  email: string;
}

export const userAtom = atomWithStorage<User | undefined>('user', undefined);