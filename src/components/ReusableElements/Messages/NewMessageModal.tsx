import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { MessageSearch } from "./MessagesSearch";
import { useContext } from "react";
import { UserContext } from "~/components/Context/UserContext";
import { LoadingSpinner } from "../loading";
import Image from "next/image";
import Link from "next/link";
import { type ExtendedMessage } from "~/server/api/routers/messages";
import type { PostAuthor } from "~/server/api/routers/posts";
import type { CombinedResult } from "./MessagesSearch";

type NewMessageModalProps = {
  showNewMessageModal: boolean;
  setShowNewMessageModal: React.Dispatch<React.SetStateAction<boolean>>;
  modalNewMessageRef: React.RefObject<HTMLDivElement>;
  messages: { message: ExtendedMessage; author: PostAuthor }[];
  isLoadingMessages: boolean;
  isFocused: boolean;
  setIsFocused: React.Dispatch<React.SetStateAction<boolean>>;
  combinedResultsSubmit: CombinedResult[]
  setCombinedResultsSubmit: React.Dispatch<React.SetStateAction<CombinedResult[]>>;
};

export const NewMessageModal: React.FC<NewMessageModalProps> = ({
  showNewMessageModal,
  setShowNewMessageModal,
  modalNewMessageRef,
  messages,
  isLoadingMessages,
  isFocused,
  setIsFocused,
  combinedResultsSubmit,
  setCombinedResultsSubmit
  
}) => {
  const { userList, isLoading: LoadingUserList } = useContext(UserContext);

  return (
    <div
      className={`modalparent transform transition-transform duration-300 ease-in-out ${
        showNewMessageModal
          ? "visible scale-100 opacity-100"
          : "invisible scale-0 opacity-0"
      }`}
    >
      <div
        ref={modalNewMessageRef}
        className="modalComment mx-auto flex h-fit w-[95vw] flex-col overflow-auto rounded-3xl
border border-indigo-200 bg-black sm:w-[55vw] lg:w-[35vw]"
      >
        <div className="flex flex-row p-4">
          <button
            className="-mt-1 w-fit rounded-3xl p-1 hover:bg-Intone-700"
            onClick={() => setShowNewMessageModal(false)}
          >
            <FontAwesomeIcon className="h-6 w-6 flex" icon={faXmark} />
          </button>
          <p className="text-xl font-bold">New Message</p>
        </div>
        <MessageSearch
          searchPosition="left-[6%]"
          messages={messages}
          isLoadingMessages={isLoadingMessages}
          isFocused={isFocused}
          setIsFocused={setIsFocused}
          combinedResultsSubmit={combinedResultsSubmit}
          setCombinedResultsSubmit={setCombinedResultsSubmit}
        />
        <h1 className="mt-4 px-4 text-xl"> Previously messaged users</h1>
        {LoadingUserList ? (
          <LoadingSpinner />
        ) : (
          <div className="gray-thin-scrollbar overflow-auto ">
            {userList.map((user) => (
              <Link
                href={`/messages/${user.id}`}
                key={user.id}
                className="mt-2 flex flex-row items-center justify-between px-4 py-2 hover:bg-Intone-700"
              >
                <Image
                  className="h-12 w-12 rounded-3xl"
                  alt={`${user.username ?? ""}'s profile picture`}
                  src={user.profileImageUrl}
                  width={48}
                  height={48}
                />
                <div className="ml-4 mr-auto flex flex-col">
                  <p className="text-lg">{user.username}</p>
                  <span>
                    {user.firstName}
                    {"  "}
                    {user.lastName}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
