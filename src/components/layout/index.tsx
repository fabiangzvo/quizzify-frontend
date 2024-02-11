import {
  PropsWithChildren,
  useContext,
  useEffect,
  useCallback,
  MouseEventHandler,
} from "react";
import { useRouter } from "next/router";
import cs from "classnames";

import { AuthContext } from "@context/AuthContext";
import ThemeButton from "@components/themeButton";
//import Head from "@components/head";

interface LayoutProps extends PropsWithChildren {
  heightClass?: string;
  overrideClass?: string;
}

function Layout(props: LayoutProps) {
  const { children, heightClass = "h-[80vh]", overrideClass = "" } = props;

  const router = useRouter();
  const { refreshAuthContext, isAuthenticated, logout } =
    useContext(AuthContext);

  useEffect(() => {
    refreshAuthContext();
    const isAuthenticated = !!window.localStorage.getItem("token");

    if (!isAuthenticated && !router.asPath.match(/signIn|signUp/g)) {
      router.push("/auth/signIn");
    }
  }, [router, refreshAuthContext]);

  const handleLogout = useCallback<MouseEventHandler<HTMLButtonElement>>(
    (e) => {
      e.preventDefault();
      logout();
    },
    [logout]
  );

  return (
    <>
      <div className="w-full flex justify-end p-5">
        <ThemeButton />
        {isAuthenticated && (
          <button
            className="ml-10 font-semibold text-xl"
            onClick={handleLogout}
          >
            Logout
          </button>
        )}
      </div>
      <main className="flex flex-col min-h-full items-center justify-around p-10 max-lg:justify-start max-lg:p-0">
        <div
          className={cs({
            "w-[50vw] max-lg:w-screen max-lg:border-none max-lg:p-2 flex flex-col items-center p-10 border lg:border-paragraph rounded-xl lg:shadow-paragraph lg:shadow-lg":
              !overrideClass,
            [heightClass]: !!heightClass,
            [overrideClass]: !!overrideClass,
          })}
        >
          {children}
        </div>
      </main>
    </>
  );
}

export default Layout;
