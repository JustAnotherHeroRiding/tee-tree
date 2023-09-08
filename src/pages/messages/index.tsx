import type { NextPage } from "next";
import { PageLayout } from "~/components/layout";
import { FormkitArrowleft } from "~/components/ReusableElements/BackButton";
import { Tooltip } from "react-tooltip";
import { useState, useRef, useEffect, useContext } from "react";
import useOutsideClick from "~/components/customHooks/outsideClick";
import { NewMessageModal } from "~/components/ReusableElements/Messages/NewMessageModal";
import { MessageSearch } from "~/components/ReusableElements/Messages/MessagesSearch";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { PreviousUsers } from "~/components/ReusableElements/Messages/PreviousConversations";
import { LoadingSpinner } from "~/components/ReusableElements/loading";
import { type CombinedResult } from "~/components/ReusableElements/Messages/MessagesSearch";
import { UserContext } from "~/components/Context/UserContext";

import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";

interface UilUserProps {
  width: string | number;
  height: string | number;
  fill?: string;
  className?: string;
}

export function UilUser({ width, height, className }: UilUserProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        fill="#ffffff"
        d="M15.71 12.71a6 6 0 1 0-7.42 0a10 10 0 0 0-6.22 8.18a1 1 0 0 0 2 .22a8 8 0 0 1 15.9 0a1 1 0 0 0 1 .89h.11a1 1 0 0 0 .88-1.1a10 10 0 0 0-6.25-8.19ZM12 12a4 4 0 1 1 4-4a4 4 0 0 1-4 4Z"
      ></path>
    </svg>
  );
}

export function CrossIcon({ width, height, className }: UilUserProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 12 12"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        fill="#ffffff"
        d="M2.22 2.22a.749.749 0 0 1 1.06 0L6 4.939L8.72 2.22a.749.749 0 1 1 1.06 1.06L7.061 6L9.78 8.72a.749.749 0 1 1-1.06 1.06L6 7.061L3.28 9.78a.749.749 0 1 1-1.06-1.06L4.939 6L2.22 3.28a.749.749 0 0 1 0-1.06Z"
      ></path>
    </svg>
  );
}

export function SearchIcon({ width, height, className }: UilUserProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        fill="#ffffff"
        d="m19.6 21l-6.3-6.3q-.75.6-1.725.95T9.5 16q-2.725 0-4.612-1.888T3 9.5q0-2.725 1.888-4.612T9.5 3q2.725 0 4.612 1.888T16 9.5q0 1.1-.35 2.075T14.7 13.3l6.3 6.3l-1.4 1.4ZM9.5 14q1.875 0 3.188-1.313T14 9.5q0-1.875-1.313-3.188T9.5 5Q7.625 5 6.312 6.313T5 9.5q0 1.875 1.313 3.188T9.5 14Z"
      ></path>
    </svg>
  );
}

const MessagesPage: NextPage = () => {
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const modalNewMessageRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const ctx = api.useContext();

  const [urlQuery, setUrlQuery] = useState<string | undefined>(
    (router.query.q as string) || undefined
  );

  const { user, isLoaded: isUserLoaded } = useUser();
  const { userList } = useContext(UserContext);

  const [isFocused, setIsFocused] = useState(false);

  const { data: searchHistory, isLoading: loadingSearchHistory } =
    api.messages.getSearchHistoryUser.useQuery(undefined);

  const { data: allMessages, isLoading: isLoadingMessages } =
    api.messages.getById.useQuery({ authorId: user?.id ?? "" });

  const [uniqueUserIds, setUniqueUserIds] = useState<Set<string>>(new Set());

  const [combinedResultsSubmit, setCombinedResultsSubmit] = useState<
    CombinedResult[]
  >([]);

  useEffect(() => {
    const newUniqueUserIds = new Set<string>();

    allMessages?.forEach((message) => {
      if (message.message.authorId === user?.id) {
        newUniqueUserIds.add(message.message.recipientId);
      } else if (message.message.recipientId === user?.id) {
        newUniqueUserIds.add(message.message.authorId);
      }
    });

    setUniqueUserIds(newUniqueUserIds);
  }, [allMessages, user?.id]);

  useEffect(() => {
    if (!user && isUserLoaded) {
      console.log("No user");
      // Redirect to Clerk's sign-in page
      void router.push("/sign-in");
    }
  }, [user, router, isUserLoaded]);

  useOutsideClick(modalNewMessageRef, () => {
    if (showNewMessageModal) {
      setShowNewMessageModal(false);
    }
  });

  const handleInitialLoad = () => {
    // Real-time filtering logic
    const newCombinedResults: CombinedResult[] = [];

    if (urlQuery && urlQuery.length > 0) {
      userList.forEach((user, index) => {
        if (
          user.username
            ?.toLowerCase()
            .includes(urlQuery?.slice(1).toLowerCase()) ||
          user.firstName
            ?.toLowerCase()
            .includes(urlQuery.slice(1).toLowerCase()) ||
          user.lastName
            ?.toLowerCase()
            .includes(urlQuery?.slice(1).toLowerCase())
        ) {
          newCombinedResults.push({ type: "user", data: user, index });
        }
      });
      if (allMessages) {
        allMessages.forEach((message, index) => {
          if (
            message.message.content
              .toLowerCase()
              .includes(urlQuery?.toLowerCase())
          ) {
            newCombinedResults.push({ type: "message", data: message, index });
          }
        });
      }
    }

    // Update state
    setCombinedResultsSubmit(newCombinedResults);
  };

  useEffect(() => {
    if (urlQuery && combinedResultsSubmit.length === 0 && !isLoadingMessages) {
      console.log(combinedResultsSubmit)
      handleInitialLoad();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingMessages]);

  const { mutate: clearSearchHistory, isLoading: isClearingMessages } =
    api.messages.deleteSearchHistoryUser.useMutation({
      onSuccess: () => {
        void ctx.messages.getSearchHistoryUser.invalidate();
        toast("Search history deleted successfully");
      },
      onError: () => {
        toast.error("Failed to delete search history");
      },
    });

  const { mutate: clearSearchResultSingle, isLoading: isClearingSearchResult } =
    api.messages.deleteSearchHistorySingle.useMutation({
      onSuccess: () => {
        void ctx.messages.getSearchHistoryUser.invalidate();
        toast("Search result deleted successfully");
      },
      onError: () => {
        toast.error("Failed to delete search result");
      },
    });

  const handleSearchHistoryClick = async (query: string) => {
    await router.push(
      {
        pathname: router.pathname,
        query: { q: query },
      },
      undefined,
      { shallow: true }
    );
    setIsFocused(false);
  };

  let userBannerRendered = false;
  let messageBannerRendered = false;

  return (
    <PageLayout>
      <div
        className="sticky top-0 z-50 flex 
        h-16 flex-row items-center justify-between bg-transparent backdrop-blur-sm"
      >
        <button
          onClick={() => {
            if (isFocused) {
              setIsFocused(false);
            } else if (!isFocused && urlQuery?.length !== 0) {
              setIsFocused(true);
              void router.push(
                {
                  pathname: router.pathname,
                },
                undefined,
                { shallow: true }
              );
            } else {
              const currentPath = router.pathname;
              void router.push(
                currentPath === "/messages" && !urlQuery ? "/" : "/messages"
              );
            }
          }}
        >
          <FormkitArrowleft />
        </button>

        <h1 className="ml-16 mr-auto w-fit text-2xl font-bold">Messages</h1>
        <button
          data-tooltip-id="newMessage-tooltip"
          data-tooltip-content="New Message"
          className="mr-4 rounded-3xl p-2 hover:bg-slate-700"
          onClick={() => setShowNewMessageModal(true)}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#ffffff"
              d="M18.174 1.826c-1.102-1.102-2.082-.777-2.082-.777L7.453 9.681L6 14l4.317-1.454l8.634-8.638s.324-.98-.777-2.082zm-7.569 9.779l-.471.47l-1.473.5a2.216 2.216 0 0 0-.498-.74a2.226 2.226 0 0 0-.74-.498l.5-1.473l.471-.47s.776-.089 1.537.673c.762.761.674 1.538.674 1.538zM16 17H3V4h5l2-2H3c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h13c1.1 0 2-.9 2-2v-7l-2 2v5z"
            />
          </svg>
          <Tooltip
            id="newMessage-tooltip"
            place="bottom"
            style={{
              borderRadius: "24px",
              backgroundColor: "rgb(51 65 85)",
            }}
          />
        </button>
      </div>
      {showNewMessageModal && (
        <NewMessageModal
          showNewMessageModal={showNewMessageModal}
          setShowNewMessageModal={setShowNewMessageModal}
          modalNewMessageRef={modalNewMessageRef}
          messages={allMessages || []}
          isLoadingMessages={isLoadingMessages}
          isFocused={isFocused}
          setIsFocused={setIsFocused}
          combinedResultsSubmit={combinedResultsSubmit}
          setCombinedResultsSubmit={setCombinedResultsSubmit}
        />
      )}
      <MessageSearch
        searchPosition="left-[5%]"
        messages={allMessages || []}
        isLoadingMessages={isLoadingMessages}
        isFocused={isFocused}
        setIsFocused={setIsFocused}
        combinedResultsSubmit={combinedResultsSubmit}
        setCombinedResultsSubmit={setCombinedResultsSubmit}
      />
      {loadingSearchHistory ? (
        <div className="my-4 flex flex-col items-center justify-center">
          <LoadingSpinner size={32} />
          <p className="my-4 w-fit font-semibold">Searching...</p>
        </div>
      ) : isFocused || isClearingMessages ? (
        <div className="mt-4">
          <div className="mb-2 flex flex-row items-center justify-between">
            <h1 className="mb-4 px-4 text-2xl font-bold">Recent Searches</h1>
            <button
              onClick={() => clearSearchHistory()}
              className="mr-1 rounded-3xl border px-4 py-2 hover:border-slate-700 hover:bg-Intone-100"
            >
              Clear all
            </button>
          </div>
          {searchHistory?.map((query, index) => (
            <div
              onClick={() => void handleSearchHistoryClick(query.query)}
              className={`group flex cursor-pointer flex-row items-center justify-between p-4 hover:bg-slate-800 ${
                index === searchHistory.length - 1 ? "border-y" : "border-t"
              } border-slate-700`}
              key={query.id}
            >
              <div className="flex flex-row items-center justify-between">
                <div
                  className="mr-4 rounded-3xl border border-slate-700 p-2 transition-all duration-300
                 ease-in-out group-hover:scale-110 group-hover:border-slate-900"
                >
                  <SearchIcon width={24} height={24} />
                </div>
                <span>{query.query}</span>
              </div>
              {isClearingSearchResult ? (
                <LoadingSpinner />
              ) : (
                <div
                  className="mr-4 h-10 w-10 rounded-3xl p-2 text-Intone-300  hover:bg-slate-600"
                  onClick={() => {
                    clearSearchResultSingle({ id: query.id });
                  }}
                >
                  <CrossIcon width={24} height={24} />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : urlQuery && urlQuery.length > 0 ? (
        combinedResultsSubmit.map((result, index) => (
          <div key={index} className="">
            {result.type === "user" && !userBannerRendered && (
              <div className="my-4 flex flex-row items-center text-2xl font-bold">
                <UilUser width={32} height={32} className="ml-4" />
                <p className="ml-4 font-semibold">Users</p>
              </div>
            )}
            {result.type === "user" && (
              <div className="flex flex-row bg-slate-800 py-2 hover:bg-slate-900">
                <Image
                  src={result.data.profileImageUrl}
                  alt="resultProfile"
                  width={50}
                  height={50}
                  className="mx-4 h-12 w-12 rounded-full"
                />
                <div className="flex flex-col">
                  <span>
                    {result.data.firstName} {result.data.lastName}{" "}
                  </span>
                  <Link
                    href={`/@${result.data.username ?? ""}`}
                    className="text-slate-300"
                  >
                    @{result.data.username}
                  </Link>
                </div>
              </div>
            )}
            {result.type === "user" &&
              !userBannerRendered &&
              (userBannerRendered = true)}

            {result.type === "message" && !messageBannerRendered && (
              <div className="my-4 flex flex-row items-center text-2xl font-bold">
                <svg
                  className={`h-10 w-10 rounded-2xl p-1 group-hover:text-Intone-300`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill={"none"}
                    stroke={"currentColor"}
                    d="m20.34 9.32l-14-7a3 3 0 0 0-4.08 3.9l2.4 5.37a1.06 1.06 0 0 1 0 .82l-2.4 5.37A3 3 0 0 0 5 22a3.14 3.14 0 0 0 1.35-.32l14-7a3 3 0 0 0 0-5.36Zm-.89 3.57l-14 7a1 1 0 0 1-1.35-1.3l2.39-5.37a2 2 0 0 0 .08-.22h6.89a1 1 0 0 0 0-2H6.57a2 2 0 0 0-.08-.22L4.1 5.41a1 1 0 0 1 1.35-1.3l14 7a1 1 0 0 1 0 1.78Z"
                  />
                </svg>{" "}
                <p className="ml-4 font-semibold">Messages</p>
              </div>
            )}

            {result.type === "message" && (
              <div className="bg-slate-800 hover:bg-slate-900">
                <p>{result.data.message.content}</p>
              </div>
            )}
            {result.type === "message" &&
              !messageBannerRendered &&
              (messageBannerRendered = true)}
          </div>
        ))
      ) : (
        <PreviousUsers uniqueUserIds={uniqueUserIds} />
      )}
    </PageLayout>
  );
};

export default MessagesPage;
