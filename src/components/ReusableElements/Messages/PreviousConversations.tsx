import { useContext, useState, useEffect } from "react";
import { UserContext } from "~/components/Context/UserContext";
import { LoadingSpinner } from "../loading";
import Image from "next/image";
import Link from "next/link";
import { UserHoverCard } from "../Users/UserHover";
import { type User } from "../CreatePostWizard";
import { useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";
import toast from "react-hot-toast";

type PreviousUsersProps = {
  uniqueUserIds: Set<string>;
};

export const PreviousUsers: React.FC<PreviousUsersProps> = ({
  uniqueUserIds,
}) => {
  const { userList, isLoading: isLoadingUserList } = useContext(UserContext);
  const { user: currentUser } = useUser();

  const arrayUniqueUserIds = Array.from(uniqueUserIds);


  const [
    fetchMentionedUsersFollowingData,
    setFetchMentionedUsersFollowingData,
  ] = useState(false);

  const { data: followingData } = api.follow.getFollowingCurrentUser.useQuery();



  const { data: followersDataMentionedUsers } =
    api.follow.getFollowersCountByIds.useQuery(
      { mentionedUserIds: arrayUniqueUserIds},
      { enabled: fetchMentionedUsersFollowingData }
    );
  const { data: followingDataMentionedUsers } =
    api.follow.getFollowingCountByIds.useQuery(
      { mentionedUserIds: arrayUniqueUserIds },
      {
        enabled: fetchMentionedUsersFollowingData,
      }
    );

  const [isFollowing, setIsFollowing] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [followerCount, setFollowerCount] = useState<{ [key: string]: number }>(
    {}
  );
  const [followingCount, setFollowingCount] = useState<{
    [key: string]: number;
  }>({});

  useEffect(() => {
    if (arrayUniqueUserIds.length > 0) {
      setFetchMentionedUsersFollowingData(true);
    }
  }, [arrayUniqueUserIds]);

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

  useEffect(() => {
    if (followersDataMentionedUsers && followingDataMentionedUsers) {
      setFollowerCount(followersDataMentionedUsers);
      setFollowingCount(followingDataMentionedUsers);
    }
  }, [followersDataMentionedUsers, followingDataMentionedUsers]);

  const { mutate, isLoading: isFollowingLoading } =
    api.profile.followUser.useMutation({
      onSuccess: (data, variables) => {
        console.log(`You are now following the user.`);

        // Create a copy of the 'isFollowing' and 'followerCount' states
        const newIsFollowing = { ...isFollowing };
        const newFollowerCount = { ...followerCount };

        // Check if the current user is already following the user
        if (isFollowing[variables.userToFollowId]) {
          // If so, set 'isFollowing[userId]' to false to indicate that the current user has unfollowed the user
          newIsFollowing[variables.userToFollowId] = false;
          setIsFollowing(newIsFollowing);

          // Decrement the follower count for this user
          if (newFollowerCount[variables.userToFollowId]) {
            newFollowerCount[variables.userToFollowId] -= 1;
          } else {
            newFollowerCount[variables.userToFollowId] = 0; // assuming when not found, the followerCount should be 0
          }
        } else {
          // Otherwise, set 'isFollowing[userId]' to true to indicate that the current user is now following the user
          newIsFollowing[variables.userToFollowId] = true;
          setIsFollowing(newIsFollowing);

          // Increment the follower count for this user
          newFollowerCount[variables.userToFollowId] =
            (newFollowerCount[variables.userToFollowId] || 0) + 1;
        }

        // Update the 'followerCount' state
        setFollowerCount(newFollowerCount);
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

  const filteredUsers = userList.filter((user) => uniqueUserIds.has(user.id));

  if (isLoadingUserList) {
    return <LoadingSpinner />;
  }

  return (
    <div className="mt-8 flex flex-col relative">
      {filteredUsers.map((user) => (
        <Link
          href={`/messages/${user.id}`}
          key={user.id}
          className="p-4 hover:bg-Intone-400"
        >
          <div className="flex flex-row">
            <Image
              className="mr-6 h-12 w-12 rounded-3xl"
              alt={`${user.username ?? ""}'s profile picture`}
              src={user.profileImageUrl}
              width={48}
              height={48}
            />
            <div className="flex flex-col">
              <div className="group inline-block">
                <Link className="text-slate-300" href={`/@${user.username ?? ""}`}>
                  @
                  <span className="hover:text-white hover:underline">{`${
                    user.username ?? ""
                  }`}</span>
                </Link>
                <UserHoverCard
                  user={currentUser as User}
                  userList={userList}
                  mentionedUser={user}
                  username={user.username ?? ""}
                  isFollowingLoading={isFollowingLoading}
                  isFollowing={isFollowing}
                  followingData={followingData}
                  mutate={mutate}
                  followingCount={followingCount}
                  followerCount={followerCount}
                  location="previousUsers"
                />
              </div>
              <span className="whitespace-normal">
                {user.firstName} {user.lastName}
              </span>
            </div>
          </div>{" "}
        </Link>
      ))}
    </div>
  );
};
