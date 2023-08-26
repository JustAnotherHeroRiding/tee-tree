import type { NextPage } from "next";
import { PageLayout } from "~/components/layout";
import BackButton from "~/components/ReusableElements/BackButton";
import { Tooltip } from "react-tooltip";
import { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import useOutsideClick from "~/components/customHooks/outsideClick";

const MessagesPage: NextPage = () => {
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const modalNewMessageRef = useRef<HTMLDivElement>(null);

  useOutsideClick(modalNewMessageRef, () => {
    if (showNewMessageModal) {
      setShowNewMessageModal(false);
    }
  });

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
                className="w-fit rounded-3xl p-1 -mt-1 hover:bg-Intone-700"
                onClick={() => setShowNewMessageModal(false)}
              >
                <FontAwesomeIcon className="h-6 w-6" icon={faXmark} />
              </button>
              <p className=" font-bold text-xl">New Message</p>
            </div>
          </div>
        </div>
      )}
      <h1>Messages</h1>
    </PageLayout>
  );
};

export default MessagesPage;
