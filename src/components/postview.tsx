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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AdvancedImage, lazyload } from "@cloudinary/react";
import { Cloudinary } from "@cloudinary/url-gen";
// Import required actions and qualifiers.
import React from "react";

dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

const PostViewComponent = (props: PostWithUser) => {

  const url = `https://api.cloudinary.com/v1_1/de5zmknvp/image/destroy`;

  const { post, author } = props;
  const cld = new Cloudinary({ cloud: { cloudName: "de5zmknvp" } });

  const [liked, setLiked] = useState(false);

  const { user } = useUser();

  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const modalDeletePostRef = useRef<HTMLDivElement>(null);

  const [showMediaFullScreen, setShowMediaFullScreen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalDeletePostRef.current &&
        !modalDeletePostRef.current.contains(event.target as Node)
      ) {
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

  const modalMediaFullRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalMediaFullRef.current &&
        !modalMediaFullRef.current.contains(event.target as Node)
      ) {
        setShowMediaFullScreen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowMediaFullScreen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [modalMediaFullRef]);

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
        setShowDeleteModal(false);
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

    const { mutate: deleteMediaPost, isLoading: isDeletingMediaPost } =
    api.posts.deleteMediaPost.useMutation({
      onSuccess: () => {
        if (location.pathname === "/") {
          void ctx.posts.infiniteScrollAllPosts.invalidate();
        } else if (location.pathname.startsWith("/post/")) {
          void ctx.posts.getById.invalidate();
        } else if (location.pathname.startsWith("/@")) {
          void ctx.posts.getPostsByUserId.invalidate();
        }

        console.log("Post Image Deleted");
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
    <div
      key={post.id}
      className="flex gap-3 border-b border-slate-400 p-4 phone:relative"
    >
      <Image
        className="h-14 w-14 rounded-full phone:absolute phone:bottom-2 phone:right-2 phone:h-10 phone:w-10"
        src={author.profilePicture}
        alt={`@${author.username}profile picture`}
        width={56}
        height={56}
      />
      <div className="flex w-full flex-col">
        <div className="flex gap-1 text-slate-300">
          <Link href={`/@${author.username}`}>
            <span className="hover:text-white hover:underline">{`@${author.username}`}</span>
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
                rounded-3xl border-slate-400 bg-slate-900 pb-2 pl-4 pr-8 pt-4 outline-none"
                defaultValue={post.content}
                onChange={handleTextareaChange}
              />
            </div>
          ) : isEditingPostUpdating ? (
            <div className="mx-auto flex justify-center">
              <LoadingSpinner size={32} />
            </div>
          ) : (
            <span className="text-2xl sm:whitespace-pre-wrap">
              {post.content}
            </span>
          )}
          <br />
        </Link>
        {post.imageUrl && (
          <div className="mx-auto my-4 w-full">
            <div
              className="relative flex h-[400px] w-auto cursor-pointer justify-center border-slate-200"
              onClick={() => setShowMediaFullScreen(true)}
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
                cldImg={cld.image(post.imageUrl)}
                /* plugins={[
                  lazyload({
                    rootMargin: "10px 20px 10px 30px",
                    threshold: 0.25,
                  }),
                ]} */
              />
            </div>
            {isEditing && <button className="flex ml-auto rounded-3xl border
             border-slate-400 px-4 py-1 mt-2 hover:bg-slate-700">Delete Image</button>}          
             </div>
        )}
        {post.gifUrl && (
          <div className="mx-auto my-4 w-full">
            <div
              className="relative flex h-[400px] w-auto cursor-pointer justify-center border-slate-200"
              onClick={() => setShowMediaFullScreen(true)}
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
                cldImg={cld.image(post.gifUrl)}
              />
            </div>
            {isEditing && <button className="flex ml-auto rounded-3xl border
             border-slate-400 px-4 py-1 mt-2 hover:bg-slate-700">Delete Gif</button>}
          </div>
        )}

        {showMediaFullScreen && (
          <div className="modalparent">
            <div
              ref={modalMediaFullRef}
              className="modal relative flex w-fit items-center 
            justify-center rounded-xl border border-slate-400 bg-black p-4"
            >
              <FontAwesomeIcon
                icon={faXmark}
                className="absolute right-12 top-6 h-7 w-7 cursor-pointer rounded-3xl bg-black px-1"
                onClick={() => setShowMediaFullScreen(false)}
              />
              {post.gifUrl && (
                <AdvancedImage
                  style={{
                    maxWidth: "70vw",
                    maxHeight: "65vh",
                    borderWidth: "1px",
                    borderColor: "rgb(226 232 240 / var(--tw-border-opacity))",
                    borderRadius: "0.375rem",
                    borderStyle: "solid",
                    overflow: "clip",
                    twBorderOpacity: "1",
                  }}
                  cldImg={cld.image(post.gifUrl)}
                />
              )}
              {post.imageUrl && (
                <AdvancedImage
                  style={{
                    objectFit: "fill",
                    maxWidth: "70vw",
                    maxHeight: "65vh",
                    borderWidth: "1px",
                    borderColor: "rgb(226 232 240 / var(--tw-border-opacity))",
                    borderRadius: "0.375rem",
                    borderStyle: "solid",
                    overflow: "clip",
                    twBorderOpacity: "1",
                  }}
                  cldImg={cld.image(post.imageUrl)}
                />
              )}
            </div>
          </div>
        )}

        <div
          className={`flex flex-row ${
            user?.id === author.id
              ? "gap-2 sm:gap-12 md:gap-16"
              : "gap-2 sm:gap-12 md:gap-16"
          } `}
        >
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
              <button
                data-tooltip-id="editPost-tooltip"
                data-tooltip-content="Edit Post"
                onClick={handleEditClick}
                className="rounded-3xl border border-slate-400 px-4 py-1 hover:bg-slate-700"
              >
                {isEditing ? "Save" : "Edit"}
              </button>
              <Tooltip
                place="bottom"
                style={{
                  borderRadius: "24px",
                  backgroundColor: "rgb(51 65 85)",
                }}
                id="editPost-tooltip"
              />
              {!isDeletingPost ? (
                <>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    data-tooltip-id="delete-tooltip"
                    data-tooltip-content="Delete"
                    className="text-red-500 hover:text-red-700"
                  >
                    <FontAwesomeIcon className="h-6 w-6" icon={faXmark} />
                  </button>
                  <Tooltip
                    place="bottom"
                    style={{
                      borderRadius: "24px",
                      backgroundColor: "rgb(51 65 85)",
                    }}
                    id="delete-tooltip"
                  />
                  {showDeleteModal && (
                    <div
                      className={`modalparent transform transition-transform duration-300 ease-in-out ${
                        showDeleteModal
                          ? "visible scale-100 opacity-100"
                          : "invisible scale-0 opacity-0"
                      }`}
                    >
                      <div
                        ref={modalDeletePostRef}
                        className="w-90 modalDeletePost mx-auto flex h-32 flex-col
        rounded-3xl border border-indigo-200 bg-black p-4"
                      >
                        <h1>Are you sure you want to delete this post?</h1>
                        <div className="mt-auto flex flex-row justify-between">
                          <button
                            className="rounded-3xl bg-red-700 px-2 py-1 hover:bg-orange-600 hover:text-black"
                            onClick={() => deletePost({ postId: post.id })}
                          >
                            Delete
                          </button>
                          <button
                            className="rounded-3xl border px-2 py-1 hover:text-slate-400"
                            onClick={() => setShowDeleteModal(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <LoadingSpinner />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

PostViewComponent.displayName = "PostView";

export const PostView = React.memo(PostViewComponent);
