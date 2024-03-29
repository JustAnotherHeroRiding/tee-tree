import Link from "next/link";
import type { User } from "../CreatePostWizard";
import Image from "next/image";
import { type ExtendedMessage } from "~/server/api/routers/messages";
import { type PostAuthor } from "~/server/api/routers/posts";

interface UserCardProps {
  user: User;
  index: number;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  setIsTypingUsername: React.Dispatch<React.SetStateAction<boolean>>;
  setTextLength: React.Dispatch<React.SetStateAction<number>>;
  highlightedUser: number;
  scrollRef: React.RefObject<HTMLDivElement>;
}

interface UserCardPropsSearch {
  user: User;
  index: number;
  highlightedIndex: number;
  scrollRef: React.RefObject<HTMLAnchorElement>;
  src?: string;
}

interface ExtendedMessageCard {
  message: ExtendedMessage;
  author: PostAuthor;
}

interface MessageCardPropsSearch {
  message: ExtendedMessageCard;
  index: number;
  highlightedIndex: number;
  scrollRef: React.RefObject<HTMLAnchorElement>;
  src?: string;
  currentUserId: string;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  index,
  input,
  setInput,
  setIsTypingUsername,
  setTextLength,
  highlightedUser,
  scrollRef,
}) => {
  return (
    <div
      tabIndex={0}
      ref={scrollRef}
      className={`flex flex-row rounded-xl p-4  hover:bg-Intone-200 ${
        highlightedUser == index ? "bg-Intone-200" : ""
      }`}
      onClick={() => {
        // Replace typed username with selected username
        const words = input.split(" ");
        words[words.length - 1] = user.username ? `@${user.username}` : "";
        setInput(words.join(" "));
        if (words[0]) {
          setTextLength(words[0].length);
        }
        // Stop showing the drop-down
        setIsTypingUsername(false);
      }}
    >
      <Image
        className="mr-4 h-14 w-14 rounded-full"
        src={user.profileImageUrl}
        alt="Profile Image"
        width={56}
        height={56}
        priority={true}
      />
      <div className="flex flex-col ">
        {user.firstName && user.lastName && (
          <span>
            {user.firstName}
            {user.lastName}
          </span>
        )}
        <p className="text-slate-300">@{user.username}</p>
      </div>
    </div>
  );
};

export const UserCardSearchResults: React.FC<UserCardPropsSearch> = ({
  user,
  index,
  highlightedIndex,
  scrollRef,
  src,
}) => {
  return (
    <Link
      ref={scrollRef}
      href={
        src === "message" ? `/messages/${user.id}` : `/@${user.username ?? ""}`
      }
    >
      <div
        tabIndex={0}
        className={`flex flex-row rounded-xl p-4  hover:bg-Intone-200 ${
          highlightedIndex == index ? "bg-Intone-200" : ""
        }`}
      >
        <Image
          className="mr-4 h-14 w-14 rounded-full"
          src={user.profileImageUrl}
          alt="Profile Image"
          width={56}
          height={56}
          priority={true}
        />
        <div className="flex flex-col ">
          {user.firstName && user.lastName && (
            <span>
              {user.firstName} {user.lastName}
            </span>
          )}
          <p className="text-slate-300">@{user.username}</p>
        </div>
      </div>
    </Link>
  );
};

export const MessageCardSearchResults: React.FC<MessageCardPropsSearch> = ({
  message,
  index,
  highlightedIndex,
  scrollRef,
  //src,
  currentUserId,
}) => {
  return (
    <Link
      ref={scrollRef}
      href={
        message.author?.id === currentUserId
          ? `/messages/${message.message.recipientId}?targetMessageId=${message.message.id}`
          : `/messages/${message.author?.id}?targetMessageId=${message.message.id}`
      }
    >
      {" "}
      <div
        tabIndex={0}
        className={`flex flex-row rounded-xl p-4  hover:bg-Intone-200 ${
          highlightedIndex == index ? "bg-Intone-200" : ""
        }`}
      >
        <Image
          className="mr-4 h-14 w-14 rounded-full"
          src={message.author?.profileImageUrl ?? ""}
          alt="Profile Image"
          width={56}
          height={56}
          priority={true}
        />
        <div className="flex flex-col ">
          <span>{message.message.content}</span>
          <p className="text-slate-300">@{message.author?.username}</p>
        </div>
      </div>
    </Link>
  );
};
