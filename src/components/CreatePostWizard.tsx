import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { api } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { LoadingSpinner } from "~/components/loading";
import { useState } from "react";
import toast from "react-hot-toast";
import TextareaAutosize from "react-textarea-autosize";
import { faFaceSmile, faImage } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Cloudinary } from "@cloudinary/url-gen";
import { AdvancedImage } from "@cloudinary/react";

dayjs.extend(relativeTime);

interface CreatePostWizardProps {
  homePage: boolean;
}

export const CreatePostWizard: React.FC<CreatePostWizardProps> = ({
  homePage,
}) => {
  const { user } = useUser();
  const cld = new Cloudinary({ cloud: { cloudName: "de5zmknvp" } });

  const myImage = cld.image("cld-sample-2");
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);


  const [input, setInput] = useState("");

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      setTextLength(0);
      if (homePage) {
        void ctx.posts.infiniteScrollAllPosts.invalidate();
      } else {
        void ctx.posts.infiniteScrollFollowerUsersPosts.invalidate();
      }
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to Post! Please try again later.");
      }
    },
  });

  const [textLength, setTextLength] = useState(0);

  const handleTextareaChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setInput(event.target.value);
    setTextLength(event.target.textLength);
  };

  if (!user) return null;

  console.log(imageFile)

  return (
    <>
      <div className="relative mb-4 flex gap-3 border-b border-slate-400 pb-4">
        <AdvancedImage
          cldImg={myImage}
          width={56}
          height={56}
          alt="cloudinary example"
        />
        <Image
          className="h-14 w-14 rounded-full"
          src={user.profileImageUrl}
          alt="Profile Image"
          width={56}
          height={56}
          priority={true}
        />
        <h1 className="absolute -top-4 right-0 rounded-3xl">
          {textLength}/280
        </h1>
        <TextareaAutosize
          placeholder="Type Some emojis"
          className="grow resize-none bg-transparent outline-none"
          value={input}
          maxLength={280}
          onChange={(e) => handleTextareaChange(e)}
          disabled={isPosting}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (input !== "") {
                mutate({ content: input });
              }
            }
          }}
        />
        {input !== "" && !isPosting && (
          <button
            className="mb-auto ml-auto mt-4 flex items-center rounded-3xl border border-slate-400 
      px-4 py-1 hover:bg-slate-700"
            onClick={() => mutate({ content: input, image: imageFile })}
          >
            Post
          </button>
        )}

        {isPosting && (
          <div className="flex items-center justify-center">
            <LoadingSpinner size={20} />
          </div>
        )}
      </div>
      <div className="flex flex-row items-center gap-2">
        <label>
          <input type="file" className="hidden" accept="image/*" onChange={(event) => {
    if (event.target.files && event.target.files.length > 0) { // only proceed if files have been selected
      setImageFile(event.target.files[0]);
    }
  }}
 />
          <FontAwesomeIcon className="CreatePostWizard-Icons" icon={faImage} />
        </label>

        <Image
          className="rounded bg-white hover:bg-slate-300"
          src="/gif.png"
          alt="emoji"
          width={24}
          height={24}
          priority={true}
        />
        <FontAwesomeIcon
          className="CreatePostWizard-Icons"
          icon={faFaceSmile}
        />
      </div>
    </>
  );
};
