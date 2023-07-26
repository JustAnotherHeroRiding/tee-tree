import { api } from "~/utils/api";
import { LoadingSpinner } from "../ReusableElements/loading";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState, useContext, useRef } from "react";
import { UserContext } from "../Context/UserContext";
import toast from "react-hot-toast";
import type { User as UserType } from "../ReusableElements/CreatePostWizard";

export const OnlyUserSearchResults = (props: {
  query: string;
  selector: string;
}) => {
  const { user: currentUser } = useUser();
  const { userList, isLoading: isLoadingUserList } = useContext(UserContext);
  const [page, setPage] = useState(0);

  const {
    data,
    fetchNextPage,
    isLoading,
    isFetchingNextPage: isFetchingNextPage,
  } = api.profile.infiniteScrollSearchResultsUsers.useInfiniteQuery(
    { limit: 4, query: props.query, selector: props.selector },
    {
      getNextPageParam: (lastPage) => {
        if ("nextCursor" in lastPage) {
          return lastPage.nextCursor;
        }
        // handle the case when lastPage is of type never[]
      },
    }
  );

  const toShow = data?.pages[page]?.users;

  const nextCursor = data?.pages[page]?.nextCursor;

  const lastUserElementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleFetchNextPage = async () => {
      await fetchNextPage();
      setPage((prev) => prev + 1);
    };

    if (!nextCursor) return; // No more pages to load

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void handleFetchNextPage();
        }
      },
      { threshold: 1 }
    );

    const currentLastUserElement = lastUserElementRef.current;

    if (lastUserElementRef.current) {
      observer.observe(lastUserElementRef.current);
      if (lastUserElementRef.current.getBoundingClientRect().bottom <= window.innerHeight) {
        void handleFetchNextPage();
      }
    }

    return () => {
      if (currentLastUserElement) {
        observer.unobserve(currentLastUserElement);
      }
    };
  }, [lastUserElementRef, nextCursor, fetchNextPage, props.selector]);

  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});

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
      setLoadingStates((prev) => ({
        ...prev,
        [variables.userToFollowId]: true,
      }));
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
      setLoadingStates((prev) => ({
        ...prev,
        [variables.userToFollowId]: false,
      }));

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
      setLoadingStates((prev) => ({
        ...prev,
        [variables.userToFollowId]: false,
      }));
    },
  });

  if (!userList) {
    console.log("No users");
  }

  if (isLoadingUserList) {
    return <LoadingSpinner />;
  }

  if (toShow?.length === 0)
    return <div className="mt-4 text-center">No users found.</div>;

  if (!data || data.pages[0] instanceof Array || !data.pages[0]?.users) {
    return <div className="text-center">No users found.</div>;
  }

  return (
    <div className="flex flex-col">
      {isLoading ||
        (isLoadingUserList && (
          <div className="mx-auto">
            <LoadingSpinner size={42} />
          </div>
        ))}
      {data?.pages?.map((page, pageIndex) =>
        page.users.map((user: UserType, userIndex: number) => {
          const isLastUser =
            pageIndex === data.pages.length - 1 &&
            userIndex === page.users.length - 1;

          return isLastUser ? (
            <div key={user.id} className="relative">
              <div className="flex flex-row px-2 py-4">
                <Image
                  src={user.profilePicture}
                  alt={`${user.username ?? ""}'s profile pic `}
                  className="rounded-full border-2 w-16 h-16 border-black bg-black"
                  width={64}
                  height={64}
                />
                <Link href={`/@${user.username ?? ""}`} className="">
                  {user.firstName && user.lastName && (
                    <p className="ml-4 font-bold">{`${user.firstName}  ${user.lastName}`}</p>
                  )}
                  <p className="mb ml-4 text-slate-300 hover:underline">
                    @{user.username}
                  </p>
                </Link>
                {currentUser &&
                  currentUser.id !== user.id &&
                  (!loadingStates[user.id] ? (
                    <button
                      className={`ml-auto mr-4 mt-4 rounded-3xl border border-slate-400 bg-slate-800
      px-4 py-2 transition-all duration-300 hover:bg-slate-900 hover:text-white `}
                      onClick={() => mutate({ userToFollowId: user.id })}
                      disabled={loadingStates[user.id]}
                    >{`${
                      isFollowing[user.id] ? "Unfollow" : "Follow"
                    }`}</button>
                  ) : (
                    <div className="ml-auto mr-6 mt-6 flex items-center justify-center">
                      <LoadingSpinner size={32} />
                    </div>
                  ))}
              </div>
              <div
                ref={lastUserElementRef}
                className="infiniteScrollTriggerDiv"
              ></div>
            </div>
          ) : (
            <div className="relative flex flex-row px-2 py-4" key={user.id}>
              <Image
                src={user.profilePicture}
                alt={`${user.username ?? ""}'s profile pic `}
                className="rounded-full border-2 border-black bg-black"
                width={64}
                height={64}
              />
              <Link href={`/@${user.username ?? ""}`} className="">
                {user.firstName && user.lastName && (
                  <p className="ml-4 font-bold">{`${user.firstName}  ${user.lastName}`}</p>
                )}
                <p className="mb ml-4 text-slate-300 hover:underline">
                  @{user.username}
                </p>
              </Link>
              {currentUser &&
                  currentUser.id !== user.id &&
                  (!loadingStates[user.id] ? (
                  <button
                    className={`ml-auto mr-4 mt-4 rounded-3xl border border-slate-400 bg-slate-800
      px-4 py-2 transition-all duration-300 hover:bg-slate-900 hover:text-white `}
                    onClick={() => mutate({ userToFollowId: user.id })}
                    disabled={loadingStates[user.id]}
                  >{`${isFollowing[user.id] ? "Unfollow" : "Follow"}`}</button>
                ) : (
                  <div className="ml-auto mr-6 mt-6 flex items-center justify-center">
                    <LoadingSpinner size={32} />
                  </div>
                ))}
            </div>
          );
        })
      )}
      {isFetchingNextPage && (
        <div className="mx-auto mt-6">
          <LoadingSpinner size={40} />
        </div>
      )}
    </div>
  );
};
