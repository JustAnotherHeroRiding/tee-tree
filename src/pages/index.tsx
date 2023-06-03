import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";

import dayjs from 'dayjs'
import relativeTime from "dayjs/plugin/relativeTime"
import { LoadingPage } from "~/components/loading";
import { useState } from "react";

dayjs.extend(relativeTime);


const CreatePostWizard = () => {


  const { user } = useUser();
 
  const [input, setInput] = useState("");

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
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
      />
      <button onClick={() => mutate({content : input})}>Post</button>
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
          <span>{`@${author.username}`}</span>
          <span className="font-thin">{` · ${dayjs(post.createdAt).fromNow()}`}</span>
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

  const {isLoaded: userLoaded, isSignedIn} = useUser();

  // Start fetching asap
  api.posts.getAll.useQuery();

  // Return empty div if BOTH are not loaded, since user tends to load faster
  if (!userLoaded ) return <div></div>



  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex justify-center h-screen">
        <div className="w-full h-full border-x  md:max-w-2xl border-slate-400">
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
        </div>
      </main>
    </>
  );
};

export default Home;
