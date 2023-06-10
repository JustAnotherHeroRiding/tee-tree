import { type GetStaticProps, type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { PageLayout } from "~/components/layout";
import { PostView } from "~/components/postview";
import { generateSsgHelper } from "~/server/helpers/ssgHelper";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeftLong } from '@fortawesome/free-solid-svg-icons'
import Link from "next/link";
import toast from "react-hot-toast";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import type { Follow } from "@prisma/client";


const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.posts.getPostsByUserId.useQuery({ userId: props.userId });

  if (isLoading) return <LoadingPage />

  if (!data || data.length === 0) return <div>User has not posted</div>;

  return <div className="flex flex-col">
    {data.map((fullPost) => (
      <PostView {...fullPost} key={fullPost.post.id} />
    ))
    }
  </div>

}




const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery({ username });

  const { user } = useUser();

  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState<Follow[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [shouldFetchFollowers, setShouldFetchFollowers] = useState(false);

  // Query followers using the enabled option
  const { data: followersData } = api.follow.getFollowersById.useQuery(
    { followedUserId: data?.id },
    { enabled: shouldFetchFollowers }
  );

  const { data: followingData  } = api.follow.getFollowingById.useQuery(
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
    function isCurrentUserFollowing(currentUserId: string, followers: Follow[]): boolean {
      return followers.some((follower) => follower.followerId === currentUserId);
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
        toast.error("Failed to Follow! Are you logged in?")
      }
    }
  });

  return (
    <>
      <Head>
        <title>{data.username}</title>
        <meta name="description" content={`Profile page for ${username}`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageLayout>

        <div className=" bg-slate-600 h-36 relative">
          <div className="flex items-center justify-between">
            <Link href={"/"} ><FontAwesomeIcon className="w-8 h-8 rounded-3xl
        px-2 py-1 absolute top-4 left-4 hover:bg-slate-900 hover:text-white
        transform transition-all duration-300 hover:scale-125" icon={faArrowLeftLong} /></Link>

            {data.id !== user?.id && user &&
              (followersData ?
                (
                  <button className={`border rounded-3xl border-slate-400 px-4 py-2 transition-all duration-300
         hover:bg-slate-900 bg-slate-800 hover:text-white mt-4 mr-4 
         ${isFollowingLoading ? "animate-pulse text-blue-700 scale-110" : ""}`}
                    onClick={() => mutate({ userToFollowId: data.id })}
                    disabled={isFollowingLoading}
                  >{`${isFollowing ? "Unfollow" : "Follow"}`}</button>
                ) :
                <div className="flex items-center justify-center mr-6 mt-6"><LoadingSpinner size={32} /></div>)}

          </div>
          <Image src={data.profilePicture}
            alt={`${data.username ?? ""}'s profile pic `}
            className="-mb-[64px] absolute bottom-0 left-0 ml-4 rounded-full border-2 border-black bg-black"
            width={128}
            height={128} />
          

        </div>
        <div className="h-[64px]"></div>
        <div className="p-4 text-2xl font-bold">
          {`@${data.username ?? ""}`}
        </div>
        {followersData && (
          <div className="flex flex-row">
            <div className="flex flex-row items-center ml-4 mb-4 text-slate-300">
              <h1>Followers</h1>
              <h1 className="text-bold text-2xl ml-2">{followerCount}</h1>
            </div>
            <div className="flex flex-row items-center ml-4 mb-4 text-slate-300">
            <h1>Following</h1>
            <h1 className="text-bold text-2xl ml-2">{followingCount}</h1>
          </div>
          </div>
          )}
        <div className="border-b border-slate-400 w-full"></div>
        <ProfileFeed userId={data.id} />
      </PageLayout>
    </>
  );
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
export default ProfilePage;
