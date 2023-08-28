import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { MessageSearch } from "./MessagesSearch";

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
border-indigo-200 bg-black p-4 sm:w-[55vw] lg:w-[35vw]"
      >
        <div className="flex flex-row">
          <button
            className="-mt-1 w-fit rounded-3xl p-1 hover:bg-Intone-700"
            onClick={() => setShowNewMessageModal(false)}
          >
            <FontAwesomeIcon className="h-6 w-6" icon={faXmark} />
          </button>
          <p className="text-xl">New Message</p>
        </div>
        <MessageSearch searchPosition="left-[6%]" />
      </div>
    </div>
  );
};

