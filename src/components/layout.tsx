import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { PropsWithChildren } from "react";

export const PageLayout = (props: PropsWithChildren) => {
  return (
    <>
      <main className="relative flex h-screen justify-center">
        <div
          className="gray-thin-scrollbar h-full w-full overflow-y-scroll  border-x border-slate-400 
            md:max-w-[650px] phone:border-none"
        >
          {props.children}
        </div>
        <div className="absolute right-[3%] w-1/5">
          <div className="sticky top-0 mb-4">
            <input
              type="text"
              placeholder="Search"
              className="h-10 w-full rounded-full
              border-2 border-Intone-300 px-4 py-2 text-black outline-none"
            />
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute right-3 top-2 w-4 h-4 text-Intone-300"
            />
          </div>
          <div className="flex flex-col items-center justify-center gap-6">
            <div className="h-36 w-full items-center rounded-2xl border px-4 py-2 ">
              <h1 className="font-bold">Trends for you</h1>
            </div>
            <div className="h-36 w-full items-center rounded-2xl border px-4 py-2 ">
              <h1 className="font-bold">Who to follow</h1>
            </div>
            <div className="h-36 w-full items-center rounded-2xl border px-4 py-2 ">
              <h1 className="font-bold">Who to follow</h1>
            </div>
            <div className="h-36 w-full items-center rounded-2xl border px-4 py-2 ">
              <h1 className="font-bold">Who to follow</h1>
            </div>
            <div className="h-36 w-full items-center rounded-2xl border px-4 py-2 ">
              <h1 className="font-bold">Who to follow</h1>
            </div>
            <div className="h-36 w-full items-center rounded-2xl border px-4 py-2 ">
              <h1 className="font-bold">Who to follow</h1>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};
