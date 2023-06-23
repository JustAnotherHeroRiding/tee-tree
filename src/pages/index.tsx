import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Image from "next/image";
import { api } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { useState } from "react";
import toast from "react-hot-toast";
import { PageLayout } from "~/components/layout";
import { PostView } from "~/components/postview";
import Link from "next/link";
import TextareaAutosize from "react-textarea-autosize";
import { PaginatedFeed } from "~/components/paginationtest";

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

  return (
    <div className="relative flex gap-3">
      <Image
        className="h-14 w-14 rounded-full"
        src={user.profileImageUrl}
        alt="Profile Image"
        width={56}
        height={56}
        priority={true}
      />
      <h1 className="absolute -top-4 right-0 rounded-3xl">{textLength}/280</h1>
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
  );
};

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong.</div>;
  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};


const FollowingFeed = () => {
  const { data: followingData } = api.follow.getFollowingCurrentUser.useQuery();

  const { data, isLoading: postsLoading } = api.posts.getPostsFromFollowedUsers.useQuery(
    { followers: followingData ?? [] },
    {
      enabled: !!followingData,
      onError: (error) => {
        console.error('Error in getPostsFromFollowedUsers query:', error);
      },
      onSuccess: (data) => {
        if (!data) {
          console.error('Data is undefined in getPostsFromFollowedUsers query');
        }
      },
    }
  );
  

  if (postsLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong.</div>;

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};


const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn, user } = useUser();
  const [homePage, setHomePage] = useState(true);

  const username = user?.username;

  // Start fetching asap
  api.posts.getAll.useQuery();

  // Return empty div if BOTH are not loaded, since user tends to load faster
  if (!userLoaded) return <LoadingPage />;

  if (isSignedIn && !username) return <div></div>;

  return (
    <PageLayout>
      <div className="flex border-b border-slate-400 p-4">
        {!isSignedIn && (
          <div className="flex w-full flex-col">
            <SignInButton>
              <div className="ml-auto flex w-fit cursor-pointer rounded-3xl border border-slate-400 px-4 py-2 hover:bg-slate-700">
                <h1>Sign In</h1>
              </div>
            </SignInButton>
          </div>
        )}
        {isSignedIn && (
          <div className="flex w-full flex-col">
            <div className="mb-4 flex flex-row border-slate-400 pb-4">
              <Link
                href={username ? `@${username}` : "/"}
                className="flex w-fit cursor-pointer rounded-3xl border border-slate-400 px-4 py-2
               outline-none hover:bg-slate-700"
              >
                Profile
              </Link>
              <SignOutButton>
                <div className="ml-auto flex w-fit cursor-pointer rounded-3xl border border-slate-400 px-4 py-2 hover:bg-slate-700">
                  <h1>Sign Out</h1>
                </div>
              </SignOutButton>
            </div>
            {user && (
              <div className="mb-8 flex flex-row justify-between border-b border-slate-400">
                <div className="flex w-1/2 flex-col items-center justify-center">
                  <button
                    onClick={() => setHomePage(true)}
                    className={`mx-auto ${
                      homePage ? "text-white" : "text-slate-400"
                    }`}
                  >
                    Home Page
                  </button>
                  {homePage ? (
                    <hr className="selector-on-symbol"></hr>
                  ) : (
                    <hr className="mt-4"></hr>
                  )}
                </div>
                <div className="flex w-1/2 flex-col items-center justify-center">
                  <button
                    onClick={() => setHomePage(false)}
                    className={`mx-auto ${
                      !homePage ? "text-white" : "text-slate-400"
                    }`}
                  >
                    Following
                  </button>
                  {!homePage ? (
                    <hr className="selector-on-symbol"></hr>
                  ) : (
                    <hr className="mt-4"></hr>
                  )}
                </div>
              </div>
            )}

            <CreatePostWizard />
          </div>
        )}
      </div>
      {/* <Feed />  */}
      {homePage ?  <PaginatedFeed />  : <FollowingFeed />
      }
    </PageLayout>
  );
};

export default Home;
