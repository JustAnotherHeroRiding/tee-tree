import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import Link from "next/link";

export const SearchInput = (props: { src: string }) => {
  const [showSuggestedQueries, setShowSuggestedQueries] = useState(true);

  return (
    <div className="flex flex-col">
      <form
        action="/i/search"
        method="get"
        className={`${
          props.src === "typed_query"
            ? "hidden w-1/2 trendsbreakpoint:block"
            : "w-full trendsbreakpoint:hidden"
        } relative mx-auto mt-2 `}
      >
        <input
          type="text"
          placeholder="Search"
          className="h-10 w-full rounded-full border-2 border-Intone-300 bg-transparent py-2 pl-8 pr-4 outline-none"
          name="q" // query parameter
        />
        <input type="hidden" name="src" value="typed_query" />
        <input type="hidden" name="selector" value="top" />
        <FontAwesomeIcon
          icon={faSearch}
          className="absolute left-[4%] top-[38%] h-3 w-3 text-Intone-300"
        />
      </form>
      {showSuggestedQueries && (
        <div
          className={`${
            props.src === "typed_query"
              ? "top-14 hidden w-1/2 translate-x-1/2 trendsbreakpoint:block"
              : "top-16 w-full trendsbreakpoint:hidden"
          } gray-thin-scrollbar absolute z-10 flex max-h-[250px] 
                scroll-p-4 
                flex-col overflow-auto rounded-xl border border-slate-400 bg-Intone-100 shadow-xl`}
        >
            <div className="flex flex-col">
          <Link
            href={`/i/search?q=example&src=${props.src}&selector=top`}
            className="px-4 py-2 hover:bg-Intone-200"
          >
            Search
          </Link>
          <Link
            href={`/i/search?q=example&src=${props.src}&selector=top`}
            className="px-4 py-2 hover:bg-Intone-200"
          >
            Search
          </Link>
          <Link
            href={`/i/search?q=example&src=${props.src}&selector=top`}
            className="px-4 py-2 hover:bg-Intone-200"
          >
            Search
          </Link>
          <Link
            href={`/i/search?q=example&src=${props.src}&selector=top`}
            className="px-4 py-2 hover:bg-Intone-200"
          >
            Search
          </Link>
          <Link
            href={`/i/search?q=example&src=${props.src}&selector=top`}
            className="px-4 py-2 hover:bg-Intone-200"
          >
            Search
          </Link>
          <Link
            href={`/i/search?q=example&src=${props.src}&selector=top`}
            className="px-4 py-2 hover:bg-Intone-200"
          >
            Search
          </Link>
          <Link
            href={`/i/search?q=example&src=${props.src}&selector=top`}
            className="px-4 py-2 hover:bg-Intone-200"
          >
            Search
          </Link>
          </div>
        </div>
      )}
    </div>
  );
};
