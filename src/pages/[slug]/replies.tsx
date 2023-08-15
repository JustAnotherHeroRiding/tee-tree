import { type GetStaticProps, type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import Image from "next/image";
import { LoadingSpinner } from "~/components/ReusableElements/loading";
import { PageLayout } from "~/components/layout";
import { generateSsgHelper } from "~/server/helpers/ssgHelper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import toast from "react-hot-toast";
import { UserProfile, useUser } from "@clerk/nextjs";
import { useState, useEffect, useRef } from "react";
import type { FollowerWithAuthor } from "~/server/api/routers/followers";
import { InfiniteScrollProfileRepliesFeed } from "~/components/PostFeeds/infiniteScrollProfileRepliesFeed";
import { FormkitArrowleft } from "~/components/ReusableElements/BackButton";



const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery({ username });

  const { user } = useUser();

  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState<FollowerWithAuthor[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [shouldFetchFollowers, setShouldFetchFollowers] = useState(false);

  const [postsCount, setPostsCount] = useState(0);

  const [feedSelector] = useState<string>("replies");

  const [showForm, setShowForm] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  // Query followers using the enabled option
  const { data: followersData } = api.follow.getFollowersById.useQuery(
    { followedUserId: data?.id },
    { enabled: shouldFetchFollowers }
  );

  const { data: followingData } = api.follow.getFollowingById.useQuery(
    { followingUserId: data?.id },
    { enabled: shouldFetchFollowers }
  );

  // Fetch followers once data is available
  useEffect(() => {
    if (data) {
      setShouldFetchFollowers(true);
    }
  }, [data]);

  // Update followers state when followersData is available
  useEffect(() => {
    if (followersData) {
      setFollowers(followersData);
      setFollowerCount(followersData.length);
      setFollowingCount(followingData?.length || 0);
    }
  }, [followersData, followingData]);

  // Check if the current user is following
  useEffect(() => {
    function isCurrentUserFollowing(
      currentUserId: string,
      followers: FollowerWithAuthor[]
    ): boolean {
      return followers.some(
        (follower) => follower.follower.followerId === currentUserId
      );
    }

    if (user && followers.length > 0) {
      setIsFollowing(isCurrentUserFollowing(user.id, followers));
    } else {
      setIsFollowing(false);
    }
  }, [user, followers]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setShowForm(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowForm(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [modalRef]);

  const { data: fetchPostsCount } = api.posts.getPostsCountByUserId.useQuery({
    userId: data?.id,
  });

  useEffect(() => {
    if (fetchPostsCount) {
      setPostsCount(fetchPostsCount);
    }
  }, [fetchPostsCount]);

  if (!data) return <div>404</div>;

  const { mutate, isLoading: isFollowingLoading } =
    api.profile.followUser.useMutation({
      onSuccess: () => {
        console.log(`You are now following ${username}`);
        if (isFollowing) {
          setIsFollowing(false);
          setFollowerCount(followerCount - 1);
        } else {
          setFollowerCount(followerCount + 1);
          setIsFollowing(true);
        }
      },
      onError: (e) => {
        const errorMessage = e.data?.zodError?.fieldErrors.content;
        if (errorMessage && errorMessage[0]) {
          toast.error(errorMessage[0]);
        } else {
          toast.error("Failed to Follow! Are you logged in?");
        }
      },
    });

  return (
    <>
      <Head>
        <title>{data.username}</title>
        <meta name="description" content={`Profile page for ${username}`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageLayout>
        <div className="sticky top-0 z-50 flex items-center justify-between pb-2 backdrop-blur-sm">
          <Link href={`/@${username}`}>
            <FormkitArrowleft />
          </Link>
          <div className="ml-16 mr-auto mt-2 flex flex-col">
            <h2 className="text-xl font-semibold">{username}</h2>
            <p>{`${postsCount} Posts`}</p>
          </div>

          {data.id !== user?.id &&
            user &&
            (followersData ? (
              <button
                className={`mr-4 mt-4 rounded-3xl border border-slate-400 bg-slate-800 px-4
         py-1 transition-all duration-300 hover:bg-slate-900 hover:text-white 
         ${isFollowingLoading ? "scale-110 animate-pulse text-blue-700" : ""}`}
                onClick={() => mutate({ userToFollowId: data.id })}
                disabled={isFollowingLoading}
              >{`${isFollowing ? "Unfollow" : "Follow"}`}</button>
            ) : (
              <div className="mr-6 mt-6 flex items-center justify-center">
                <LoadingSpinner size={32} />
              </div>
            ))}
        </div>

        <div className=" relative h-36 bg-slate-600">
          <div
            className={`modalparent transform transition-transform duration-300 ease-in-out ${
              showForm
                ? "visible scale-100 opacity-100"
                : "invisible scale-0 opacity-0"
            }`}
          >
            <div
              ref={modalRef}
              className="modal  gray-thin-scrollbar mx-auto w-full overflow-y-auto
        rounded-3xl border border-indigo-200 bg-black py-4"
            >
              <div className="fixed top-0 flex w-full flex-row">
                <h1 className="ml-16 mt-4 text-2xl">Edit profile</h1>
                <button
                  className="absolute left-4 top-4 rounded-3xl
          px-1 py-1 hover:bg-slate-900 hover:text-white
          "
                  onClick={() => setShowForm(!showForm)}
                >
                  <FontAwesomeIcon
                    className="h-6 w-6 rounded-3xl"
                    icon={faXmark}
                  />
                </button>
              </div>
              <div className="mt-12 flex items-center justify-center">
                {user ? (
                  <UserProfile
                    appearance={{
                      elements: {
                        card: "min-w-[300px] lg:max-w-[750px]",
                        scrollBox: "",
                        navbarMobileMenuButton: "",
                        headerTitle: "",
                        headerSubtitle: "",
                        profileSectionTitleText: "",
                      },
                    }}
                  />
                ) : (
                  ""
                )}
              </div>
            </div>
          </div>
          <Image
            src={data.profileImageUrl}
            alt={`${data.username ?? ""}'s profile pic `}
            className="absolute bottom-0 left-0 -mb-[64px] ml-4 h-32 w-32 rounded-full border-2 border-black bg-black"
            width={128}
            height={128}
          />
        </div>
        <div className="h-[64px]"></div>
        <div className="flex flex-row items-center justify-between">
          <h1 className="p-4 text-2xl font-bold">{`@${
            data.username ?? ""
          }`}</h1>
          {data.id === user?.id && user && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="mr-2 rounded-3xl border border-slate-400
           px-4 py-2 hover:bg-slate-600"
            >
              Edit Profile
            </button>
          )}
        </div>
        {followersData ? (
          <div className="flex flex-row">
            <Link href={username ? `/followers/@${username}` : "/"}>
              <div className="mb-4 ml-4 flex flex-row items-center text-slate-300 hover:text-white">
                <h1>Followers</h1>
                <h1 className="text-bold ml-2 text-2xl">{followerCount}</h1>
              </div>
            </Link>
            <Link href={username ? `/following/@${username}` : "/"}>
              <div className="mb-4 ml-4 flex flex-row items-center text-slate-300 hover:text-white">
                <h1>Following</h1>
                <h1 className="text-bold ml-2 text-2xl">{followingCount}</h1>
              </div>
            </Link>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <LoadingSpinner size={32} />
          </div>
        )}
        <div className="w-full border-b border-slate-400"></div>
        <div className="mb-8 mt-6 flex flex-row justify-between border-b border-slate-400">
          <div className="flex w-1/2 flex-col items-center justify-center">
            <Link href={username ? `/@${username}` : "/"}>
              <button
                className={`mx-auto ${
                  feedSelector === "posts" ? "text-white" : "text-slate-400"
                }`}
              >
                Posts
              </button>
            </Link>
            {feedSelector === "posts" ? (
              <hr className="selector-on-symbol"></hr>
            ) : (
              <hr className="mt-4"></hr>
            )}
          </div>
          <div className="flex w-1/2 flex-col items-center justify-center">
            <Link href={username ? `/@${username}/likes` : "/"}>
              <button
                className={`mx-auto ${
                  feedSelector === "liked" ? "text-white" : "text-slate-400"
                }`}
              >
                Liked
              </button>
            </Link>
            {feedSelector === "liked" ? (
              <hr className="selector-on-symbol"></hr>
            ) : (
              <hr className="mt-4"></hr>
            )}
          </div>
          <div className="flex w-1/2 flex-col items-center justify-center">
            <Link href={username ? `/@${username}/replies` : "/"}>
              <button
                className={`mx-auto ${
                  feedSelector === "replies" ? "text-white" : "text-slate-400"
                }`}
              >
                Replies
              </button>
            </Link>
            {feedSelector === "replies" ? (
              <hr className="selector-on-symbol"></hr>
            ) : (
              <hr className="mt-4"></hr>
            )}
          </div>
        </div>
        <InfiniteScrollProfileRepliesFeed userId={data.id} />
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const helpers = generateSsgHelper();

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("slug must be a string");

  const username = slug.replace("@", "");

  await helpers.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};
export default ProfilePage;
