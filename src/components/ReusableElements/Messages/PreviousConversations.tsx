import { useContext } from "react";
import { UserContext } from "~/components/Context/UserContext";
import { LoadingSpinner } from "../loading";
import Image from "next/image";

type PreviousUsersProps = {
  uniqueUserIds: Set<string>;
};

export const PreviousUsers: React.FC<PreviousUsersProps> = ({
  uniqueUserIds,
}) => {
  const { userList, isLoading: isLoadingUserList } = useContext(UserContext);

  if (isLoadingUserList) {
    return <LoadingSpinner />;
  }

  const filteredUsers = userList.filter((user) => uniqueUserIds.has(user.id));

  return (
    <div className="flex flex-col">
      {filteredUsers.map((user) => (
        <div key={user.id} className="p-4">
          <div className="flex flex-row">
            <Image
              className="h-12 w-12 rounded-3xl mr-6"
              alt={`${user.username ?? ""}'s profile picture`}
              src={user.profileImageUrl}
              width={48}
              height={48}
            />
            <div className="flex flex-col">
              <span>{user.username}</span>
              <span className="whitespace-normal">
                {user.firstName} {user.lastName}
              </span>
            </div>
          </div>{" "}
        </div>
      ))}
    </div>
  );
};
