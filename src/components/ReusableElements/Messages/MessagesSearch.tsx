import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useState, useRef, useContext, useEffect } from "react";
import { UserContext } from "~/components/Context/UserContext";
import { LoadingSpinner } from "../loading";
import React from "react";
import {
  UserCardSearchResults,
  MessageCardSearchResults,
} from "../Users/SearchResultCards";
import { useUser } from "@clerk/nextjs";
import { type ExtendedMessage } from "~/server/api/routers/messages";
import { type PostAuthor } from "~/server/api/routers/posts";
import { type User } from "../CreatePostWizard";
import { api } from "~/utils/api";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { type FormEvent } from "react";
import { type Message } from "@prisma/client";

interface MessageSearchProps {
  searchPosition: string;
  messages: { message: Message; author: PostAuthor }[];
  isLoadingMessages: boolean;
  isFocused: boolean;
  setIsFocused: React.Dispatch<React.SetStateAction<boolean>>;
  combinedResultsSubmit: CombinedResult[]
  setCombinedResultsSubmit: React.Dispatch<React.SetStateAction<CombinedResult[]>>;
}

export type CombinedResult =
  | { type: "user"; data: User; index: number }
  | {
      type: "message";
      data: { message: ExtendedMessage; author: PostAuthor };
      index: number;
    };

export const MessageSearch: React.FC<MessageSearchProps> = ({
  searchPosition,
  messages,
  isLoadingMessages,
  isFocused,
  setIsFocused,
  setCombinedResultsSubmit
}) => {
  const { userList, isLoading: LoadingUserList } = useContext(UserContext);

  const { user: currentUser } = useUser();

  const resultRefs = useRef<React.RefObject<HTMLAnchorElement>[]>([]);

  const router = useRouter();

  const ctx = api.useContext();

  const handleSearchSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Add query to database
    searchHistoryMutate({ query: input });
    if (isFocused) {
      setIsFocused(false);
    }

    // Real-time filtering logic
    const newCombinedResults: CombinedResult[] = [];

      userList.forEach((user, index) => {
        if (
          user.username?.toLowerCase().includes(input.slice(1).toLowerCase()) ||
          user.firstName
            ?.toLowerCase()
            .includes(input.slice(1).toLowerCase()) ||
          user.lastName?.toLowerCase().includes(input.slice(1).toLowerCase())
        ) {
          newCombinedResults.push({ type: "user", data: user, index });
        }
      });

    messages.forEach((message, index) => {
      if (message.message.content.toLowerCase().includes(input.toLowerCase())) {
        newCombinedResults.push({ type: "message", data: message, index });
      }
    });

    // Update state
    setCombinedResultsSubmit(newCombinedResults);

    // Update URL query parameter
    await router.push(
      {
        pathname: router.pathname,
        query: { q: input },
      },
      undefined,
      { shallow: true }
    );
  };

  const [input, setInput] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [isTypingQuery, setIsTypingQuery] = useState(false);

  const [combinedResults, setCombinedResults] = useState<CombinedResult[]>([]);


  useEffect(() => {
    const newCombinedResults: CombinedResult[] = [];

    if (input.startsWith("@")) {
      userList.forEach((user, index) => {
        if (
          user.username?.toLowerCase().includes(input.slice(1).toLowerCase()) ||
          user.firstName
            ?.toLowerCase()
            .includes(input.slice(1).toLowerCase()) ||
          user.lastName?.toLowerCase().includes(input.slice(1).toLowerCase())
        ) {
          newCombinedResults.push({ type: "user", data: user, index });
        }
      });
    }

    messages.forEach((message, index) => {
      if (message.message.content.toLowerCase().includes(input.toLowerCase())) {
        newCombinedResults.push({ type: "message", data: message, index });
      }
    });

    setCombinedResults(newCombinedResults);
  }, [input, userList, messages]);

  const { mutate: searchHistoryMutate, isLoading: addSearchQueryLoading } =
    api.messages.addQueryToSearchHistory.useMutation({
      onSuccess: () => {
        setInput("");
        setIsTypingQuery(false);
        void ctx.messages.getSearchHistoryUser.invalidate();
      },
      onError: (e) => {
        const errorMessage = e.data?.zodError?.fieldErrors.content;
        if (errorMessage && errorMessage[0]) {
          toast.error(errorMessage[0]);
        } else {
          toast.error("Failed to Follow! Are you logged in?");
        }
      },
    });

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

  const handleArrowNavigation = (direction: "up" | "down") => {
    setHighlightedIndex((prevIndex) => {
      let nextIndex = direction === "up" ? prevIndex - 1 : prevIndex + 1;

      // Boundary checks
      const maxIndex = combinedResults.length - 1; // Use the length of combinedResults
      if (nextIndex < 0) nextIndex = 0;
      if (nextIndex > maxIndex) nextIndex = maxIndex;

      // Scroll into view
      const nextRef = resultRefs.current[nextIndex];
      if (nextRef && nextRef.current) {
        nextRef.current.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }

      return nextIndex;
    });
  };

  return (
    <div className="relative px-4">
      <form
        className=""
        onSubmit={(e) => {
          e.preventDefault();
          handleSearchSubmit(e).catch(() =>
            toast.error("Something went wrong")
          );
        }}
      >
        <input
          type="text"
          placeholder="Search Direct Messages"
          className="h-10 w-full rounded-full border-2 border-Intone-300 bg-transparent py-2 pl-8 pr-4 outline-none"
          name="q" // query parameter
          value={input}
          onClick={() => setIsFocused(true)}
          onChange={(e) => handleQueryChange(e)}
          autoComplete="off"
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              handleArrowNavigation("down");
            } else if (e.key === "ArrowUp") {
              handleArrowNavigation("up");
            } else if (e.key === "Tab") {
              resultRefs.current[highlightedIndex]?.current?.click();
            }
          }}
        />
        <FontAwesomeIcon
          icon={faSearch}
          className={`absolute ${searchPosition} top-[38%] h-3 w-3 text-Intone-300`}
        />
      </form>
      {addSearchQueryLoading && <LoadingSpinner />}
      {isTypingQuery && combinedResults.length > 0 && (
        <div
          className={`${"right-1/2 top-14 min-w-3/4 translate-x-1/2 "} 
    gray-thin-scrollbar absolute z-10 flex max-h-[300px] 
          scroll-p-4 
          flex-col overflow-auto rounded-xl border border-slate-400 bg-Intone-100 shadow-xl`}
        >
          <div className="flex flex-col">
            {LoadingUserList || isLoadingMessages ? (
              <LoadingSpinner />
            ) : (
              <>
                {combinedResults.map((result, index) => {
                  const refIndex = index;

                  if (!resultRefs.current[refIndex]) {
                    resultRefs.current[refIndex] =
                      React.createRef<HTMLAnchorElement>();
                  }
                  return (
                    <React.Fragment key={index}>
                      {result.type === "user" && (
                        <UserCardSearchResults
                          user={result.data}
                          index={index}
                          src="message"
                          highlightedIndex={highlightedIndex}
                          scrollRef={
                            resultRefs.current?.[index] ??
                            React.createRef<HTMLAnchorElement>()
                          }
                        />
                      )}
                      {result.type === "message" && (
                        <MessageCardSearchResults
                          message={result.data}
                          index={index}
                          highlightedIndex={highlightedIndex}
                          currentUserId={currentUser?.id ?? ""}
                          scrollRef={
                            resultRefs.current?.[index] ??
                            React.createRef<HTMLAnchorElement>()
                          }
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
