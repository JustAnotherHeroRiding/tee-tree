import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { MessageSearch } from "./MessagesSearch";
import { useContext } from "react";
import { UserContext } from "~/components/Context/UserContext";
import { LoadingSpinner } from "../loading";
import Image from "next/image";

type NewMessageModalProps = {
  showNewMessageModal: boolean;
  setShowNewMessageModal: React.Dispatch<React.SetStateAction<boolean>>;
  modalNewMessageRef: React.RefObject<HTMLDivElement>;
};

export const NewMessageModal: React.FC<NewMessageModalProps> = ({
  showNewMessageModal,
  setShowNewMessageModal,
  modalNewMessageRef,
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
        className="modalComment mx-auto flex h-fit w-[95vw] flex-col rounded-3xl border
border-indigo-200 bg-black sm:w-[55vw] lg:w-[35vw] overflow-auto"
      >
        <div className="flex flex-row p-4">
          <button
            className="-mt-1 w-fit rounded-3xl p-1 hover:bg-Intone-700"
            onClick={() => setShowNewMessageModal(false)}
          >
            <FontAwesomeIcon className="h-6 w-6" icon={faXmark} />
          </button>
          <p className="text-xl">New Message</p>
        </div>
        <MessageSearch searchPosition="left-[6%]" />
        <h1 className="mt-4 text-xl px-4"> Previously messaged users</h1>
        {LoadingUserList ? (
          <LoadingSpinner />
        ) : (
            <div className="overflow-auto gray-thin-scrollbar ">
          {userList.map((user) => (
            <div
              key={user.id}
              className="mt-2 px-4 py-2 flex flex-row items-center justify-between hover:bg-Intone-700"
            >
              <Image
              className="rounded-3xl w-12 h-12"
                alt={`${user.username ?? ""}'s profile picture`}
                src={user.profileImageUrl}
                width={48}
                height={48}
              />
              <div className="flex flex-col ml-4 mr-auto">
              <p className="text-lg">{user.username}</p>
              <span>{user.firstName}{"  "}{user.lastName}</span>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>
    </div>
  );
};
