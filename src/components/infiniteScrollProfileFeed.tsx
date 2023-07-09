import React, { useEffect, useState, useRef } from "react";
import { api } from "~/utils/api";
import { LoadingPage, LoadingSpinner } from "./loading";
import { PostView } from "./postview";
import type { PostWithAuthor } from "~/server/api/routers/posts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRetweet } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export const InfiniteScrollProfileFeed = (props: { userId: string, username: string }) => {
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
        page.posts.map((fullPost: PostWithAuthor, postIndex) => {
          const isLastPost =
            pageIndex === data.pages.length - 1 &&
            postIndex === page.posts.length - 1;

          return isLastPost ? (
            <div key={fullPost.post.id} className="relative">
              {fullPost.author.id !== props.userId && (
                <div className="flex flex-row -mb-3">
                  <FontAwesomeIcon icon={faRetweet} className="ml-8 h-6 w-6" />
                  <h1 className="">Retweeted by</h1>
                </div>
              )}

              <PostView {...fullPost} />
              <div
                ref={lastPostElementRef}
                className="infiniteScrollTriggerDiv"
              ></div>
            </div>
          ) : (
            <div  key={fullPost.post.id}>
              {fullPost.author.id !== props.userId && (
                  <Link className="flex flex-row -mb-3 hover:underline" href={`/@${props.username}`}>
                  <FontAwesomeIcon icon={faRetweet} className="ml-12 my-auto h-4 w-4" />
                  <h1 className="text-slate-300 ml-2">Retweeted by {props.username}</h1>
                  </Link>
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
