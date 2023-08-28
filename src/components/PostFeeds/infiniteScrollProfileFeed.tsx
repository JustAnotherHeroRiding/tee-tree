import React, { useEffect, useState, useRef } from "react";
import { api } from "~/utils/api";
import { LoadingPage, LoadingSpinner } from "../ReusableElements/loading";
import { PostView, type PostWithUser } from "../ReusableElements/postview";
import { RetweetedBy } from "../ReusableElements/Users/RetweetedBy";

export const InfiniteScrollProfileFeed = (props: {
  userId: string;
  username: string;
}) => {
  const [page, setPage] = useState(0);

  const {
    data,
    fetchNextPage,
    isLoading: postsLoading,
    isFetchingNextPage: isFetchingNextPage,
  } = api.posts.infiniteScrollPostsByUserId.useInfiniteQuery(
    {
      userId: props.userId,
      limit: 4,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  // data will be split in pages
  const toShow = data?.pages[page]?.posts;

  const nextCursor = data?.pages[page]?.nextCursor;

  const lastPostElementRef = useRef(null);

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

  if (postsLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong.</div>;

  return (
    <div className="flex flex-col">
      {data?.pages?.map((page, pageIndex) =>
        page.posts.map((fullPost: PostWithUser, postIndex) => {
          const isLastPost =
            pageIndex === data.pages.length - 1 &&
            postIndex === page.posts.length - 1;

          return isLastPost ? (
            <div key={fullPost.post.id} className="relative">
              {fullPost.author.id !== props.userId && (
                <RetweetedBy userName={props.username} id={undefined} />
              )}

              <PostView {...fullPost} />
              <div
                ref={lastPostElementRef}
                className="infiniteScrollTriggerDiv"
              ></div>
            </div>
          ) : (
            <div key={fullPost.post.id}>
              {fullPost.author.id !== props.userId && (
                <RetweetedBy userName={props.username} id={undefined} />
              )}

              <PostView {...fullPost} />
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
