import { api } from "~/utils/api";
import { LoadingPage } from "../loading";
import { MessageView } from "./MessageView";
import { useHomePage } from "~/components/Context/HomePageContext";
import { useState, useEffect, useRef } from "react";
import { LoadingSpinner } from "../loading";

export const MessageFeed = (props: { senderId: string, recipientId: string, }) => {

  const { homePage } = useHomePage();

 
 

  const [page, setPage] = useState(0);

  const {
    data,
    fetchNextPage,
    isLoading: messagesLoading,
    isFetchingNextPage: isFetchingNextPage,
  } = api.messages.infiniteScrollMessagesWithUserId.useInfiniteQuery(
    {
      authorId: props.senderId,
      recipientId: props.recipientId,
      limit: 30,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  // data will be split in pages
  const toShow = data?.pages[page]?.messages;

  const nextCursor = data?.pages[page]?.nextCursor;

  const lastPostElementRef = useRef(null);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const parentDiv = document.getElementById('mainScrollDiv');
      if (parentDiv && data) {
        parentDiv.scrollTop = parentDiv.scrollHeight;
        clearInterval(intervalId);
      }
    }, 100);
  
    return () => clearInterval(intervalId);
  }, [data]);

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

    const currentLastPostElement = lastPostElementRef.current;

    if (lastPostElementRef.current) {
      observer.observe(lastPostElementRef.current);
    }

    return () => {
      if (currentLastPostElement) {
        observer.unobserve(currentLastPostElement);
      }
    };
  }, [lastPostElementRef, nextCursor, fetchNextPage]);

  if (toShow?.length === 0) return null;

  if (messagesLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong.</div>;

  return (
    <div className="flex flex-col">
      {data?.pages?.map((page, pageIndex) =>
        page.messages.map((message, messageIndex) => {
          const isLastPost =
            pageIndex === data.pages.length - 1 &&
            messageIndex === page.messages.length - 1;

          return isLastPost ? (
            <div key={message.message.id} className="relative">

              <MessageView {...message} homePage={homePage} />
              <div
                ref={lastPostElementRef}
                className="infiniteScrollTriggerDiv"
              ></div>
            </div>
          ) : (
            <div key={message.message.id}>

              <MessageView {...message} homePage={homePage} />
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
