
import { User, HymnData } from '../types';

const USERS_KEY = 'advent_hymn_users';
const CURRENT_USER_KEY = 'advent_hymn_current_user';
const USER_HYMNS_KEY = 'advent_hymn_saved_hymns';

export const login = (username: string): User => {
  const usersStr = localStorage.getItem(USERS_KEY);
  const users: User[] = usersStr ? JSON.parse(usersStr) : [];
  
  let user = users.find(u => u.username === username);
  
  if (!user) {
    // Create new user if doesn't exist (Simulated Reg)
    user = {
      id: crypto.randomUUID(),
      username,
      name: username.charAt(0).toUpperCase() + username.slice(1),
      savedHymnIds: []
    };
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
  
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return user;
};

export const logout = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem(CURRENT_USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

export const saveHymnToLibrary = (user: User, hymn: HymnData): User => {
  // 1. Save the hymn data itself
  const allHymnsStr = localStorage.getItem(USER_HYMNS_KEY);
  const allHymns: HymnData[] = allHymnsStr ? JSON.parse(allHymnsStr) : [];
  
  if (!allHymns.find(h => h.id === hymn.id)) {
    allHymns.push(hymn);
    localStorage.setItem(USER_HYMNS_KEY, JSON.stringify(allHymns));
  }

  // 2. Update User record
  const usersStr = localStorage.getItem(USERS_KEY);
  let users: User[] = usersStr ? JSON.parse(usersStr) : [];
  
  const userIndex = users.findIndex(u => u.id === user.id);
  if (userIndex >= 0) {
    if (!users[userIndex].savedHymnIds.includes(hymn.id)) {
       users[userIndex].savedHymnIds.push(hymn.id);
       localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  }

  // 3. Update Current Session
  const updatedUser = { ...user, savedHymnIds: [...user.savedHymnIds, hymn.id] };
  // Remove dupes if any
  updatedUser.savedHymnIds = [...new Set(updatedUser.savedHymnIds)];
  
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
  return updatedUser;
};

export const getUserHymns = (user: User): HymnData[] => {
  const allHymnsStr = localStorage.getItem(USER_HYMNS_KEY);
  const allHymns: HymnData[] = allHymnsStr ? JSON.parse(allHymnsStr) : [];
  return allHymns.filter(h => user.savedHymnIds.includes(h.id));
};
