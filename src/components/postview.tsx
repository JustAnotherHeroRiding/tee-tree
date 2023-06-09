
import Image from "next/image";
import { api, type RouterOutputs } from "~/utils/api";
import dayjs from 'dayjs'
import Link from "next/link";
import relativeTime from "dayjs/plugin/relativeTime"
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useUser } from "@clerk/nextjs";

dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs['posts']['getAll'][number];

export const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  
  const [liked, setLiked] = useState(false)

  const { user } = useUser();


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
  
  const [likes, setLikes] = useState(0)

  useEffect(() => {
    setLikes(post.likes.length)
  }, [post.likes])

  const ctx = api.useContext();



  const { mutate, isLoading: isLiking } = api.posts.likePost.useMutation({
    onSuccess: () => {
      if (location.pathname === '/') {
        void ctx.posts.getAll.invalidate();
      } else if (location.pathname.startsWith('/post/')) {
        void ctx.posts.getById.invalidate();
      } else if (location.pathname.startsWith('/@')) {
        void ctx.posts.getPostsByUserId.invalidate();
      }
      console.log("Post Liked");
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to Like! Please try again later.")
      }
    }
  });


  return (
    <div key={post.id}
      className="p-4 border-b border-slate-400 flex gap-3">
      <Image className="w-14 h-14 rounded-full"
        src={author.profilePicture}
        alt={`@${author.username}profile picture`}
        width={56}
        height={56}
      />
      <div className="flex flex-col ">
        <div className="flex text-slate-300 gap-1">
          <Link href={`/@${author.username}`}><span className="hover:text-white">{`@${author.username}`}</span></Link>
          <span className="font-thin">{` · ${dayjs(post.createdAt).fromNow()}`}</span>
        </div>
        <Link className="hover:bg-slate-900 px-2 rounded-2xl py-1" href={`/post/${post.id}`}>
          <span className="text-2xl">{post.content}</span>
          <br />
        </Link>
        <span
            onClick={() => mutate({postId: post.id})}
          className={`w-fit transform origin-center cursor-pointer text-3xl transition-all duration-300 
          ${liked ? "text-red-600" : "hover:text-red-300"
            } whitespace-normal ${isLiking ? "animate-pulse text-red-900 scale-125" : "hover:scale-110"}`}
        >
          ♥ {likes}
        </span>

      </div>
    </div>

  )
}