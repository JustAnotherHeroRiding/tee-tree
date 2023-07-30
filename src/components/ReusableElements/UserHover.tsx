import { type User } from "./CreatePostWizard";
import Image from "next/image";
import Link from "next/link";
import { type FollowedWithAuthor } from "~/server/api/routers/followers";
import { LoadingSpinner } from "./loading";


type MutateFunction = (params: { userToFollowId: string }) => void;

export const UserHoverCard = (props: {
  user: User;
  userList: User[];
  mentionedUser: User;
  username: string;
  isFollowingLoading: boolean;
  isFollowing: Record<string, boolean>;
  followingData: FollowedWithAuthor[] | undefined;
  mutate: MutateFunction;
  followingCount: Record<string, number>;
  followerCount: Record<string, number>;
  location: string;

}) => {
  return (
    <div
      className={`invisible absolute ${props.location === "post" ? "right-0 top-16": " right-4 -top-60"} z-10
            scale-0 cursor-default rounded-2xl border border-slate-400 bg-black 
            p-4 transition-all duration-[500ms] ease-in-out group-hover:visible group-hover:scale-100`}
    >
      <div className="flex min-w-[250px] flex-row justify-between">
        <Image
          className="h-14 w-14 rounded-full"
          src={
            props.userList.find((user) => user.username === props.username)
              ?.profileImageUrl as string
          }
          alt={`@${props.username} profile picture`}
          width={56}
          height={56}
        />

        {props.mentionedUser.id !== props.user?.id &&
          props.user &&
          (props.followingData ? (
            <button
              className={`mr-4 mt-4 rounded-3xl border border-slate-400 bg-slate-800 px-4
         py-1 transition-all duration-300 hover:bg-slate-900 hover:text-white 
         ${props.isFollowingLoading ? "scale-110 animate-pulse text-blue-700" : ""}`}
              onMouseUp={(event) =>{
                event.stopPropagation();
                props.mutate({
                  userToFollowId: props.mentionedUser.id ? props.mentionedUser.id : "",
                })
            }
              }
              disabled={false}
            >{`${
              props.isFollowing[props.mentionedUser.id] ? "Unfollow" : "Follow"
            }`}</button>
          ) : (
            <div className="mr-6 mt-6 flex items-center justify-center">
              <LoadingSpinner size={32} />
            </div>
          ))}
      </div>
      <Link href={`/@${props.username}`} className="mt-4 flex flex-col">
        <span className="font-bold text-white">{props.mentionedUser.firstName}{" "}{props.mentionedUser.lastName}</span>
        <span className="cursor-pointer text-slate-300 hover:underline">@{props.username}</span>
      </Link>
      <div className="mt-4 flex flex-row">
        <Link href={`/followers/@${props.username}`}>
          <div className="mb-4 flex cursor-pointer flex-row items-center text-slate-300 hover:text-white">
            <h1>Followers</h1>
            <h1 className="text-bold ml-2 text-2xl">
              {props.followerCount[props.mentionedUser.id] || 0}
            </h1>
          </div>
        </Link>
        <Link href={`/following/@${props.username}`}>
          <div className="mb-4 ml-4 flex cursor-pointer flex-row items-center text-slate-300 hover:text-white">
            <h1>Following</h1>
            <h1 className="text-bold ml-2 text-2xl">
              {props.followingCount[props.mentionedUser.id] || 0}
            </h1>
          </div>
        </Link>
      </div>
    </div>
  );
};
