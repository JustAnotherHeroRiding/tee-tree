import { type GetStaticProps, type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import Image from "next/image";
import { LoadingSpinner } from "~/components/loading";
import { PageLayout } from "~/components/layout";
import { generateSsgHelper } from "~/server/helpers/ssgHelper";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeftLong } from '@fortawesome/free-solid-svg-icons'
import Link from "next/link";
import toast from "react-hot-toast";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import type { FollowerWithAuthor } from "~/server/api/routers/followers";


const ProfileFollowingPage: NextPage<{ username: string }> = ({ username }) => {

  const { data } = api.profile.getUserByUsername.useQuery({ username });
  const { user } = useUser();

  const [isFollowing, setIsFollowing] = useState(false);

  const [followers, setFollowers] = useState<FollowerWithAuthor[]>([]);
  const [shouldFetchFollowers, setShouldFetchFollowers] = useState(false);




  const { data: followersData } = api.follow.getFollowersById.useQuery(
    { followedUserId: data?.id },
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
    }
  }, [followersData]);

  // Check if the current user is following
  useEffect(() => {
    function isCurrentUserFollowing(currentUserId: string, followers: FollowerWithAuthor[]): boolean {
      return followers.some((follower) => follower.follower.followingId === currentUserId);
    }

    if (user && followers.length > 0) {
      setIsFollowing(isCurrentUserFollowing(user.id, followers));
    } else {
      setIsFollowing(false);
    }
  }, [user, followers]);

  if (!data) return <div>404</div>;



  const { mutate, isLoading: isFollowingLoading } = api.profile.followUser.useMutation({
    onSuccess: () => {
      console.log(`You are now following ${username}`);
      if (isFollowing) {
        setIsFollowing(false);
      } else {
        setIsFollowing(true);
      }
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to Follow! Are you logged in?")
      }
    }
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
          <div className="h-12 relative">
            <div className="flex items-center justify-between">
              <h1 className="mt-4 ml-16 text-2xl">@{username}</h1>
              <Link href={`/@${username}`} ><FontAwesomeIcon className="w-8 h-8 rounded-3xl
        px-2 py-1 absolute top-4 left-4 hover:bg-slate-900 hover:text-white
        transform transition-all duration-300 hover:scale-125" icon={faArrowLeftLong} /></Link>

            </div>
          </div>
          <div className="flex flex-row justify-between border-b border-slate-400">
            <div className="w-1/2 items-center flex flex-col justify-center my-6">
              <Link className="mx-auto" href={`/followers/@${username}`}>Followers</Link>
              <span className="w-16 h-1 rounded-3xl bg-blue-600"></span>
            </div>
            <div className="w-1/2 items-center flex flex-col justify-center">
              <Link className="" href={`/following/@${username}`}>Following</Link>
            </div>

          </div>
        </div>
        <div>
          {followers.map((follower) => (
            <div className="relative flex flex-row py-4 px-2" key={follower.follower.id}>
              <Image src={follower.author.profilePicture}
                alt={`${follower.author.username ?? ""}'s profile pic `}
                className="rounded-full border-2 border-black bg-black"
                width={64}
                height={64} />
              <Link href={`/@${follower.author.username}`}>              
              <h2 className="mb ml-4">@{follower.author.username}</h2>
              </Link>
              {follower.author.id !== user?.id && user &&
                (followers ?
                  (
                    <button className={`border rounded-3xl border-slate-400 px-4 py-2 transition-all duration-300
         hover:bg-slate-900 bg-slate-800 hover:text-white mt-4 mr-4 
         ${isFollowingLoading ? "animate-pulse text-blue-700 scale-110" : ""}`}
                      onClick={() => mutate({ userToFollowId: follower.author.id })}
                      disabled={isFollowingLoading}
                    >{`${isFollowing ? "Unfollow" : "Follow"}`}</button>
                  ) :
                  <div className="flex items-center justify-center mr-6 mt-6"><LoadingSpinner size={32} /></div>)}

            </div>
          ))
          }
        </div>
      </PageLayout>

    </>
  )
};


export const getStaticProps: GetStaticProps = async (context) => {
  const helpers = generateSsgHelper();

  const slug = context.params?.slug;

  if (typeof slug !== 'string') throw new Error('slug must be a string');

  const username = slug.replace("@", "");

  await helpers.profile.getUserByUsername.prefetch({ username })

  return {
    props: {
      trpcState: helpers.dehydrate(),
      username
    }
  }
};


export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: 'blocking'
  };
}

export default ProfileFollowingPage;

