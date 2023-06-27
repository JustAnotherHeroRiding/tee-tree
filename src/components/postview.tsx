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
import { Tooltip } from "react-tooltip";
import TextareaAutosize from "react-textarea-autosize";

dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

export const PostView = (props: PostWithUser) => {
  const { post, author } = props;

  const [liked, setLiked] = useState(false);

  const { user } = useUser();

  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const modalDeletePostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalDeletePostRef.current && !modalDeletePostRef.current.contains(event.target as Node)) {
        setShowDeleteModal(false);
      }
    }
  
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowDeleteModal(false);
      }
    }
  
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [modalDeletePostRef]);

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
        void ctx.posts.infiniteScrollFollowerUsersPosts.invalidate();
        void ctx.posts.infiniteScrollAllPosts?.invalidate();
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
          void ctx.posts.infiniteScrollAllPosts.invalidate();
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
          toast.error("Failed to Edit! Are you the author?");
        }
      },
    });


    const { mutate: deletePost, isLoading: isDeletingPost } =
    api.posts.deletePost.useMutation({
      onSuccess: () => {
        setShowDeleteModal(false)
        if (location.pathname === "/") {
          void ctx.posts.infiniteScrollAllPosts.invalidate();
        } else if (location.pathname.startsWith("/post/")) {
          void ctx.posts.getById.invalidate();
        } else if (location.pathname.startsWith("/@")) {
          void ctx.posts.getPostsByUserId.invalidate();
        }

        console.log("Post Deleted");
      },
      onError: (e) => {
        const errorMessage = e.data?.zodError?.fieldErrors.content;
        if (errorMessage && errorMessage[0]) {
          toast.error(errorMessage[0]);
        } else {
          toast.error("Failed to Delete! Are you the author?");
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
      setTextLength(post.content.length);
    } else {
      handleSaveClick(textareaRef.current?.value as string);
    }
  };

  const [textLength, setTextLength] = useState(post.content.length);

  


  const handleTextareaChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setTextLength(event.target.textLength);
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
      <div className="flex flex-col w-full">
        <div className="flex gap-1 text-slate-300">
          <Link href={`/@${author.username}`}>
            <span className="hover:text-white">{`@${author.username}`}</span>
          </Link>
          <span className="font-thin">{` · ${dayjs(
            post.createdAt
          ).fromNow()}`}</span>
          {post.isEdited && (
            <>
              <p
                className="text-3xl text-slate-100"
                data-tooltip-id="edited-tooltip"
                data-tooltip-content="This post was edited."
              >
                *
              </p>
              <Tooltip
                id="edited-tooltip"
                place="bottom"
                style={{
                  borderRadius: "24px",
                  backgroundColor: "rgb(51 65 85)",
                }}
              />
            </>
          )}
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
                className="absolute right-0 top-4 rounded-3xl
          px-1 py-1 hover:bg-slate-700 hover:text-white
          "
                onClick={() => setIsEditing(false)}
              >
                <FontAwesomeIcon
                  className="h-6 w-6 rounded-3xl"
                  icon={faXmark}
                />
              </button>
              <h1 className="absolute right-8 top-0 rounded-3xl">
                {textLength}/280
              </h1>

              <TextareaAutosize
                maxLength={280}
                ref={textareaRef}
                className="h-full min-h-[80px] w-full resize-none 
                rounded-3xl border-slate-400 bg-slate-900 pl-4 pr-8 pb-2 pt-4 outline-none"
                defaultValue={post.content}
                onChange={handleTextareaChange}
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
        <div className={`flex flex-row ${user?.id === author.id ? "gap-2 sm:gap-12 md:gap-16" : 
        "gap-2 sm:gap-12 md:gap-16"} `}>
          <button
            data-tooltip-id="like-tooltip"
            data-tooltip-content="Like"
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
          <Tooltip
            place="bottom"
            style={{ borderRadius: "24px", backgroundColor: "rgb(51 65 85)" }}
            id="like-tooltip"
          />

          <button
            data-tooltip-id="comment-tooltip"
            data-tooltip-content="Comment"
          >
            {" "}
            <FontAwesomeIcon
              icon={faComment}
              className="post-button-fontAwesome"
            />{" "}
          </button>
          <Tooltip
            place="bottom"
            style={{ borderRadius: "24px", backgroundColor: "rgb(51 65 85)" }}
            id="comment-tooltip"
          />
          <button
            data-tooltip-id="retweet-tooltip"
            data-tooltip-content="Retweet"
          >
            {" "}
            <FontAwesomeIcon
              icon={faRetweet}
              className="post-button-fontAwesome"
            />{" "}
          </button>
          <Tooltip
            place="bottom"
            style={{ borderRadius: "24px", backgroundColor: "rgb(51 65 85)" }}
            id="retweet-tooltip"
          />
          <button data-tooltip-id="share-tooltip" data-tooltip-content="Share">
            {" "}
            <FontAwesomeIcon
              icon={faShare}
              className="post-button-fontAwesome"
            />{" "}
          </button>
          <Tooltip
            place="bottom"
            style={{ borderRadius: "24px", backgroundColor: "rgb(51 65 85)" }}
            id="share-tooltip"
          />
          {user?.id === author.id && (
            <>
            <button data-tooltip-id="editPost-tooltip" data-tooltip-content="Edit Post"
              onClick={handleEditClick}
              className="rounded-3xl border border-slate-400 px-4 py-1 hover:bg-slate-700"
            >
              {isEditing ? "Save" : "Edit"}
            </button>
            <Tooltip
            place="bottom"
            style={{ borderRadius: "24px", backgroundColor: "rgb(51 65 85)" }}
            id="editPost-tooltip"
          />
          {!isDeletingPost ? (
            <>
            <button onClick={() => setShowDeleteModal(true)}
             data-tooltip-id="delete-tooltip" data-tooltip-content="Delete"
             className="text-red-500 hover:text-red-700">
              <FontAwesomeIcon className="w-6 h-6" icon={faXmark}/></button>
              <Tooltip
            place="bottom"
            style={{ borderRadius: "24px", backgroundColor: "rgb(51 65 85)" }}
            id="delete-tooltip"
          />
          {showDeleteModal && (
            <div className={`modalparent transition-transform duration-300 ease-in-out transform ${
              showDeleteModal ? 'scale-100 opacity-100 visible' : 'scale-0 opacity-0 invisible'
            }`}>
            <div ref={modalDeletePostRef} className="mx-auto w-90 p-4 modalDeletePost bg-black h-32
        border border-indigo-200 rounded-3xl flex flex-col">
              <h1>Are you sure you want to delete this post?</h1>
              <div className="flex flex-row justify-between mt-auto">
              <button className="bg-red-700 rounded-3xl px-2 py-1 hover:bg-orange-600 hover:text-black" onClick={() => deletePost({postId: post.id})}>Delete</button>
              <button className="rounded-3xl px-2 py-1 border hover:text-slate-400"  onClick={() => setShowDeleteModal(false)}>Cancel</button>
              </div>

            </div>
          </div>
          )}
          
          </> 
          ) : (
            <LoadingSpinner/>
          )}
            
            </>
          )}
        </div>
      </div>
    </div>
  );
};
