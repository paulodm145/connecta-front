// UserData.ts
let userData: User | null = null;

export const getUserData = () => userData;

export const setUserData = (user: User | null) => {
  userData = user;
};
