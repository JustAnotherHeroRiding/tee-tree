import React, { useEffect, useState } from "react";
import { api } from "~/utils/api";
import { LoadingPage } from "./loading";
import { PostView } from "./postview";
import type { PostWithAuthor } from "~/server/api/routers/posts";


export const InfiniteScrollFeed = () => {
    const [page, setPage] = useState(0);  

    const { data, fetchNextPage } = api.posts.infiniteScroll.useInfiniteQuery(
      {
        limit: 4,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );
  
    const handleFetchNextPage = async () => {
      await fetchNextPage();
      setPage((prev) => prev + 1);
    };
  
    const handleFetchPreviousPage = () => {
      setPage((prev) => prev - 1);
    };
  
    // data will be split in pages
    const toShow = data?.pages[page]?.posts;

    const nextCursor = data?.pages[page]?.nextCursor;

    if (toShow?.length === 0) return null;



    console.log(data?.pages)

  return (
    <div className="flex flex-col">
      {data?.pages?.map((page) => (
        page.posts.map((fullPost: PostWithAuthor) => (
            <PostView {...fullPost} key={fullPost.post.id} />

        ))
      ))}
      <div className="flex justify-between">
        <button onClick={handleFetchPreviousPage}>
          Previous Page
        </button>
        <button onClick={handleFetchNextPage} disabled={!nextCursor}>
          Next Page
        </button>
      </div>
    </div>
  );
};
