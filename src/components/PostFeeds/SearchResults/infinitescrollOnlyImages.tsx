import React, { useEffect, useState, useRef } from "react";
import { api } from "~/utils/api";
import { LoadingPage, LoadingSpinner } from "../../ReusableElements/loading";
import { PostView, type PostWithUser } from "../../ReusableElements/postview";

export const InfiniteScrollOnlyImages = (props: {
  query: string;
  selector: string;
}) => {
  const [page, setPage] = useState(0);

  const {
    data,
    fetchNextPage,
    isLoading: postsLoading,
    isFetchingNextPage: isFetchingNextPage,
  } = api.posts.infiniteScrollSearchResultsImages.useInfiniteQuery(
    {
      query: props.query,
      selector: props.selector,
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
  }, [lastPostElementRef, nextCursor, fetchNextPage, props.selector]);

  if (toShow?.length === 0)
    return <div className="text-center mt-4">No posts found.</div>;

  if (postsLoading) return <LoadingPage />;

  if (!data || !data.pages[0]?.posts) {
    return <div className="text-center">No posts found.</div>;
  }

  return (
    <div className="flex flex-col">
      {data?.pages?.map((page, pageIndex) =>
        page.posts.map((fullPost: PostWithUser, postIndex) => {
          const isLastPost =
            pageIndex === data.pages.length - 1 &&
            postIndex === page.posts.length - 1;

          return isLastPost ? (
            <div key={fullPost.post.id} className="relative">
              <PostView {...fullPost} />
              <div
                ref={lastPostElementRef}
                className="infiniteScrollTriggerDiv"
              ></div>
            </div>
          ) : (
            <div key={fullPost.post.id}>
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
