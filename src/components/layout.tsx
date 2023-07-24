import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { PropsWithChildren } from "react";
import { Trends } from "./ReusableElements/Trends";
import { useRouter } from "next/router";

export const PageLayout = (props: PropsWithChildren) => {
  const router = useRouter();

  return (
    <>
      <main className="relative flex h-screen justify-center">
        <div
          className="gray-thin-scrollbar h-full min-h-screen w-full overflow-y-scroll  border-x border-slate-400 
            sm:max-w-[500px] md:max-w-[500px] lg:max-w-[650px] phone:border-none"
        >
          {props.children}
        </div>
        <div className="gray-thin-scrollbar fixed right-[3%] max-h-[100vh] w-1/5 overflow-y-scroll scrollbar-none trendsbreakpoint:hidden">
          <div className="sticky top-0 mb-6 bg-black py-2">
            <form action="/i/search" method="get">
              <input
                type="text"
                placeholder="Search"
                className="h-10 w-full rounded-full border-2 border-Intone-300 bg-transparent py-2 pl-8 pr-4 outline-none"
                name="q" // query parameter
              />
              <input type="hidden" name="src" value="typed_query" />
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-[4%] top-[38%] h-3 w-3 text-Intone-300"
              />
            </form>
          </div>
          <div className="gap-6@ flex flex-col items-center justify-center">
            {!router.pathname.startsWith("/i/trends") && (
              <div className="mb-4 w-full items-center rounded-2xl bg-twitter-100">
                <h1 className="mb-2 px-4 pt-2 text-2xl font-bold">
                  Trends for you
                </h1>
                <Trends />
              </div>
            )}

            <div className="h-36 w-full items-center rounded-2xl bg-twitter-100 px-4 py-2 ">
              <h1 className="mb-4 text-2xl font-bold">Who to follow</h1>
            </div>
          </div>
          <div className="px-4 py-2">
            <p className="text-twitter-200">© 2023 Kristijan Kocev</p>
          </div>
        </div>
      </main>
    </>
  );
};
