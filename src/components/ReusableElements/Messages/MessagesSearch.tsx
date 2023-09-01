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

interface MessageSearchProps {
  searchPosition: string;
  messages: { message: ExtendedMessage; author: PostAuthor }[];
  isLoadingMessages: boolean;
}

export const MessageSearch: React.FC<MessageSearchProps> = ({
  searchPosition,
  messages,
  isLoadingMessages,
}) => {
  const { userList, isLoading: LoadingUserList } = useContext(UserContext);

  const { user: currentUser } = useUser();

  const resultRefs = useRef<React.RefObject<HTMLAnchorElement>[]>([]);

  const [userResultsCount, setUserResultsCount] = useState(0);

  const [input, setInput] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [isTypingQuery, setIsTypingQuery] = useState(false);

  useEffect(() => {
    setUserResultsCount(0); // Reset the count when the input changes
  }, [input]);

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
      const maxIndex = resultRefs.current.length - 1; // Use the actual length of the displayed list
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
      <input
        type="text"
        placeholder="Search Direct Messages"
        className="h-10 w-full rounded-full border-2 border-Intone-300 bg-transparent py-2 pl-8 pr-4 outline-none"
        name="q" // query parameter
        value={input}
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
      {isTypingQuery && (
        <div
          className={`${"right-1/2 top-14 min-w-3/4 translate-x-1/2 "} 
    gray-thin-scrollbar absolute z-10 flex max-h-[300px] 
          scroll-p-4 
          flex-col overflow-auto rounded-xl border border-slate-400 bg-Intone-100 shadow-xl`}
        >
          <div className="flex flex-col">
            {LoadingUserList ? (
              <LoadingSpinner />
            ) : (
              <>
                {/* Filtering and showing user results */}
                {input.split(" ").slice(-1)[0]?.startsWith("@") &&
                  userList.map((user, index) => {
                    if (
                      user.username
                        ?.toLowerCase()
                        .includes(input.slice(1).toLowerCase()) ||
                      user.firstName
                        ?.toLowerCase()
                        .includes(input.slice(1).toLowerCase()) ||
                      user.lastName
                        ?.toLowerCase()
                        .includes(input.slice(1).toLowerCase())
                    ) {
                      if (!resultRefs.current[index]) {
                        resultRefs.current[index] =
                          React.createRef<HTMLAnchorElement>();
                      }

                      if (currentUser?.id === user.id) {
                        return null;
                      }
                      setUserResultsCount((prevCount) => prevCount + 1);

                      return (
                        <UserCardSearchResults
                          key={index}
                          user={user}
                          index={index}
                          src="message"
                          highlightedIndex={highlightedIndex}
                          scrollRef={
                            resultRefs.current?.[index] ||
                            React.createRef<HTMLAnchorElement>()
                          }
                        />
                      );
                    }
                    return null;
                  })}

                {/* Filtering and showing message results */}
                {messages.map((message, index) => {
                  const messageIndex = userResultsCount + index; // Adjust index based on actual userResultsCount

                  if (
                    message.message.content
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  ) {
                    if (!resultRefs.current[messageIndex]) {
                      resultRefs.current[messageIndex] =
                        React.createRef<HTMLAnchorElement>();
                    }

                    if (isLoadingMessages) {
                      return <LoadingSpinner key={message.message.id} />;
                    }
                    return (
                      <MessageCardSearchResults
                        key={index}
                        message={message.message}
                        index={index}
                        highlightedIndex={highlightedIndex}
                        scrollRef={
                          resultRefs.current[messageIndex] ||
                          React.createRef<HTMLAnchorElement>()
                        }
                      />
                    );
                  }
                  return null;
                })}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
