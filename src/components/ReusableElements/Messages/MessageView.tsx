import { type PostAuthor } from "~/server/api/routers/posts";
import { type ExtendedMessage } from "~/server/api/routers/messages";
import React from "react";
import { useUser } from "@clerk/nextjs";

type MessageViewComponentProps = {
  type?: string;
  message: ExtendedMessage;
  author: PostAuthor;
  showLineBelow?: boolean;
};

const MessageViewComponent = (props: MessageViewComponentProps) => {
  //const deleteImageUrl = `https://api.cloudinary.com/v1_1/de5zmknvp/image/destroy`;

  const { message, author } = props;
  const { user } = useUser();

  return (
    <div
      className={`mx-2 mb-2 rounded-lg border border-slate-300 max-w-[250px] ${
        author.id === user?.id ? "ml-auto" : "mr-auto"
      } w-fit p-1 px-2`}
    >
      <h1>{message.content}</h1>
      <span>{author.username}</span>
    </div>
  );
};

MessageViewComponent.displayName = "MessageView";

export const MessageView = React.memo(MessageViewComponent);
