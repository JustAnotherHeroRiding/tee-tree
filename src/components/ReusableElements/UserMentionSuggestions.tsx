import { useRef, useEffect } from "react";
import type { User } from "./CreatePostWizard";
import Image from "next/image";

interface UserCardProps {
    user: User;
    index: number;
    input: string;
    setInput: React.Dispatch<React.SetStateAction<string>>;
    setIsTypingUsername: React.Dispatch<React.SetStateAction<boolean>>;
    setTextLength: React.Dispatch<React.SetStateAction<number>>;
  }
  
  export const UserCard: React.FC<UserCardProps> = ({ user, index, input, setInput, setIsTypingUsername, setTextLength }) => {
    const userRef = useRef<HTMLDivElement>(null); // create a reference
  
    useEffect(() => {
      if (index === 0 && userRef.current ) {
         // if it's the first user
          // if the div exists
          userRef.current.focus(); // focus the div
      }
    }, [index]);
  
    return (
      <div
        tabIndex={0}
        ref={userRef}
        className={`flex flex-row rounded-xl p-4 focus:outline-none hover:bg-Intone-200 focus:text-red-600 ${
          index == 0 ? "bg-Intone-200" : ""
        }`}
        onClick={() => {
          // Replace typed username with selected username
          const words = input.split(" ");
          words[words.length - 1] = user.username
            ? `@${user.username}`
            : "";
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
          src={user.profilePicture}
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
          <li className="">{user.username}</li>
        </div>
      </div>
    );
  }