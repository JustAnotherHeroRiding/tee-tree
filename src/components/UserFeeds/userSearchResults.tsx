import { api } from "~/utils/api";
import { LoadingSpinner } from "../ReusableElements/loading";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState, useContext } from "react";
import { UserContext } from "../Context/UserContext";
import toast from "react-hot-toast";

export const UserSearchResults = (props: { query: string  }) => {
  const { user } = useUser();
  const { userList, isLoading } = useContext(UserContext);

  const { data: threeUsers, isLoading: areUsersLoading } =
    api.profile.get3UsersSearch.useQuery({ query: props.query });

    const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});

  const { data: followingData } = api.follow.getFollowingCurrentUser.useQuery();

  const [isFollowing, setIsFollowing] = useState<{ [key: string]: boolean }>(
    {}
  );

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
      setLoadingStates(prev => ({ ...prev, [variables.userToFollowId]: true }));
    },
    onSuccess: (data, variables) => {
      console.log(`You are now following the user.`);
  
      // Create a copy of the 'isFollowing' states
      const newIsFollowing = { ...isFollowing };
      if (isFollowing[variables.userToFollowId]) {
        // If so, set 'isFollowing[userId]' to false to indicate that the current user has unfollowed the user
        newIsFollowing[variables.userToFollowId] = false;
        setIsFollowing(newIsFollowing);
      } else {
        // Otherwise, set 'isFollowing[userId]' to true to indicate that the current user is now following the user
        newIsFollowing[variables.userToFollowId] = true;
        setIsFollowing(newIsFollowing);
      }
        
      // Set the loading state for this user ID to false as the request finished successfully
      setLoadingStates(prev => ({ ...prev, [variables.userToFollowId]: false }));
        
      return data;
    },
    onError: (e, variables) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to Follow! Are you logged in?");
      }
    
      // Set the loading state for this user ID to false as the request ended with an error
      setLoadingStates(prev => ({ ...prev, [variables.userToFollowId]: false }));
    },
  })
  

  if (!userList) {
    console.log("No users");
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!threeUsers || threeUsers.length === 0)
    return <h1 className="text-center">No Users Found</h1>;


  return (
        <div className="flex flex-col">
        {areUsersLoading && (
          <div className="mx-auto">
            <LoadingSpinner size={42} />
          </div>
        )}
        {threeUsers.map((userResult) => (
          <div className="relative flex flex-row px-2 py-4" key={userResult.id}>
            <Image
              src={userResult.profilePicture}
              alt={`${userResult.username ?? ""}'s profile pic `}
              className="rounded-full border-2 border-black bg-black"
              width={64}
              height={64}
            />
            <Link href={`/@${userResult.username ?? ""}`} className="">
              {userResult.firstName && userResult.lastName && (
                <p className="ml-4 font-bold">{`${userResult.firstName}  ${userResult.lastName}`}</p>
              )}
              <p className="mb ml-4 text-slate-300 hover:underline">@{userResult.username}</p>
            </Link>
            {userResult.id !== user?.id &&
              user &&
              (!loadingStates[userResult.id] ? (
                <button
                  className={`ml-auto mr-4 mt-4 rounded-3xl border border-slate-400 bg-slate-800
      px-4 py-2 transition-all duration-300 hover:bg-slate-900 hover:text-white `}
                  onClick={() => mutate({ userToFollowId: userResult.id })}
                  disabled={loadingStates[userResult.id]}
                >{`${
                  isFollowing[userResult.id] ? "Unfollow" : "Follow"
                }`}</button>
              ) : (
                <div className="ml-auto mr-6 mt-6 flex items-center justify-center">
                  <LoadingSpinner size={32} />
                </div>
              ))}
          </div>
        ))}
      </div>
  );
};
