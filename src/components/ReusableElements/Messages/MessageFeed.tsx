import { api } from "~/utils/api";
import { LoadingPage } from "../loading";
import { MessageView } from "./MessageView";
import { useHomePage } from "~/components/Context/HomePageContext";
import { useState, useEffect, useRef } from "react";
import { LoadingSpinner } from "../loading";
import React from "react";
import { useRouter } from "next/router";
import { useUser } from "@clerk/nextjs";

declare global {
  interface Math {
    easeInOutQuad(t: number, b: number, c: number, d: number): number;
  }
}

export const smoothScrollTo = (
  element: HTMLElement,
  target: number,
  duration: number
) => {
  const start = element.scrollTop;
  const change = target - start;
  let currentTime = 0;
  const increment = 20;

  const animateScroll = () => {
    currentTime += increment;
    const val = Math.easeInOutQuad(currentTime, start, change, duration);
    element.scrollTop = val;
    if (currentTime < duration) {
      window.requestAnimationFrame(animateScroll);
    }
  };

  // Ease in-out function
  Math.easeInOutQuad = function (t: number, b: number, c: number, d: number) {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  };

  animateScroll();
};

export const MessageFeed = (props: {
  senderId: string;
  recipientId: string;
}) => {
  const { homePage } = useHomePage();

  const router = useRouter();
  const targetMessageId = router.query.targetMessageId as string | undefined;

  const [page, setPage] = useState(0);

  const { user: currentUser} = useUser();

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

  const [highlightedMessageId, setHighlightedMessageId] = useState<
    string | null
  >(null);

  const messageRefs = useRef<{ [id: string]: React.RefObject<HTMLDivElement> }>(
    {}
  );

  useEffect(() => {
    // Initialize refs
    data?.pages.forEach((page) => {
      page.messages.forEach((message) => {
        messageRefs.current[message.message.id] = React.createRef();
      });
    });
  }, [data]);

  const [scrollCompleted, setScrollCompleted] = useState(false);
  const [highlightCompleted, setHighlightCompleted] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let intervalId: NodeJS.Timeout;

    if (targetMessageId) {
      if (!highlightCompleted) {
        // Highlight the message
        setHighlightedMessageId(targetMessageId);

        // Remove highlight after 2 seconds
        timer = setTimeout(() => {
          setHighlightedMessageId(null);
          setHighlightCompleted(true);
        }, 2000);
      }

      if (!scrollCompleted) {
        // Scroll to the specific message
        intervalId = setInterval(() => {
          const targetElement = messageRefs.current?.[targetMessageId]?.current;
          if (targetElement) {
            const parentDiv = document.getElementById("mainScrollDiv");
            const offset = 80; // Scroll 100px further down

            if (parentDiv) {
              const targetPosition = targetElement.getBoundingClientRect().top;
              const parentPosition = parentDiv.getBoundingClientRect().top;
              const finalPosition =
                targetPosition - parentPosition + parentDiv.scrollTop;

              smoothScrollTo(parentDiv, finalPosition + offset, 800); // 800ms duration
            }

            clearInterval(intervalId);
            setScrollCompleted(true);
          }
        }, 100);
      }
    } else {
      if (!scrollCompleted) {
        // Scroll to the bottom
        intervalId = setInterval(() => {
          const parentDiv = document.getElementById("mainScrollDiv");
          if (parentDiv && data) {
            parentDiv.scrollTop = parentDiv.scrollHeight;
            clearInterval(intervalId);
            setScrollCompleted(true);
          }
        }, 100);
      }
    }

    return () => {
      clearTimeout(timer);
      clearInterval(intervalId);
    };
  }, [data, targetMessageId, scrollCompleted, highlightCompleted]);

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
          const nextMessage = page.messages[messageIndex + 1];
          const isLastSenderMessage = nextMessage
            ? message.message.authorId !== nextMessage.message.authorId
            : message.message.authorId === currentUser?.id;
          const isLastRecipientMessage = nextMessage
            ? message.message.recipientId !== nextMessage.message.recipientId
            : message.message.recipientId === currentUser?.id;
          const isLastPost =
            pageIndex === data.pages.length - 1 &&
            messageIndex === page.messages.length - 1;

          const isHighlighted = message.message.id === highlightedMessageId;

          return (
            <div
              key={message.message.id}
              className={`relative ${isHighlighted ? "bg-Intone-700" : ""}`}
              ref={messageRefs.current[message.message.id]}
            >
              <MessageView
                {...message}
                homePage={homePage}
                isLastSenderMessage={isLastSenderMessage}
                isLastRecipientMessage={isLastRecipientMessage}
              />
              {isLastPost && (
                <div
                  ref={lastPostElementRef}
                  className="infiniteScrollTriggerDiv"
                ></div>
              )}
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
