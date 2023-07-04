import { useEffect, useRef, useState } from "react";
import { api } from "~/utils/api";
import { LoadingPage, LoadingSpinner } from "./loading";
import type { PostWithAuthor } from "~/server/api/routers/posts";
import { PostView } from "./postview";

export const InfiniteScrollFollowingFeed = () => {
  const [page, setPage] = useState(0);

  const { data: followingData } = api.follow.getFollowingCurrentUser.useQuery();

  const {
    data,
    fetchNextPage,
    isLoading: postsLoading,
    isFetchingNextPage,
  } = api.posts.infiniteScrollFollowerUsersPosts.useInfiniteQuery(
    { followers: followingData ?? [], limit: 4 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: !!followingData,
      onError: (error) => {
        console.error("Error in getPostsFromFollowedUsers query:", error);
      },
      onSuccess: (data) => {
        if (!data) {
          console.error("Data is undefined in getPostsFromFollowedUsers query");
        }
      },
    }
  );

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
            <div key={fullPost.post.id}>
              <PostView {...fullPost} />

              <div ref={lastPostElementRef} className="infiniteScrollTriggerDiv"></div>
            </div>
          ) : (
            <PostView {...fullPost} key={fullPost.post.id} />
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
