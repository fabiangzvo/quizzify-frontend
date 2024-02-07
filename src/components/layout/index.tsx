import { PropsWithChildren } from "react";

function Layout(props: PropsWithChildren) {
  const { children } = props;

  return (
    <main className="flex min-h-screen items-center justify-center p-24 ">
      {children}
    </main>
  );
}

export default Layout;
