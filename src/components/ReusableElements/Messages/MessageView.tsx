import { type PostAuthor } from "~/server/api/routers/posts";
import { type ExtendedMessage } from "~/server/api/routers/messages";
import React, { useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { AdvancedImage } from "@cloudinary/react";
import { LoadingSpinner } from "../loading";
import { api } from "~/utils/api";
import toast from "react-hot-toast";
import { Cloudinary } from "@cloudinary/url-gen";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import useOutsideClick from "~/components/customHooks/outsideClick";
import { invalidateResources } from "../CreatePostWizard";

type MessageViewComponentProps = {
  type?: string;
  message: ExtendedMessage;
  author: PostAuthor;
  showLineBelow?: boolean;
  homePage: boolean;
  isLastSenderMessage?: boolean;
  isLastRecipientMessage?: boolean;
};

const MessageViewComponent = (props: MessageViewComponentProps) => {
  //const deleteImageUrl = `https://api.cloudinary.com/v1_1/de5zmknvp/image/destroy`;

  const { message, author } = props;
  const { user } = useUser();
  const params = new URLSearchParams(location.search);
  const cld = new Cloudinary({ cloud: { cloudName: "de5zmknvp" } });
  const ctx = api.useContext();

  const modalMediaFullRef = useRef<HTMLDivElement>(null);

  useOutsideClick(modalMediaFullRef, () => {
    if (showMediaFullScreen) {
      setShowMediaFullScreen(false);
    }
  });

  const [showMediaFullScreen, setShowMediaFullScreen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isEditing, setIsEditing] = useState(false);

  const { mutate: deleteMediaMessage, isLoading: isDeletingMediaMessage } =
    api.messages.deleteMediaMessage.useMutation({
      onSuccess: (data) => {
        const publicId = data.public_id;
        if (publicId) {
          deleteMediaCloudinary({ publicId: publicId });
        }
        invalidateResources(location, props.homePage, params, ctx);

        console.log("Post Image Deleted");
      },
      onError: (e) => {
        const errorMessage = e.data?.zodError?.fieldErrors.content;
        if (errorMessage && errorMessage[0]) {
          toast.error(errorMessage[0]);
        } else {
          toast.error("Failed to delete Media! Are you the author?");
        }
      },
    });

  const {
    mutate: deleteMediaCloudinary,
    isLoading: isDeletingMediaCloudinary,
  } = api.posts.deleteMediaCloudinary.useMutation({
    onSuccess: () => {
      console.log("Cloudinary Media Deleted");
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to delete Media on Cloudinary!");
      }
    },
  });

  return (
    <div
      className={`mx-2 mb-2 max-w-[250px] border border-slate-300 ${
        author.id === user?.id
          ? `ml-auto bg-Intone-100 ${
              props.isLastSenderMessage
                ? "rounded-bl-3xl rounded-br-none rounded-tl-3xl rounded-tr-3xl"
                : "rounded-3xl"
            }`
          : `mr-auto bg-slate-700 ${
              props.isLastRecipientMessage
                ? "rounded-bl-none rounded-br-3xl rounded-tl-3xl rounded-tr-3xl"
                : "rounded-3xl"
            }`
      } w-fit px-3 py-2`}
    >
      <h1>{message.content}</h1>
      {message.imageUrl && (
        <div className="mx-auto my-4 w-full">
          {isDeletingMediaMessage ? (
            <LoadingSpinner />
          ) : (
            <div
              className="relative flex w-auto cursor-pointer justify-center border-slate-200"
              onClick={() => {
                if (!isEditing) {
                  setShowMediaFullScreen(true);
                }
              }}
            >
              <AdvancedImage
                style={{
                  width: "auto",
                  height: "auto",
                  maxHeight: "400px",
                  borderWidth: "1px",
                  borderColor: "rgb(226 232 240 / var(--tw-border-opacity))",
                  borderRadius: "0.375rem",
                  borderStyle: "solid",
                  overflow: "clip",
                  twBorderOpacity: "1",
                }}
                cldImg={cld.image(message.imageUrl)}
                /* plugins={[
                  lazyload({
                    rootMargin: "10px 20px 10px 30px",
                    threshold: 0.25,
                  }),
                ]} */
              />
              {isEditing && (
                <button
                  onClick={() =>
                    deleteMediaMessage({
                      messageId: message.id,
                      mediaType: "image",
                    })
                  }
                  className="absolute right-0 top-0 z-10 mt-2 rounded-3xl border
             border-slate-400 bg-Intone-200 px-4 py-1 hover:bg-slate-700"
                >
                  Delete Image
                </button>
              )}
            </div>
          )}
        </div>
      )}
      {message.gifUrl && (
        <div className="mx-auto my-4 w-full">
          {isDeletingMediaMessage || isDeletingMediaCloudinary ? (
            <LoadingSpinner />
          ) : (
            <div
              className="relative flex w-auto cursor-pointer justify-center border-slate-200"
              onClick={() => {
                if (!isEditing) {
                  setShowMediaFullScreen(true);
                }
              }}
            >
              <AdvancedImage
                style={{
                  width: "auto",
                  height: "auto",
                  maxHeight: "400px",
                  borderWidth: "1px",
                  borderColor: "rgb(226 232 240 / var(--tw-border-opacity))",
                  borderRadius: "0.375rem",
                  borderStyle: "solid",
                  overflow: "clip",
                  twBorderOpacity: "1",
                }}
                cldImg={cld.image(message.gifUrl)}
              />
              {isEditing && (
                <button
                  onClick={() =>
                    deleteMediaMessage({
                      messageId: message.id,
                      mediaType: "gif",
                    })
                  }
                  className="absolute right-0 top-0 z-10 mt-2 rounded-3xl border
             border-slate-400 bg-Intone-200 px-4 py-1 hover:bg-slate-700"
                >
                  Delete Gif
                </button>
              )}
            </div>
          )}
        </div>
      )}
      {showMediaFullScreen && (
        <div className="modalparent">
          <div
            ref={modalMediaFullRef}
            className="modal relative flex h-[85vh] w-[80vw] items-center 
            justify-center rounded-xl border border-slate-400 bg-black p-4"
          >
            <FontAwesomeIcon
              icon={faXmark}
              className="absolute right-12 top-6 h-7 w-7 cursor-pointer rounded-3xl bg-black px-1"
              onClick={() => setShowMediaFullScreen(false)}
            />
            {message.gifUrl && (
              <AdvancedImage
                style={{
                  objectFit: "fill",
                  maxWidth: "85vw",
                  maxHeight: "80vh",
                  width: "auto",
                  heigth: "auto",
                  borderWidth: "1px",
                  borderColor: "rgb(226 232 240 / var(--tw-border-opacity))",
                  borderRadius: "0.375rem",
                  borderStyle: "solid",
                  overflow: "clip",
                  twBorderOpacity: "1",
                }}
                cldImg={cld.image(message.gifUrl)}
              />
            )}
            {message.imageUrl && (
              <AdvancedImage
                style={{
                  objectFit: "fill",
                  maxWidth: "85vw",
                  maxHeight: "80vh",
                  width: "auto",
                  heigth: "auto",
                  borderWidth: "1px",
                  borderColor: "rgb(226 232 240 / var(--tw-border-opacity))",
                  borderRadius: "0.375rem",
                  borderStyle: "solid",
                  overflow: "clip",
                  twBorderOpacity: "1",
                }}
                cldImg={cld.image(message.imageUrl)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

MessageViewComponent.displayName = "MessageView";

export const MessageView = React.memo(MessageViewComponent);
