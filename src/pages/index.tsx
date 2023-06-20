import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Image from "next/image";
import { api } from "~/utils/api";

import dayjs from 'dayjs'
import relativeTime from "dayjs/plugin/relativeTime"
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { useState } from "react";
import toast from "react-hot-toast";
import { PageLayout } from "~/components/layout";
import { PostView } from "~/components/postview";
import Link from "next/link";
import TextareaAutosize from "react-textarea-autosize";




dayjs.extend(relativeTime);


const CreatePostWizard = () => {


  const { user } = useUser();

  const [input, setInput] = useState("");

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      setTextLength(0);
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
  
  const [textLength, setTextLength] = useState(0);

  const handleTextareaChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setInput(event.target.value);
    setTextLength(event.target.textLength);
  };
  
  if (!user) return null;

  

  return <div className="flex gap-3 relative">
    <Image className="w-14 h-14 rounded-full"
      src={user.profileImageUrl}
      alt="Profile Image"
      width={56}
      height={56}
      priority={true}
    />
    <h1 className="absolute right-0 -top-4 rounded-3xl">
                {textLength}/280
              </h1>
    <TextareaAutosize placeholder="Type Some emojis"
      className="bg-transparent grow outline-none resize-none"
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
      <button className="flex ml-auto px-4 py-1 mt-4 mb-auto items-center rounded-3xl 
      border border-slate-400 hover:bg-slate-700"
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

  const { isLoaded: userLoaded, isSignedIn, user } = useUser();

  const username = user?.username;



  // Start fetching asap
  api.posts.getAll.useQuery();

  // Return empty div if BOTH are not loaded, since user tends to load faster
  if (!userLoaded) return <LoadingPage />

  if (isSignedIn && !username) return <div></div>



  return (
    <PageLayout>
      <div className="border-b border-slate-400 p-4 flex">
          
        {!isSignedIn && <div className="flex flex-col w-full">
          <SignInButton><div 
              className="flex cursor-pointer ml-auto px-4 py-2 rounded-3xl border border-slate-400 hover:bg-slate-700 w-fit">
                <h1>Sign In</h1>
              </div></SignInButton>
        </div>}
        {isSignedIn &&
          <div className="flex flex-col w-full">
            <div className="flex flex-row pb-4 border-b border-slate-400 mb-4">
              <Link href={username ? `@${username}` : "/"} 
              className="flex cursor-pointer px-4 py-2 rounded-3xl border outline-none border-slate-400
               hover:bg-slate-700 w-fit">Profile</Link>
            <SignOutButton>                
              <div 
              className="flex cursor-pointer ml-auto px-4 py-2 rounded-3xl border border-slate-400 hover:bg-slate-700 w-fit">
                <h1>Sign Out</h1>
              </div>
            </SignOutButton>
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
