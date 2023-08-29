import { api } from "~/utils/api";
import { LoadingPage } from "../loading";
import { MessageView } from "./MessageView";

export const MessageFeed = (props: { senderId: string }) => {

  const { data, isLoading: messagesLoading } = api.messages.getById.useQuery({
    authorId: props.senderId,
  });

  if (messagesLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong.</div>;

  return (
    <div className="flex flex-col">
      {data.map((message) => (
        <MessageView {...message} key={message.message.id} />
      ))}
    </div>
  );
};
