import {type PostAuthor } from "~/server/api/routers/posts"; 
import { type ExtendedMessage } from "~/server/api/routers/messages";
import React from "react";

type MessageViewComponentProps = {
  type?: string;
  message: ExtendedMessage;
  author: PostAuthor;
  showLineBelow?: boolean;
};

const MessageViewComponent = (props: MessageViewComponentProps) => {
  //const deleteImageUrl = `https://api.cloudinary.com/v1_1/de5zmknvp/image/destroy`;

  const { message, author } = props;

  return (
    <>
      <h1>{message.content}</h1>
      <span>{author.username}</span>
    </>
  );
};


MessageViewComponent.displayName = "MessageView";

export const MessageView = React.memo(MessageViewComponent);

