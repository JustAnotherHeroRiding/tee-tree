import { type GetStaticProps, type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import Image from "next/image";
import { LoadingSpinner } from "~/components/loading";
import { PageLayout } from "~/components/layout";
import { generateSsgHelper } from "~/server/helpers/ssgHelper";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeftLong, faXmark } from '@fortawesome/free-solid-svg-icons'
import Link from "next/link";
import toast from "react-hot-toast";
import { UserProfile, useUser } from "@clerk/nextjs";
import { useState, useEffect, useRef } from "react";
import type { FollowerWithAuthor } from "~/server/api/routers/followers";
import { InfiniteScrollProfileFeed } from "~/components/infiniteScrollProfileFeed";

/* const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.posts.getPostsByUserId.useQuery({ userId: props.userId });

  if (isLoading) return <LoadingPage />

  if (!data || data.length === 0) return <div className="justify-center items-center flex border m-6 px-4 py-2 rounded-2xl">
    <h1 className=" font-bold text-2xl">User has not posted yet. </h1>
    </div>;

  return <div className="flex flex-col">
    {data.map((fullPost) => (
      <PostView {...fullPost} key={fullPost.post.id} />
    ))
    }
  </div>

}
 */



const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery({ username });

  const { user } = useUser();

  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState<FollowerWithAuthor[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [shouldFetchFollowers, setShouldFetchFollowers] = useState(false);

  const [postsCount, setPostsCount] = useState(0);


  const [feedSelector] = useState<string>("posts");


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
    function isCurrentUserFollowing(currentUserId: string, followers: FollowerWithAuthor[]): boolean {
      return followers.some((follower) => follower.follower.followerId === currentUserId);
    }

    if (user && followers.length > 0) {
      setIsFollowing(isCurrentUserFollowing(user.id, followers));
    } else {
      setIsFollowing(false);
    }
  }, [user, followers]);


  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
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
      <div className="flex sticky top-0 z-[10]  items-center justify-between backdrop-blur-md pb-2">
            <Link href={"/"} ><FontAwesomeIcon className="w-8 h-8 rounded-3xl
        px-2 py-1 absolute top-4 left-4 hover:bg-slate-900 hover:text-white
        transform transition-all duration-300 hover:scale-125" icon={faArrowLeftLong} /></Link>

<div className="flex flex-col mr-auto ml-16 mt-2">
          <h2 className="text-xl font-semibold">{username}</h2>
          <p>{`${postsCount} Posts`}</p>
          </div>

            {data.id !== user?.id && user &&
              (followersData ?
                (
                  <button className={`border rounded-3xl border-slate-400 px-4 py-1 transition-all duration-300
         hover:bg-slate-900 bg-slate-800 hover:text-white mt-4 mr-4 
         ${isFollowingLoading ? "animate-pulse text-blue-700 scale-110" : ""}`}
                    onClick={() => mutate({ userToFollowId: data.id })}
                    disabled={isFollowingLoading}
                  >{`${isFollowing ? "Unfollow" : "Follow"}`}</button>
                ) :
                <div className="flex items-center justify-center mr-6 mt-6"><LoadingSpinner size={32} /></div>)}

          </div>
        

        <div className=" bg-slate-600 h-36 relative">
          
        <div
  className={`modalparent transition-transform duration-300 ease-in-out transform ${
    showForm ? 'scale-100 opacity-100 visible' : 'scale-0 opacity-0 invisible'
  }`}>
            <div ref={modalRef} className="mx-auto  w-full py-4 modal bg-black
        border border-indigo-200 rounded-3xl gray-thin-scrollbar overflow-y-auto">
              <div className="fixed top-0 flex flex-row w-full">
                <h1 className='ml-16 text-2xl mt-4'>Edit profile</h1>
                <button className="absolute top-4 left-4 rounded-3xl
          px-1 py-1 hover:bg-slate-900 hover:text-white
          " onClick={() => setShowForm(!showForm)}>
                  <FontAwesomeIcon className="w-6 h-6 rounded-3xl" icon={faXmark} />
                </button>
              </div>
              <div className="mt-12 flex justify-center items-center">
                {user ? (
                  <UserProfile appearance={{
                  elements: {
                    card: 'min-w-[300px] lg:max-w-[750px]',
                    scrollBox: "",
                    navbarMobileMenuButton: '',
                    headerTitle: '',
                    headerSubtitle: '',
                    profileSectionTitleText: ''
                    
                  }
                }} />
                ): ""}
                
              </div>

            </div>
          </div>
          
          <Image src={data.profilePicture}
            alt={`${data.username ?? ""}'s profile pic `}
            className="-mb-[64px] h-32 w-32 absolute bottom-0 left-0 ml-4 rounded-full border-2 border-black bg-black"
            width={128}
            height={128} />


        </div>
        <div className="h-[64px]"></div>
        <div className="flex flex-row items-center justify-between">
          <h1 className="p-4 text-2xl font-bold">{`@${data.username ?? ""}`}</h1>
          {data.id === user?.id && user && (
            <button onClick={() => setShowForm(!showForm)} className="border rounded-3xl hover:bg-slate-600 mr-2
           border-slate-400 px-4 py-2">Edit Profile</button>
          )}
        </div>
        {followersData ? (
          <div className="flex flex-row">
            <Link href={username ? `followers/${username}` : "/"}>
              <div className="flex flex-row items-center ml-4 mb-4 text-slate-300 hover:text-white">
              <h1>Followers</h1>
               <h1 className="text-bold text-2xl ml-2">{followerCount}</h1>
            </div></Link>
            <Link href={username ? `following/@${username}` : "/"}>
              <div className="flex flex-row items-center ml-4 mb-4 text-slate-300 hover:text-white">
              <h1>Following</h1>
              <h1 className="text-bold text-2xl ml-2">{followingCount}</h1>
            </div></Link>
          </div>
        ) :
          <div className="flex items-center justify-center"><LoadingSpinner size={32} /></div>
        }
        <div className="border-b border-slate-400 w-full"></div>
        <div className="mb-8 flex flex-row justify-between border-b border-slate-400 mt-6">
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
              </div>
        <InfiniteScrollProfileFeed userId={data.id} username={data.username ?? ""} />
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
