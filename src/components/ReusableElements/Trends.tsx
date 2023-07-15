import { countHashtags } from "~/server/helpers/countHashtags";
import { api } from "~/utils/api";
import { LoadingSpinner } from "./loading";

export const Trends = () => {
  const { data: posts, isLoading } = api.posts.getAllLastWeek.useQuery();


  if (!posts) {
    
    return <div className="flex">
      <div className="mx-auto">
    <LoadingSpinner size={42} />
    </div>
    </div>;
  }

  const hashtagCounts = countHashtags(posts);

  return (
    <div className="flex flex-col">
      {isLoading && 
      <div className="mx-auto">
      <LoadingSpinner size={42} />
      </div>}
      {Object.entries(hashtagCounts).map(([hashtag, count]) => (
        <div className="flex flex-col px-4 pt-4
         hover:bg-gray-900 cursor-pointer" key={hashtag}>
        <p className="font-bold">{hashtag}</p>
        <p className="text-twitter-200">{count} {`${count === 1 ? "post" : "posts"}`}</p>
        </div>
      ))}
      <button className="text-Intone-300 hover:bg-gray-900 rounded-b-2xl 
      text-start px-4 py-2">Show More</button>
    </div>
  );
};
