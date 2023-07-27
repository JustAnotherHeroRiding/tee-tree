import { api } from "~/utils/api";
import { LoadingSpinner } from "./loading";
import Link from "next/link";
import Image from "next/image";

export const SuggestedUsers = ({ limit = 3, sideBar = true }) => {

  const { data: suggestedUsers, isLoading } = api.follow.getNotFollowingCurrentUser.useQuery();



  if (!suggestedUsers) 
  return <h1>You follow everyone!</h1>

  const slicedUsers = suggestedUsers.slice(0, limit)

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
          className="flex cursor-pointer flex-col hover:bg-gray-900 px-4 py-2"
        >
            <div className="flex flex-row">
            <Image
              src={user.profileImageUrl ?? ""}
              alt={`${user.profileImageUrl ?? ""}'s profile pic `}
              className="rounded-full border-2 h-12 w-12 border-black bg-black"
              width={64}
              height={64}
            />
          
            <p className="font-bold">{user.username}</p>
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
