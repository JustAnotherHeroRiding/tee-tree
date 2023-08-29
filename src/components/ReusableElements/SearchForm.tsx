import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useState, useContext, useRef, useEffect } from "react";
import { UserContext } from "../Context/UserContext";
import { LoadingSpinner } from "./loading";
import React from "react";
import { UserCardSearchResults } from "./Users/UserMentionSuggestions";
import { api } from "~/utils/api";
import Link from "next/link";

export const SearchInput = (props: { src: string }) => {
  const { userList, isLoading: LoadingUserList } = useContext(UserContext);
  const { data: trends, isLoading: loadingTrends } =
    api.posts.getTrends.useQuery({});
  const resultRefs = useRef<React.RefObject<HTMLAnchorElement>[]>([]);

  const [input, setInput] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [isTypingQuery, setIsTypingQuery] = useState(false);
  const [possibleTrends, setPossibleTrends] = useState<[string, number][]>([]);

  useEffect(() => {
    // Filter trends based on typedTrend
    if (trends && !loadingTrends) {
      const filteredTrends = trends.filter(
        (trend) =>
          trend[0] && // Checking if trend name exists.
          trend[0].toLowerCase().includes(input.toLowerCase().slice(1)) // Checking if trend name includes the typed trend.
      );

      // If filteredTrends exists, update possibleTrends.
      if (filteredTrends) {
        setPossibleTrends(filteredTrends.slice(0, 6)); // Limiting array to first 6 items.
      }
    }
  }, [trends, input, loadingTrends]);

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const currentValue = event.target.value;
    setInput(currentValue);

    if (currentValue.length > 0) {
      setIsTypingQuery(true);
    } else if (currentValue.length === 0) {
      setIsTypingQuery(false);
      setHighlightedIndex(0);
    }
  };

  return (
    <div className="flex flex-col">
      <form
        action="/i/search"
        method="get"
        className={`${
          props.src === "typed_query"
            ? "hidden w-full ml-4  phones:ml-8 trendsbreakpoint:flex"
            : "w-full trendsbreakpoint:hidden"
        } relative mx-auto mt-2 `}
      >
        <input
          type="text"
          placeholder="Search"
          className="h-10 w-full rounded-full border-2 border-Intone-300 bg-transparent py-2 pl-8 pr-4 outline-none"
          name="q" // query parameter
          value={input}
          onChange={(e) => handleQueryChange(e)}
          autoComplete="off"
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
                if (highlightedIndex < possibleTrends.length - 1 + userList.length)
              setHighlightedIndex((prevHighlightedIndex) => {
                const nextHighlightedIndex = prevHighlightedIndex + 1;
                const nextRef = resultRefs.current[nextHighlightedIndex];
                if (nextRef && nextRef.current) {
                  nextRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest",
                  });
                }
                return nextHighlightedIndex;
              });
            } else if (e.key === "ArrowUp") {
              if (highlightedIndex > 0) {
                setHighlightedIndex((setHighlightedIndex) => {
                    const nextHighlightedIndex = setHighlightedIndex - 1;
                    const nextRef = resultRefs.current[nextHighlightedIndex];
                    if (nextRef && nextRef.current) {
                      nextRef.current.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest",
                      });
                    }
                    return nextHighlightedIndex;
                  });
              }
              
            } else if (e.key === "Tab") {
              resultRefs.current[highlightedIndex]?.current?.click();
            }
          }}
        />
        <input type="hidden" name="src" value="typed_query" />
        <input type="hidden" name="selector" value="top" />
        <FontAwesomeIcon
          icon={faSearch}
          className="absolute left-[4%] top-[38%] h-3 w-3 text-Intone-300"
        />
      </form>
      {isTypingQuery && (
        <div
          className={`${
            props.src === "typed_query"
              ? "top-14 min-w-3/4 hidden right-1/2 translate-x-1/2 trendsbreakpoint:block"
              : "top-16 w-full trendsbreakpoint:hidden"
          } gray-thin-scrollbar absolute z-10 flex max-h-[300px] 
                scroll-p-4 
                flex-col overflow-auto rounded-xl border border-slate-400 bg-Intone-100 shadow-xl`}
        >
          <div className="flex flex-col">
            {LoadingUserList ? (
              <LoadingSpinner />
            ) : userList ? (
              userList.map((user, index) => {
                if (!resultRefs.current[index]) {
                  resultRefs.current[index] =
                    React.createRef<HTMLAnchorElement>();
                }

                return (
                  <UserCardSearchResults
                    key={index}
                    user={user}
                    index={index}
                    highlightedIndex={highlightedIndex}
                    scrollRef={
                      resultRefs.current?.[index] ||
                      React.createRef<HTMLAnchorElement>()
                    }
                  />
                );
              })
            ) : (
              <LoadingSpinner />
            )}
            {!trends && <LoadingSpinner />}
            {possibleTrends &&
              possibleTrends.map((trend, index) => {
                if (!resultRefs.current[index + userList.length]) {
                  resultRefs.current[index + userList.length] =
                    React.createRef<HTMLAnchorElement>();
                }
                return (
                  <Link
                    href={`/i/search?q=${trend[0]}&src=${props.src}&selector=top`}
                    key={`${trend[0]}+${trend[1]}`}
                    ref={
                      resultRefs.current?.[index + userList.length] ||
                      React.createRef<HTMLAnchorElement>()
                    }
                  >
                    <div
                      className={`${
                        index + userList.length == highlightedIndex
                          ? "bg-Intone-200"
                          : ""
                      } px-4 py-2   hover:bg-Intone-200`}
                    >
                      {trend[0]}
                    </div>
                  </Link>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};
