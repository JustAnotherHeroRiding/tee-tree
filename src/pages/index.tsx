import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";

import dayjs from 'dayjs'
import relativeTime from "dayjs/plugin/relativeTime"
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { PageLayout } from "~/components/layout";

dayjs.extend(relativeTime);


const CreatePostWizard = () => {


  const { user } = useUser();

  const [input, setInput] = useState("");

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to Post! Please try again later.")
      }
    }
  });


  if (!user) return null;

  return <div className="flex gap-3 ">
    <Image className="w-14 h-14 rounded-full"
      src={user.profileImageUrl}
      alt="Profile Image"
      width={56}
      height={56}
    />
    <input placeholder="Type Some emojis"
      className="bg-transparent grow outline-none"
      type="text"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      disabled={isPosting}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          if (input !== "") {
            mutate({ content: input});
          }
        }
      }}
    />
    {input !== "" && !isPosting && (
      <button className="flex ml-auto px-4 mt-4 items-center rounded-3xl border border-slate-400 hover:bg-slate-700"
       onClick={() => mutate({ content: input })}
        >Post</button>
    )}

    {isPosting &&
      <div className="flex justify-center items-center">
        <LoadingSpinner size={20} />
      </div>
    }
  </div>
}

type PostWithUser = RouterOutputs['posts']['getAll'][number];

const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (

    <div key={post.id}
      className="p-4 border-b border-slate-400 flex gap-3">
      <Image className="w-14 h-14 rounded-full"
        src={author.profilePicture}
        alt={`@${author.username}profile picture`}
        width={56}
        height={56}
      />
      <div className="flex flex-col">
        <div className="flex text-slate-300 gap-1">
          <Link href={`/@${author.username}`}><span>{`@${author.username}`}</span></Link>
          <Link href={`/post/${post.id}`}><span className="font-thin">{` · ${dayjs(post.createdAt).fromNow()}`}</span></Link>
        </div>
        <span className="text-2xl">{post.content}</span>
      </div>
    </div>

  )
}

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading) return <LoadingPage />

  if (!data) return <div>Something went wrong.</div>
  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  )
}

const Home: NextPage = () => {

  const { isLoaded: userLoaded, isSignedIn } = useUser();

  // Start fetching asap
  api.posts.getAll.useQuery();

  // Return empty div if BOTH are not loaded, since user tends to load faster
  if (!userLoaded) return <div></div>



  return (
      <PageLayout>
                <div className="border-b border-slate-400 p-4 flex">
            {!isSignedIn && <div className="flex justify-center">
              <SignInButton />
            </div>}
            {isSignedIn &&
              <div className="flex flex-col w-full">
                <div className="flex ml-auto px-4 py-2 rounded-3xl border border-slate-400 hover:bg-slate-700 w-fit">
                  <SignOutButton />
                </div>
                <CreatePostWizard />
              </div>
            }
            </div>
          <Feed />
          </PageLayout>
  );
};

export default Home;
