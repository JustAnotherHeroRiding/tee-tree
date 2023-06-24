import React, { useEffect, useState } from "react";
import { api } from "~/utils/api";
import { LoadingPage } from "./loading";
import { PostView } from "./postview";
import type { PostWithAuthor } from "~/server/api/routers/posts";


export const PaginatedFeed = () => {
  const [cursor, setCursor] = useState<string | undefined>();
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);


  const { data, isLoading, isError } = api.posts.getAllPaginated.useQuery({
    cursor,
    limit: 2,
  });

  useEffect(() => {
  if (data?.posts) {
    setPosts((prevPosts) => {
      // Loop through data.posts and push each post to prevPosts
      for (const post of data.posts) {
        prevPosts.push(post);
      }
      return prevPosts;
    });
  }
}, [data]);

  
  


  const handleNextPage = () => {
    if (data) {
      setCursor(data.nextCursor);
      
    }
  };

  const handlePreviousPage = () => {
    setCursor(undefined);
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  if (isError || !data) {
    return <div>Error loading posts</div>;
  }

  console.log(data);

  return (
    <div className="flex flex-col">
      {data.posts.map((fullPost) => (
        
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
      <div className="flex justify-between">
        <button onClick={handlePreviousPage} disabled={!cursor}>
          Previous Page
        </button>
        <button onClick={handleNextPage} disabled={!data?.nextCursor}>
          Next Page
        </button>
      </div>
    </div>
  );
};
