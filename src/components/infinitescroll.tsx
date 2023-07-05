import React, { useEffect, useState, useRef } from "react";
import { api } from "~/utils/api";
import { LoadingPage, LoadingSpinner } from "./loading";
import { PostView } from "./postview";
import type { PostWithAuthor } from "~/server/api/routers/posts";

export const InfiniteScrollFeed = () => {
  const [page, setPage] = useState(0);

  const {
    data,
    fetchNextPage,
    isLoading: postsLoading,
    isFetchingNextPage: isFetchingNextPage,
  } = api.posts.infiniteScrollAllPosts.useInfiniteQuery(
    {
      limit: 4,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

 
  /* const handleFetchPreviousPage = () => {
    setPage((prev) => prev - 1);
  }; */

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
      { root: null, // viewport
        rootMargin: '0px',
        threshold: 1.0
      }
    );

    const currentLastPostElement = lastPostElementRef.current;

    if (lastPostElementRef.current) {
      observer.observe(lastPostElementRef.current);
    }

    return () => {
      if (currentLastPostElement) {

        observer.observe(currentLastPostElement);
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
            <PostView  {...fullPost} />

            <div ref={lastPostElementRef} className="infiniteScrollTriggerDiv w-full">
              </div>
              </div>
          ) : (
            <PostView {...fullPost} key={fullPost.post.id} />
          );
        })
      )}
      {isFetchingNextPage && (
        <div className="mx-auto mt-6">
        <LoadingSpinner size={40}/>
        </div>
      )}
    </div>
  );
};
