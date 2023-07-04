import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import { api } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { LoadingPage } from "~/components/loading";
import { PageLayout } from "~/components/layout";
import Link from "next/link";
import { InfiniteScrollFeed } from "~/components/infinitescroll";
import { useHomePage } from "~/components/HomePageContext";
import { InfiniteScrollFollowingFeed } from "~/components/infiniteScrollFollowerUsersFeed";
import { CreatePostWizard } from "~/components/CreatePostWizard";

dayjs.extend(relativeTime);

const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn, user } = useUser();
  //const [homePage, setHomePage] = useState(true);
  const { homePage, setHomePage } = useHomePage();

  api.follow.getFollowingCurrentUser.useQuery();


  const username = user?.username;

  // Start fetching asap
  // api.posts.getAll.useQuery();

  // Return empty div if BOTH are not loaded, since user tends to load faster
  if (!userLoaded) return <LoadingPage />;

  if (isSignedIn && !username) return <div></div>;

  return (
    <PageLayout>
      <div className="sticky top-0 z-50 backdrop-blur-lg">
      <div className="flex border-b border-slate-400 px-4 pt-4">
        {!isSignedIn && (
          <div className="flex w-full flex-col">
            <SignInButton>
              <div className="ml-auto mb-2 flex w-fit cursor-pointer rounded-3xl border border-slate-400 px-4 py-2 hover:bg-slate-700">
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
              <div className="flex flex-row justify-between">
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

          </div>
        )}
      </div>
      </div>
      {user && (
        <div className="flex w-full flex-col p-4 mt-4">
            <CreatePostWizard homePage={homePage} />
            </div>

      )}
      {homePage ? <InfiniteScrollFeed /> : <InfiniteScrollFollowingFeed />}
    </PageLayout>
  );
};

export default Home;
