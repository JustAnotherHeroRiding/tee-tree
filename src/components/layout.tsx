import type { PropsWithChildren } from "react";
import { Trends } from "./ReusableElements/Trends";
import { useRouter } from "next/router";
import { SearchInput } from "./ReusableElements/SearchForm";
import { SuggestedUsers } from "./ReusableElements/Users/SuggestedUsers";
import { SignInButton, useUser } from "@clerk/nextjs";
import Sidebar from "./SidebarIcons/Sidebar";

export const PageLayout = (props: PropsWithChildren) => {
  const router = useRouter();
  const { user } = useUser();

  return (
    <>
      <main className="relative flex h-screen justify-center">
          <Sidebar />

        <div
          className="gray-thin-scrollbar h-full min-h-screen w-full overflow-y-scroll  border-x border-slate-400 
            sm:max-w-[500px] md:max-w-[550px] lg:max-w-[650px] phone:border-none"
        >
          {props.children}
        </div>
        <div
          className="gray-thin-scrollbar fixed right-[3%] max-h-[100vh] w-1/5 overflow-y-scroll
         scrollbar-none trendsbreakpoint:hidden"
        >
          <div className="sticky top-0 mb-6 bg-black py-2">
            <SearchInput src="trends" />
          </div>
          <div className="gap-6@ flex flex-col items-center justify-center">
            {!router.pathname.startsWith("/i/trends") && user && (
              <div className="mb-4 w-full items-center rounded-2xl bg-twitter-100">
                <h1 className="mb-2 px-4 pt-2 text-2xl font-bold">
                  Trends for you
                </h1>
                <Trends />
              </div>
            )}
            {!router.pathname.startsWith("/i/suggested_users") && (
              <div className=" w-full items-center rounded-2xl bg-twitter-100">
                <h1 className="mb-4 px-4 py-2 text-2xl font-bold">
                  Who to follow
                </h1>
                {user ? (
                  <SuggestedUsers />
                ) : (
                  <>
                    <h1 className="mb-4 px-4 py-2 text-2xl">
                      You are not logged in
                    </h1>
                    <SignInButton>
                      <div
                        className="mb-2 ml-2 flex w-fit cursor-pointer 
rounded-3xl border border-slate-400 px-4 py-2 hover:bg-slate-700"
                      >
                        <h1>Sign In or Register</h1>
                      </div>
                    </SignInButton>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="mb-24 px-4 py-2">
            <p className="text-twitter-200">© 2023 Kristijan Kocev</p>
          </div>
        </div>
      </main>
    </>
  );
};
