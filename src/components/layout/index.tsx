import {
  PropsWithChildren,
  useContext,
  useEffect,
  useCallback,
  MouseEventHandler,
} from "react";
import { useRouter } from "next/router";

import { AuthContext } from "@context/AuthContext";
import Head from "@components/head";

function Layout(props: PropsWithChildren) {
  const { children } = props;

  const router = useRouter();
  const { setAuthenticated, isAuthenticated, logout } = useContext(AuthContext);

  useEffect(() => {
    const isAuthenticated = !!window.localStorage.getItem("token");
    setAuthenticated(isAuthenticated);

    if (!isAuthenticated && !router.asPath.match(/signIn|signUp/g)) {
      router.push("/auth/signIn");
    }
  }, [router, setAuthenticated]);

  const handleLogout = useCallback<MouseEventHandler<HTMLButtonElement>>(
    (e) => {
      e.preventDefault();
      logout();
    },
    [logout]
  );

  return (
    <>
      <div className="w-full flex justify-end max-lg:p-5">
        {isAuthenticated && (
          <button className="font-semibold text-xl" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
      <main className="flex flex-col min-h-full items-center justify-around p-10 max-lg:justify-start max-lg:p-0">
        <Head />
        <div className="w-[50vw] max-lg:w-screen max-lg:border-none max-lg:p-2 h-[80vh] flex flex-col items-center p-10 border border-gray-600 rounded-xl shadow-gray-900">
          {children}
        </div>
      </main>
    </>
  );
}

export default Layout;
