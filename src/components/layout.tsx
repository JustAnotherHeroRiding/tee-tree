import type { PropsWithChildren } from "react";
import { Trends } from "./ReusableElements/Trends";
import { useRouter } from "next/router";
import Link from "next/link";
import { SearchInput } from "./ReusableElements/SearchForm";
import { SuggestedUsers } from "./ReusableElements/SuggestedUsers";
import { SignInButton, useUser } from "@clerk/nextjs";

export const PageLayout = (props: PropsWithChildren) => {
  const router = useRouter();
  const { user } = useUser();

  return (
    <>
      <main className="relative flex h-screen justify-center">
        <div className="fixed left-[3%] showSidebar:hidden">
          <Link
            className="flex flex-row items-center justify-center rounded-xl hover:bg-slate-700"
            href={"/"}
          >
            <svg
              className="sticky top-2 h-10 w-10 rounded-2xl p-1"
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="#ffffff"
                d="M7 19v-2h10v2h-2c-.5 0-1 .2-1.4.6s-.6.9-.6 1.4v1h-2v-1c0-.5-.2-1-.6-1.4S9.5 19 9 19H7m4-13c0-.3.1-.5.3-.7s.4-.3.7-.3s.5.1.7.3s.3.4.3.7s-.1.5-.3.7s-.4.3-.7.3s-.5-.1-.7-.3s-.3-.4-.3-.7m2 2c0-.3.1-.5.3-.7s.4-.3.7-.3s.5.1.7.3s.3.4.3.7s-.1.5-.3.7s-.4.3-.7.3s-.5-.1-.7-.3s-.3-.4-.3-.7M9 8c0-.3.1-.5.3-.7s.4-.3.7-.3s.5.1.7.3s.3.4.3.7s-.1.5-.3.7s-.4.3-.7.3s-.5-.1-.7-.3S9 8.3 9 8m7.9-3.9c-1.4-1.4-3-2-4.9-2s-3.6.7-4.9 2S5 7.1 5 9s.7 3.6 2 4.9s3 2 4.9 2s3.6-.7 4.9-2s2-3 2-4.9s-.5-3.6-1.9-4.9m-1.4 8.4c-1 1-2.2 1.5-3.5 1.5s-2.6-.5-3.5-1.5S7 10.4 7 9s.5-2.6 1.5-3.5S10.6 4 12 4s2.6.5 3.5 1.5S17 7.6 17 9s-.5 2.6-1.5 3.5Z"
              ></path>
            </svg>
            <h1 className="-ml-2 logoNameClip:hidden">teeTree</h1>
          </Link>
        </div>

        <div
          className="gray-thin-scrollbar h-full min-h-screen w-full overflow-y-scroll  border-x border-slate-400 
            sm:max-w-[500px] md:max-w-[500px] lg:max-w-[650px] phone:border-none"
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
                    <h1 className="mb-4 px-4 py-2 text-2xl">You are not logged in</h1>
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
