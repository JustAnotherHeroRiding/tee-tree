import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { api } from "~/utils/api";
import React from "react";
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
import { UserCard } from "./UserMentionSuggestions";

dayjs.extend(relativeTime);

interface CreatePostWizardProps {
  homePage: boolean;
}

export type User = {
  id: string;
  username: string | null;
  profileImageUrl: string;
  firstName: string | null;
  lastName: string | null;
};

export const CreatePostWizard: React.FC<CreatePostWizardProps> = ({
  homePage,
}) => {
  const { user } = useUser();
  const { userList, isLoading: LoadingUserList } = useContext(UserContext);

  const { data: trends, isLoading: loadingTrends } =
    api.posts.getTrends.useQuery({});

  // const myImage = cld.image("cld-sample-2");
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
      setIsTypingUsername(false);
      setIsTypingTrend(false);
      setHighlightedInput("");
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

  const [highlightedUser, setHighlightedUser] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [prevHighlightedUser, setPrevHighlightedUser] = useState(-1);

  const [highlightedTrend, setHighlightedTrend] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [prevhighlightedTrend, setPrevHighlightedTrend] = useState(-1);

  const userRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);
  const trendRefs = useRef<React.RefObject<HTMLLIElement>[]>([]);

  const [highlightedInput, setHighlightedInput] = useState("");

  const selectUser = (highlightedUser: number) => {
    // Replace typed username with selected username
    const words = input.split(" ");
    const selectedUsername = possibleUsernames[highlightedUser]?.username ?? "";
    words[words.length - 1] = `@${selectedUsername}`;
    setInput(words.join(" "));

    // New array for highlighted words
  const highlightedWords: (string | undefined)[] = [];

  // Highlight all words that start with @ or #
  for(let i = 0; i < words.length; i++){
    const word = words[i];
    if (word) {  // if word is not undefined
      if (word.startsWith("@") || word.startsWith("#")) {
        highlightedWords[i] = `<span class="text-Intone-300">${word}</span>`;
      } else {
        highlightedWords[i] = words[i];
      }
    }
  }


  const highlightedInput = highlightedWords.join(" ");
  setHighlightedInput(highlightedInput);
    setTextLength(words.join(" ").length);
    // Stop showing the drop-down
    setIsTypingUsername(false);
  };

  const selectTrend = (highlightedTrend: string) => {
    // Replace typed username with selected username
    const words = input.split(" ");
    const selectedTrend = highlightedTrend;
    words[words.length - 1] = `${selectedTrend}`;
    setInput(words.join(" "));

      // New array for highlighted words
  const highlightedWords: (string | undefined)[] = [];

  // Highlight all words that start with @ or #
  for(let i = 0; i < words.length; i++){
    const word = words[i];
    if (word) {  // if word is not undefined
      if (word.startsWith("@") || word.startsWith("#")) {
        highlightedWords[i] = `<span class="text-Intone-300">${word}</span>`;
      } else {
        highlightedWords[i] = words[i];
      }
    }
  }


  const highlightedInput = highlightedWords.join(" ");
  setHighlightedInput(highlightedInput);
    setTextLength(words.join(" ").length);

    // Stop showing the drop-down
    setIsTypingTrend(false);
  };

  const handleTextareaChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setInput(event.target.value);
    setTextLength(event.target.textLength);

    const words = event.target.value.split(" ");
    const lastWord = words[words.length - 1];

    // Create the highlighted HTML version of the entered text
    const createMarkup = (text: string) => {
      return text.replace(
        /(@|#)\S+/g,
        '<span class="text-Intone-300">$&</span>'
      );
    };

    setHighlightedInput(createMarkup(event.target.value));

    if (lastWord) {
      if (lastWord.startsWith("@") && lastWord.length > 1) {
        if (possibleUsernames.length === 0) {
          setIsTypingUsername(false);
          setHighlightedUser(0);
        } else {
          setIsTypingUsername(true);
        }
        setTypedUsername(lastWord.slice(1));
      } else if (lastWord.startsWith("#") && lastWord.length > 1) {
        if (possibleTrends.length === 0) {
          setHighlightedTrend(0);
          setIsTypingTrend(false);
        } else {
          setIsTypingTrend(true);
        }
        setTypedTrend(lastWord.slice(1));
      } else {
        setHighlightedUser(0);
        setIsTypingUsername(false);
      }
    } else {
      setHighlightedUser(0);
      setHighlightedTrend(0);
      setIsTypingUsername(false);
      setIsTypingTrend(false);
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
      .map(({ id, username, profileImageUrl, firstName, lastName }) => ({
        id,
        username,
        profileImageUrl: profileImageUrl || "",
        firstName: firstName || "",
        lastName: lastName || "",
      }));
    if (filteredUsernames) {
      setPossibleUsernames(filteredUsernames.slice(0, 6));
      setHighlightedUser(0);
    }
  }, [userList, typedUsername]);

  const [possibleTrends, setPossibleTrends] = useState<[string, number][]>([]);

  useEffect(() => {
    // Filter trends based on typedTrend
    if (trends && !loadingTrends) {
      const filteredTrends = trends.filter(
        (trend) =>
          trend[0] && // Checking if trend name exists.
          trend[0].toLowerCase().includes(typedTrend.toLowerCase()) // Checking if trend name includes the typed trend.
      );

      // If filteredTrends exists, update possibleTrends.
      if (filteredTrends) {
        setPossibleTrends(filteredTrends.slice(0, 6)); // Limiting array to first 6 items.
        setHighlightedTrend(0);
      }
    }
  }, [trends, typedTrend, loadingTrends]);

  if (!user) return null;

  return (
    <div className="relative">
      <div className="relative mb-4 flex gap-3 border-b border-slate-400 pb-4">
        {isTypingUsername && (
          <ul
            className="gray-thin-scrollbar absolute right-8 top-20 z-10 flex 
            max-h-[250px] w-fit max-w-[350px]
            flex-col overflow-auto rounded-xl border border-slate-400 bg-Intone-100 shadow-xl"
          >
            {possibleUsernames.map((user, index) => {
              if (!userRefs.current[index]) {
                userRefs.current[index] = React.createRef<HTMLDivElement>();
              }

              return (
                <UserCard
                  key={index}
                  user={user}
                  index={index}
                  setInput={setInput}
                  input={input}
                  setIsTypingUsername={setIsTypingUsername}
                  setTextLength={setTextLength}
                  highlightedUser={highlightedUser}
                  scrollRef={
                    userRefs.current?.[index] ||
                    React.createRef<HTMLDivElement>()
                  }
                />
              );
            })}
          </ul>
        )}
        {isTypingTrend && possibleTrends.length > 0 && (
          <ul
            className="gray-thin-scrollbar absolute right-8 top-20 z-10 flex 
            max-h-[250px] w-fit min-w-[200px]
            max-w-[350px] flex-col overflow-auto rounded-xl border border-slate-400 bg-Intone-100 shadow-xl"
          >
            {!trends && <LoadingSpinner />}
            {possibleTrends &&
              possibleTrends.map((trend , index) => {
                if (!trendRefs.current[index]) {
                  trendRefs.current[index] = React.createRef<HTMLLIElement>();
                }
                return (
                  <li
                  ref={
                    trendRefs.current?.[index] ||
                    React.createRef<HTMLLIElement>()
                  }
                    className={`${index == highlightedTrend ? "bg-Intone-200" : ""} px-4 py-2   hover:bg-Intone-200`}
                    onClick={() => selectTrend(trend[0])}
                    key={`${trend[0]}+${trend[1]}`}
                  >
                    {trend[0]}
                  </li>
                );
              })}
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
        <div className="relative w-full">
          <div
            className="absolute text-transparent"
            dangerouslySetInnerHTML={{
              __html: highlightedInput.replace(/\n/g, "<br/>"),
            }}
          />
          <TextareaAutosize
            placeholder="What's on your mind?"
            className="w-full grow resize-none bg-transparent outline-none"
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
              } else if (
                e.key === "ArrowDown" &&
                (isTypingTrend || isTypingUsername)
              ) {
                // Down arrow key pressed
                e.preventDefault();
                if (
                  isTypingUsername &&
                  highlightedUser < possibleUsernames.length - 1
                ) {
                  setPrevHighlightedUser(highlightedUser);
                  setHighlightedUser((prevHighlightedUser) => {
                    const nextHighlightedUser = prevHighlightedUser + 1;
                    const nextRef = userRefs.current[nextHighlightedUser];
                    if (nextRef && nextRef.current) {
                      nextRef.current.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest",
                      });
                    }
                    return nextHighlightedUser;
                  });
                } else if (
                  isTypingTrend &&
                  trends &&
                  highlightedTrend < possibleTrends?.length - 1
                ) {
                  setPrevHighlightedTrend(highlightedTrend);
                  setHighlightedTrend((prevhighlightedTrend) => {
                    const nextHighlightedTrend = prevhighlightedTrend + 1;
                    const nextRef = trendRefs.current[nextHighlightedTrend];
                    if (nextRef && nextRef.current) {
                      nextRef.current.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest",
                      });
                    }
                    return nextHighlightedTrend;
                  });                }
              } else if (
                e.key === "ArrowUp" &&
                (isTypingTrend || isTypingUsername)
              ) {
                // Up arrow key pressed
                e.preventDefault();
                if (highlightedUser > 0 && isTypingUsername) {
                  setPrevHighlightedUser(highlightedUser);
                  setHighlightedUser((prevHighlightedUser) => {
                    const nextHighlightedUser = prevHighlightedUser - 1;
                    const nextRef = userRefs.current[nextHighlightedUser];
                    if (nextRef && nextRef.current) {
                      nextRef.current.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest",
                      });
                    }
                    return nextHighlightedUser;
                  });
                }
                else if (isTypingTrend && trends && highlightedTrend > 0) {
                  setPrevHighlightedTrend(highlightedTrend);
                  setHighlightedTrend((prevhighlightedTrend) => {
                    const nextHighlightedTrend = prevhighlightedTrend - 1;
                    const nextRef = trendRefs.current[nextHighlightedTrend];
                    if (nextRef && nextRef.current) {
                      nextRef.current.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest",
                      });
                    }
                    return nextHighlightedTrend;
                  });                }
              } else if (e.key === "Tab") {
                // Split input into an array of words
                const words = input.split(" ");
                // Get the last word
                const lastWord = words.slice(-1)[0];
                // Check if the last word isn't just an @ or a #
                if (
                  (lastWord && lastWord.length > 1 && isTypingTrend) ||
                  isTypingUsername
                ) {
                  e.preventDefault();
                  if (isTypingUsername) {
                    selectUser(highlightedUser);
                  } else if (isTypingTrend) {
                    // This is a placeholder
                    selectTrend(possibleTrends[highlightedTrend]?.[0] ?? "");
                  }
                  // Tab key pressed
                  // Select the currently highlighted user
                }
              }
            }}
          />
        </div>
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
            className="CreatePostWizard-Icons flex justify-center"
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
