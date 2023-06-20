import Image from "next/image";
import { api, type RouterOutputs } from "~/utils/api";
import dayjs from "dayjs";
import {
  faComment,
  faHeart,
  faShare,
  faRetweet,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import relativeTime from "dayjs/plugin/relativeTime";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useUser } from "@clerk/nextjs";
import { LoadingSpinner } from "./loading";

dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

export const PostView = (props: PostWithUser) => {
  const { post, author } = props;

  const [liked, setLiked] = useState(false);

  const { user } = useUser();

  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  type Like = {
    authorId: string;
  };

  useEffect(() => {
    function authorLikedPost(authorId: string, likes: Like[]): boolean {
      return likes.some((like) => like.authorId === authorId);
    }
    if (user) {
      setLiked(authorLikedPost(user.id, post.likes));
    } else {
      setLiked(false);
    }
  }, [user, post.likes]);

  const [likes, setLikes] = useState(0);

  useEffect(() => {
    setLikes(post.likes.length);
  }, [post.likes]);

  const ctx = api.useContext();

  const { mutate, isLoading: isLiking } = api.posts.likePost.useMutation({
    onSuccess: () => {
      if (location.pathname === "/") {
        void ctx.posts.getAll.invalidate();
      } else if (location.pathname.startsWith("/post/")) {
        void ctx.posts.getById.invalidate();
      } else if (location.pathname.startsWith("/@")) {
        void ctx.posts.getPostsByUserId.invalidate();
      }
      console.log("Post Liked");
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to Like! Are you logged in?");
      }
    },
  });

  const { mutate: editPost, isLoading: isEditingPostUpdating } =
    api.posts.editPost.useMutation({
      onSuccess: () => {
        if (location.pathname === "/") {
          void ctx.posts.getAll.invalidate();
        } else if (location.pathname.startsWith("/post/")) {
          void ctx.posts.getById.invalidate();
        } else if (location.pathname.startsWith("/@")) {
          void ctx.posts.getPostsByUserId.invalidate();
        }

        console.log("Post Edited");
      },
      onError: (e) => {
        const errorMessage = e.data?.zodError?.fieldErrors.content;
        if (errorMessage && errorMessage[0]) {
          toast.error(errorMessage[0]);
        } else {
          toast.error("Failed to Like! Are you logged in?");
        }
      },
    });

  function handleSaveClick(newContent: string) {
    // Call the editPost mutation with the post id and the new content
    editPost({
      postId: post.id,
      content: newContent,
    });

    // Exit the editing mode
    setIsEditing(false);
  }

  const handleEditClick = () => {
    if (!isEditing) {
      setIsEditing(true);
    } else {
      handleSaveClick(textareaRef.current?.value as string);
    }
  };

  return (
    <div key={post.id} className="flex gap-3 border-b border-slate-400 p-4">
      <Image
        className="h-14 w-14 rounded-full"
        src={author.profilePicture}
        alt={`@${author.username}profile picture`}
        width={56}
        height={56}
      />
      <div className="flex flex-col ">
        <div className="flex gap-1 text-slate-300">
          <Link href={`/@${author.username}`}>
            <span className="hover:text-white">{`@${author.username}`}</span>
          </Link>
          <span className="font-thin">{` · ${dayjs(
            post.createdAt
          ).fromNow()}`}</span>
        </div>
        <Link
          className={`${
            !isEditing ? "hover:bg-slate-900" : ""
          } rounded-2xl px-2 py-1 `}
          href={`/post/${post.id}`}
          onClick={(event) => {
            if (isEditing) {
              event.preventDefault();
            }
          }}
        >
          {isEditing ? (
            <div className="relative">
              <button
                className="absolute right-4 top-4 rounded-3xl
          px-1 py-1 hover:bg-slate-700 hover:text-white
          "
                onClick={() => setIsEditing(false)}
              >
                <FontAwesomeIcon
                  className="h-6 w-6 rounded-3xl"
                  icon={faXmark}
                />
              </button>
              <textarea
                ref={textareaRef}
                className="h-fit w-full resize-none rounded-3xl border-slate-400 bg-slate-900 px-4 py-2 outline-none"
                defaultValue={post.content}
              />
            </div>
          ) : isEditingPostUpdating ? (
            <div className="mx-auto flex justify-center">
            <LoadingSpinner size={32} />
            </div>
          ) : (
            <span className="text-2xl">{post.content}</span>
          )}
          <br />
        </Link>
        <div className="flex flex-row gap-6 sm:gap-12 md:gap-16 lg:gap-20">
          <button
            disabled={isLiking}
            onClick={() => mutate({ postId: post.id })}
            className={`flex w-fit origin-center transform cursor-pointer flex-row items-center text-3xl transition-all duration-300 
          ${liked ? "text-red-600" : "hover:text-red-300"} whitespace-normal ${
              isLiking
                ? "scale-125 animate-pulse text-red-900"
                : "hover:scale-110"
            }`}
          >
            <FontAwesomeIcon icon={faHeart} className="mr-2 h-6 w-6" />{" "}
            <p>{likes}</p>
          </button>

          <button>
            {" "}
            <FontAwesomeIcon
              icon={faComment}
              className="post-button-fontAwesome"
            />{" "}
          </button>
          <button>
            {" "}
            <FontAwesomeIcon
              icon={faRetweet}
              className="post-button-fontAwesome"
            />{" "}
          </button>
          <button>
            {" "}
            <FontAwesomeIcon
              icon={faShare}
              className="post-button-fontAwesome"
            />{" "}
          </button>
          {user?.id === author.id && (
            <button
              onClick={handleEditClick}
              className="rounded-3xl border border-slate-400 px-4 py-1 hover:bg-slate-700"
            >
              {isEditing ? "Save" : "Edit"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
