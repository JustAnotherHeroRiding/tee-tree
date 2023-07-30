import { api } from "~/utils/api";
import { LoadingSpinner } from "./loading";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { useRouter } from "next/router";

export const SuggestedUsers = ({ limit = 3, sideBar = true }) => {
  const { data: suggestedUsers, isLoading } =
    api.follow.getNotFollowingCurrentUser.useQuery();

    const router = useRouter();

  const { data: followingData } = api.follow.getFollowingCurrentUser.useQuery();

  const { user: currentUser } = useUser();

  const [isFollowing, setIsFollowing] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    if (followingData) {
      const followingMap = followingData.reduce<{ [key: string]: boolean }>(
        (acc, user) => {
          acc[user.followed.followingId] = true;
          return acc;
        },
        {}
      );
      setIsFollowing(followingMap);
    }
  }, [followingData]);

  const { mutate } = api.profile.followUser.useMutation({
    onMutate: (variables) => {
      // Set the loading state for this user ID to true as the request starts
      setLoadingStates((prev) => ({
        ...prev,
        [variables.userToFollowId]: true,
      }));
    },
    onSuccess: (data, variables) => {
      console.log(`You are now following the user.`);

      // Create a copy of the 'isFollowing' and 'followerCount' states
      const newIsFollowing = { ...isFollowing };

      // Check if the current user is already following the user
      if (isFollowing[variables.userToFollowId]) {
        // If so, set 'isFollowing[userId]' to false to indicate that the current user has unfollowed the user
        newIsFollowing[variables.userToFollowId] = false;
        setIsFollowing(newIsFollowing);
      } else {
        // Otherwise, set 'isFollowing[userId]' to true to indicate that the current user is now following the user
        newIsFollowing[variables.userToFollowId] = true;
        setIsFollowing(newIsFollowing);
      }
      setLoadingStates((prev) => ({
        ...prev,
        [variables.userToFollowId]: false,
      }));
    },
    onError: (e, variables) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to Follow! Are you logged in?");
      }
      setLoadingStates((prev) => ({
        ...prev,
        [variables.userToFollowId]: false,
      }));
    },
  });

  if (!suggestedUsers) return <h1>You follow everyone!</h1>;

  const slicedUsers = suggestedUsers.slice(0, limit);

  return (
    <div className="flex flex-col">
      {isLoading && (
        <div className="mx-auto">
          <LoadingSpinner size={42} />
        </div>
      )}
      {slicedUsers.map((user) => (
        <div
          key={user.id}
          className="flex cursor-pointer flex-col px-4 py-2 hover:bg-gray-900"
          onClick={() => void router.push(`/@${user.username ?? ""}`)}
        >       
          <div className="flex flex-row items-center group">
          <Link href={`/@${user.username ?? ""}`}>
                    
            <Image
              src={user.profileImageUrl ?? ""}
              alt={`${user.profileImageUrl ?? ""}'s profile pic `}
              className="h-12 w-12 rounded-full  bg-black"
              width={64}
              height={64}
            />
            </Link>
            <div className="ml-4 flex flex-col group">
              <div className="flex justify-between">
              <Link href={`/@${user.username ?? ""}`} className="m-auto w-[120px] font-bold ">
                <span className="hover:underline">
                  {user.firstName} {user.lastName}
                </span>

              <p className="w-[200px]  truncate text-slate-300">
                @{user.username}
              </p>
                </Link>

                {currentUser?.id !== user?.id &&
                  user &&
                  (!loadingStates[user.id] ? (
                    <button
                      className={`ml-auto mt-auto rounded-3xl border border-slate-400 bg-slate-800
              px-4 py-2 transition-all duration-300 hover:bg-slate-900 hover:text-white `}
                      onClick={(event) => {
                        event.stopPropagation()
                        mutate({ userToFollowId: user.id })}}
                      disabled={loadingStates[user.id]}
                    >{`${
                      isFollowing[user.id] ? "Unfollow" : "Follow"
                    }`}</button>
                  ) : (
                    <div className="ml-auto flex items-center justify-center">
                      <LoadingSpinner size={32} />
                    </div>
                  ))}{" "}
              </div>
            </div>
          </div>
        </div>
        
      ))}
      {sideBar && (
        <Link
          href="/i/suggested"
          className="rounded-b-2xl px-4 py-2
      text-start text-Intone-300 hover:bg-gray-900"
        >
          Show More
        </Link>
      )}
    </div>
  );
};
