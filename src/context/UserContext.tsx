"use client";
import {
  useState,
  createContext,
  useCallback,
  useEffect,
  useContext,
} from "react";

import { UserProfile } from "@/types/User";
import { getProfile } from "@api/user";
import { ProviderProps } from "@/types/Context";
import { AuthContext } from "@context/AuthContext";

interface UserContextProps {
  user: UserProfile | null;
  setUser: (user: UserProfile) => void;
  resetUser: () => void;
}

const UserContext = createContext<UserContextProps>({
  user: null,
  setUser: () => {},
  resetUser: () => {},
});

function UserProvider(props: ProviderProps) {
  const { children } = props;

  const [user, setUser] = useState<UserProfile | null>(null);
  const { refreshAuthContext } = useContext(AuthContext);

  const resetUser = useCallback(() => setUser(null), []);

  useEffect(() => {
    const isAuthenticated = !!window.localStorage.getItem("token");

    async function getUserData() {
      const { data, status } = await getProfile();

      status === 200 && setUser(data);
    }

    if (isAuthenticated) {
      refreshAuthContext();
      getUserData();
    }
  }, [refreshAuthContext]);

  return (
    <UserContext.Provider value={{ user, setUser, resetUser }}>
      {children}
    </UserContext.Provider>
  );
}

export { UserProvider, UserContext };
