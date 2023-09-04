import type { NextPage } from "next";
import { PageLayout } from "~/components/layout";
import BackButton from "~/components/ReusableElements/BackButton";
import { Tooltip } from "react-tooltip";
import { useState, useRef, useEffect } from "react";
import useOutsideClick from "~/components/customHooks/outsideClick";
import { NewMessageModal } from "~/components/ReusableElements/Messages/NewMessageModal";
import { MessageSearch } from "~/components/ReusableElements/Messages/MessagesSearch";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { PreviousUsers } from "~/components/ReusableElements/Messages/PreviousConversations";

const MessagesPage: NextPage = () => {
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const modalNewMessageRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  const { user, isLoaded: isUserLoaded } = useUser();
  const [isFocused, setIsFocused] = useState(false);

  const { data: searchHistory, isLoading: loadingSearchHistory } =
    api.messages.getSearchHistoryUser.useQuery(undefined, {
      enabled: isFocused,
    });

  const { data: allMessages, isLoading: isLoadingMessages } =
    api.messages.getById.useQuery({ authorId: user?.id ?? "" });

  const [uniqueUserIds, setUniqueUserIds] = useState<Set<string>>(new Set());

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

  if (!allMessages) {
    return null;
  }

  return (
    <PageLayout>
      <div
        className="sticky top-0 z-50 flex 
        h-16 flex-row items-center justify-between bg-transparent backdrop-blur-sm"
      >
        <BackButton />
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
          messages={allMessages}
          isLoadingMessages={isLoadingMessages}
          isFocused={isFocused}
          setIsFocused={setIsFocused}
        />
      )}
      <MessageSearch
        searchPosition="left-[5%]"
        messages={allMessages}
        isLoadingMessages={isLoadingMessages}
        isFocused={isFocused}
        setIsFocused={setIsFocused}
      />
      {(isFocused && router.query.q && router.query.q.length > 0) ||
      (router.query.q && router.query.q.length > 0 && searchHistory) ? (
        searchHistory?.map((query) => (
          <div key={query.id}>
            <span>{query.query}</span>
          </div>
        ))
      ) : (
        <PreviousUsers uniqueUserIds={uniqueUserIds} />
      )}
    </PageLayout>
  );
};

export default MessagesPage;
