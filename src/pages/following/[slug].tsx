import { type GetStaticProps, type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import Image from "next/image";
import { LoadingSpinner } from "~/components/ReusableElements/loading";
import { PageLayout } from "~/components/layout";
import { generateSsgHelper } from "~/server/helpers/ssgHelper";

import Link from "next/link";
import toast from "react-hot-toast";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect, useRef } from "react";
import type { FollowedWithAuthor } from "~/server/api/routers/followers";
import { FormkitArrowleft } from "~/components/ReusableElements/BackButton";

const ProfileFollowingPage: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery({ username });
  const { user } = useUser();

  const [isFollowing, setIsFollowing] = useState<{ [key: string]: boolean }>(
    {}
  );

  const [followers, setFollowers] = useState<FollowedWithAuthor[]>([]);
  const [followersByCurrentUser, setFollowersByCurrentUser] = useState<
    FollowedWithAuthor[]
  >([]);

  const [isLoadingFollowButton, setIsLoadingFollowButton] = useState(true);

  const [shouldFetchFollowers, setShouldFetchFollowers] = useState(false);

  const { data: followingData } = api.follow.getFollowingById.useQuery(
    { followingUserId: data?.id },
    { enabled: shouldFetchFollowers }
  );

  const { data: followingDataCurrentUser } =
    api.follow.getFollowingById.useQuery(
      { followingUserId: user?.id },
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
    if (followingData) {
      setFollowers(followingData);
      if (followingDataCurrentUser) {
        setFollowersByCurrentUser(followingDataCurrentUser);
      }
    }
  }, [followingData, followingDataCurrentUser]);

  function isCurrentUserFollowing(
    currentUserId: string,
    follower: FollowedWithAuthor[]
  ): boolean {
    return follower[0]?.followed.followerId === currentUserId;
  }

  const updatedIsFollowing = useRef<{ [key: string]: boolean }>({
    ...isFollowing,
  });

  useEffect(() => {
    if (user && followersByCurrentUser.length > 0) {
      const updatedIsFollowing = followersByCurrentUser.reduce(
        (acc, follower) => {
          acc[follower.followed.followingId] = isCurrentUserFollowing(user.id, [
            follower,
          ]);
          return acc;
        },
        {} as { [key: string]: boolean }
      );

      setIsFollowing(updatedIsFollowing);
      setIsLoadingFollowButton(false);
    } else {
      setIsFollowing({});
    }
  }, [user, followersByCurrentUser, isLoadingFollowButton]);

  useEffect(() => {
    const hasUpdates = Object.keys(updatedIsFollowing.current).some(
      (key) =>
        (isFollowing as { [key: string]: boolean })[key] !==
        updatedIsFollowing.current[key]
    );

    if (hasUpdates) {
      setIsFollowing(updatedIsFollowing.current);
    }
  }, [updatedIsFollowing, isFollowing]);

  if (!data) return <div>404</div>;

  const { mutate, isLoading: isFollowingLoading } =
    api.profile.followUser.useMutation({
      onSuccess: (_, variables) => {
        const userToFollowId = variables.userToFollowId;
        if (isFollowing[userToFollowId]) {
          setIsFollowing({ ...isFollowing, [userToFollowId]: false });
        } else {
          setIsFollowing({ ...isFollowing, [userToFollowId]: true });
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

  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>{`${username}'s followed users`}</title>
        <meta name="description" content={`Users that @${username} follows`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageLayout>
        <div className="">
          <div className="relative h-12">
            <div className="flex items-center justify-between">
              <h1 className="ml-20 mt-4 text-2xl">@{username}</h1>
              <Link href={`/@${username}`}>
                <FormkitArrowleft />
              </Link>
            </div>
          </div>
          <div className="my-8 flex flex-row justify-between border-b border-slate-400">
            <div className="flex w-1/2 flex-col items-center justify-center ">
              <Link className="mx-auto" href={`/followers/@${username}`}>
                Followers
              </Link>
              <hr className="mt-4"></hr>
            </div>
            <div className="flex w-1/2 flex-col items-center justify-center">
              <Link className="" href={`/following/@${username}`}>
                Following
              </Link>
              <span className="selector-on-symbol"></span>
            </div>
          </div>
        </div>
        <div>
          {followers.length === 0 && (
            <h1 className="text-center">
              This user is not following anybody :(
            </h1>
          )}
          {followers.map((follower) => (
            <div
              className="relative flex flex-row px-2 py-4"
              key={follower.followed.id}
            >
              <Image
                src={follower.author.profileImageUrl}
                alt={`${follower.author.username ?? ""}'s profile pic `}
                className="h-16 w-16 rounded-full border-2 border-black bg-black"
                width={64}
                height={64}
              />
              <Link href={`/@${follower.author.username}`}>
                <div className="ml-4 mr-auto flex flex-col">
                  <span className="font-bold hover:underline">
                    {follower.author.firstName} {follower.author.lastName}
                  </span>
                  <h2 className="text-slate-300">
                    @{follower.author.username}
                  </h2>
                </div>{" "}
              </Link>
              {follower.author.id !== user?.id &&
                user &&
                (!isLoadingFollowButton ? (
                  <button
                    className={`ml-auto mr-4 mt-4 rounded-3xl border border-slate-400 bg-slate-800
         px-4 py-2 transition-all duration-300 hover:bg-slate-900 hover:text-white `}
                    onClick={() =>
                      mutate({ userToFollowId: follower.author.id })
                    }
                    disabled={isFollowingLoading}
                  >{`${
                    isFollowing[follower.author.id] ? "Unfollow" : "Follow"
                  }`}</button>
                ) : (
                  <div className="ml-auto mr-6 mt-6 flex items-center justify-center">
                    <LoadingSpinner size={32} />
                  </div>
                ))}
            </div>
          ))}
        </div>
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

export default ProfileFollowingPage;
