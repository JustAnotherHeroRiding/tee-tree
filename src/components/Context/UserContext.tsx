import React from "react";
import { api } from "~/utils/api";
import type { PropsWithChildren } from "react";
import { type NextPage } from "next";

type UserType = {
  id: string;
  username: string | null;
  profilePicture: string | null;
};

type UserContextType = {
  userList: UserType[];
  isLoading: boolean;
};

export const UserContext = React.createContext<UserContextType>({
  userList: [],
  isLoading: false,
});

const UserContextProvider: NextPage<PropsWithChildren> = (props) => {
  const { data: userList, isLoading } = api.clerk.getAllUsers.useQuery();

  if (!userList) {
    return null;
  }

  return (
    <UserContext.Provider value={{ userList, isLoading }}>
      {props.children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;
