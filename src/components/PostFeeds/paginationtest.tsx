import React, {  useState } from "react";
import { api } from "~/utils/api";
import { LoadingPage } from "../ReusableElements/loading";
import { PostView } from "../ReusableElements/postview";


export const PaginatedFeed = () => {
  const [cursor, setCursor] = useState<string | undefined>();


  const { data, isLoading, isError } = api.posts.getAllPaginated.useQuery({
    cursor,
    limit: 2,
  });

  
  


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
