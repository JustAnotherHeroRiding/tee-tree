import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { api } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { LoadingSpinner } from "~/components/ReusableElements/loading";
import { useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import TextareaAutosize from "react-textarea-autosize";
import {
  faFaceSmile,
  faImage,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { filesize } from "filesize";
import Compressor from "compressorjs";
import { Tooltip } from "react-tooltip";
import { UserContext } from "../Context/UserContext";

dayjs.extend(relativeTime);

interface CreatePostWizardProps {
  homePage: boolean;
}

type User = {
  id: string;
  username: string | null;
  profilePicture: string;
  firstName: string | null;
  lastName: string | null;
};

interface UserCardProps {
  user: User;
  index: number;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  setIsTypingUsername: React.Dispatch<React.SetStateAction<boolean>>;
  setTextLength: React.Dispatch<React.SetStateAction<number>>;
}

export const UserCard: React.FC<UserCardProps> = ({ user, index, input, setInput, setIsTypingUsername, setTextLength }) => {
  const userRef = useRef<HTMLDivElement>(null); // create a reference

  useEffect(() => {
    if (index === 0 && userRef.current ) {
       // if it's the first user
        // if the div exists
        userRef.current.focus(); // focus the div
    }
  }, [index]);

  return (
    <div
      tabIndex={0}
      ref={userRef}
      className={`flex flex-row rounded-xl p-4 focus:outline-none hover:bg-Intone-200 focus:text-red-600 ${
        index == 0 ? "bg-Intone-200" : ""
      }`}
      onClick={() => {
        // Replace typed username with selected username
        const words = input.split(" ");
        words[words.length - 1] = user.username
          ? `@${user.username}`
          : "";
        setInput(words.join(" "));
        if (words[0]) {
          setTextLength(words[0].length);
        }
        // Stop showing the drop-down
        setIsTypingUsername(false);
      }}
    >
      <Image
        className="mr-4 h-14 w-14 rounded-full"
        src={user.profilePicture}
        alt="Profile Image"
        width={56}
        height={56}
        priority={true}
      />
      <div className="flex flex-col ">
        {user.firstName && user.lastName && (
          <span>
            {user.firstName}
            {user.lastName}
          </span>
        )}
        <li className="">{user.username}</li>
      </div>
    </div>
  );
}

export const CreatePostWizard: React.FC<CreatePostWizardProps> = ({
  homePage,
}) => {
  const { user } = useUser();
  const { userList, isLoading: LoadingUserList } = useContext(UserContext);

  // const myImage = cld.image("cld-sample-2");
  // Make sure to replace 'demo' with your actual cloud_name
  const imageUploadUrl =
    "https://api.cloudinary.com/v1_1/de5zmknvp/image/upload";
  const gifUploadUrl = "https://api.cloudinary.com/v1_1/de5zmknvp/image/upload";

  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const [gifFile, setGifFile] = useState<File | undefined>(undefined);
  const gifInput = useRef(null);
  const imageInput = useRef(null);

  interface ImageResponse {
    public_id: string;
  }
  const compressImage = async (image: File): Promise<File | Blob> => {
    return new Promise((resolve, reject) => {
      new Compressor(image, {
        quality: 0.8,
        success: (result) => resolve(result),
        error: (err) => reject(err),
      });
    });
  };

  const imageUpload = async (image: File | undefined) => {
    if (image) {
      try {
        const compressedImage = await compressImage(image);
        const formData = new FormData();
        formData.append("file", compressedImage, "image.jpg");
        formData.append("upload_preset", "kcgwkpy1");

        const imageResponse = await fetch(imageUploadUrl, {
          method: "POST",
          body: formData,
        });

        if (imageResponse.ok) {
          const imageResponseJson =
            (await imageResponse.json()) as ImageResponse;
          if (!imageResponseJson?.public_id) {
            toast.error("Upload to Cloudinary failed!");
          } else {
            return imageResponseJson;
          }
        } else {
          toast.error("Upload to Cloudinary failed!");
        }
      } catch (err) {
        toast.error("Upload failed.");
      }
    }
  };

  const gifUpload = async (gif: File | undefined) => {
    if (gif) {
      try {
        const formData = new FormData();
        formData.append("file", gifFile as Blob, "gif.gif");
        formData.append("upload_preset", "kcgwkpy1");

        const gifResponse = await fetch(gifUploadUrl, {
          method: "POST",
          body: formData,
        });

        if (gifResponse.ok) {
          const gifResponseJson = (await gifResponse.json()) as ImageResponse;
          if (!gifResponseJson?.public_id) {
            toast.error("Upload to Cloudinary failed!");
          } else {
            return gifResponseJson;
          }
        } else {
          toast.error("Upload to Cloudinary failed!");
        }
      } catch (err) {
        toast.error("Upload failed.");
      }
    }
  };

  useEffect(() => {
    console.log(filesize(imageFile?.size || 0));
  }, [imageFile]);

  const [input, setInput] = useState("");

  const ctx = api.useContext();
  const { mutate: mutateAddImageToPost } = api.posts.addImageToPost.useMutation(
    {
      onSuccess: () => {
        if (homePage || !imageFile) {
          void ctx.posts.infiniteScrollAllPosts.invalidate();
        } else {
          void ctx.posts.infiniteScrollFollowerUsersPosts.invalidate();
        }
        setImageFile(undefined);
        setPreviewUrl("");
      },
      onError: (e) => {
        const errorMessage = e.data?.zodError?.fieldErrors.content;
        if (errorMessage && errorMessage[0]) {
          toast.error(errorMessage[0]);
        } else {
          toast.error("Failed to upload the image.");
        }
      },
    }
  );

  const { mutate: mutateAddGifToPost } = api.posts.addGifToPost.useMutation({
    onSuccess: () => {
      if (homePage || !gifFile) {
        void ctx.posts.infiniteScrollAllPosts.invalidate();
      } else {
        void ctx.posts.infiniteScrollFollowerUsersPosts.invalidate();
      }
      setGifFile(undefined);
      setPreviewUrl("");
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to upload the gif`.");
      }
    },
  });

  useEffect(() => {
    console.log(previewUrl);
  }, [previewUrl]);

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: async (post) => {
      if (imageFile) {
        const imageResponseJson = await imageUpload(imageFile);
        if (imageResponseJson) {
          mutateAddImageToPost({
            id: post.id,
            publicId: imageResponseJson.public_id,
          });
        }
      } else if (gifFile) {
        const gifResponseJson = await gifUpload(gifFile);
        if (gifResponseJson) {
          mutateAddGifToPost({
            id: post.id,
            publicId: gifResponseJson.public_id,
          });
        }
      }

      setInput("");
      setTextLength(0);
      if (homePage || !imageFile) {
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

  const [isTypingUsername, setIsTypingUsername] = useState(false);
  const [isTypingTrend, setIsTypingTrend] = useState(false);

  const [typedUsername, setTypedUsername] = useState("");
  const [typedTrend, setTypedTrend] = useState("");

  const handleTextareaChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setInput(event.target.value);
    setTextLength(event.target.textLength);

    const words = event.target.value.split(" ");
    const lastWord = words[words.length - 1];

    if (lastWord) {
      if (lastWord.startsWith("@") && lastWord.length > 1) {
        if (possibleUsernames.length === 0) {
          setIsTypingUsername(false);
        } else {
          setIsTypingUsername(true);
        }
        setTypedUsername(lastWord.slice(1));
      } else if (lastWord.startsWith("#")) {
        setIsTypingTrend(true);
        setTypedTrend(lastWord.slice(1));
      } else {
        setIsTypingUsername(false);
      }
    } else {
      setIsTypingUsername(false);
    }
  };

  const [possibleUsernames, setPossibleUsernames] = useState<User[]>([]);

  useEffect(() => {
    const filteredUsernames = userList
      .filter(
        (user) =>
          user.username &&
          user.username.toLowerCase().includes(typedUsername.toLowerCase())
      )
      .map(({ id, username, profilePicture, firstName, lastName }) => ({
        id,
        username,
        profilePicture: profilePicture || "",
        firstName: firstName || "",
        lastName: lastName || "",
      }));
    if (filteredUsernames) {
      setPossibleUsernames(filteredUsernames.slice(0, 6));
    }
  }, [userList, typedUsername]);

  if (!user) return null;

  return (
    <div className="relative">
      <div className="relative mb-4 flex gap-3 border-b border-slate-400 pb-4">
        {isTypingUsername && (
          <ul
            className="gray-thin-scrollbar absolute right-8 top-20 z-10 flex 
          max-h-[250px] w-fit max-w-[350px] flex-col overflow-auto rounded-xl bg-Intone-100"
          >
            {possibleUsernames.map((user, index) =>  (
                <UserCard key={index} user={user} index={index} setInput={setInput}
                 input={input} setIsTypingUsername={setIsTypingUsername} setTextLength={setTextLength} />
            )
            )}
          </ul>
        )}
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
          placeholder="What's on your mind?"
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
            onClick={() => mutate({ content: input })}
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
      {LoadingUserList && (
        <div className="flex items-center justify-center">
          <LoadingSpinner size={20} />
        </div>
      )}

      <div className="flex flex-row items-center gap-2 border-b border-slate-400 pb-4">
        <label>
          <input
            type="file"
            ref={imageInput}
            className="hidden"
            accept="image/*"
            onChange={(event) => {
              if (event.target.files && event.target.files.length > 0) {
                // create a URL representing the file
                const url = URL.createObjectURL(event.target.files[0] as Blob);

                // store the URL in the state
                setPreviewUrl(url);
                // only proceed if files have been selected
                setImageFile(event.target.files[0]);
                setGifFile(undefined);
              }
              event.target.value = "";
            }}
          />
          <FontAwesomeIcon
            data-tooltip-id="ImageUpload-tooltip"
            data-tooltip-content="Upload Image"
            className="CreatePostWizard-Icons"
            icon={faImage}
          />
          <Tooltip
            id="ImageUpload-tooltip"
            place="bottom"
            style={{
              borderRadius: "24px",
              backgroundColor: "rgb(51 65 85)",
            }}
          />
        </label>
        <label>
          <input
            type="file"
            ref={gifInput}
            className="hidden"
            accept="image/gif"
            onChange={(event) => {
              if (event.target.files && event.target.files.length > 0) {
                // only proceed if files have been selected
                // create a URL representing the file
                const url = URL.createObjectURL(event.target.files[0] as Blob);

                // store the URL in the state
                setPreviewUrl(url);
                setGifFile(event.target.files[0]);
                setImageFile(undefined);
              }
              event.target.value = "";
            }}
          />
          <Image
            className="cursor-pointer rounded bg-white hover:bg-slate-300"
            src="/gif.png"
            alt="emoji"
            width={24}
            height={24}
            priority={true}
            data-tooltip-id="gifUpload-tooltip"
            data-tooltip-content="Upload Gif"
          />
          <Tooltip
            id="gifUpload-tooltip"
            place="bottom"
            style={{
              borderRadius: "24px",
              backgroundColor: "rgb(51 65 85)",
            }}
          />
        </label>

        <FontAwesomeIcon
          className="CreatePostWizard-Icons"
          icon={faFaceSmile}
          data-tooltip-id="emoji-tooltip"
          data-tooltip-content="Emoji"
        />
        <Tooltip
          id="emoji-tooltip"
          place="bottom"
          style={{
            borderRadius: "24px",
            backgroundColor: "rgb(51 65 85)",
          }}
        />
      </div>
      {previewUrl && (
        <div className="relative mx-auto mt-6 w-[300px] overflow-auto">
          <FontAwesomeIcon
            onClick={() => {
              setPreviewUrl("");
              setImageFile(undefined);
              setGifFile(undefined);
            }}
            icon={faXmark}
            className="absolute right-2 top-2 h-7 w-7 cursor-pointer rounded-3xl bg-gray-600 p-1 hover:text-slate-300"
          />
          <Image
            className="rounded border border-slate-400"
            width={350}
            height={350}
            src={previewUrl}
            alt="Preview"
          />
        </div>
      )}
    </div>
  );
};
