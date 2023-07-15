import { countHashtags } from "~/server/helpers/countHashtags";
import { api } from "~/utils/api";
import { LoadingSpinner } from "./loading";
import Link from "next/link";

export const Trends = ({ limit = 10, sideBar = true }) => {
  const { data: posts, isLoading } = api.posts.getAllLastWeek.useQuery();
  
  if (!posts) {
    return <div className="flex">
      <div className="mx-auto">
    <LoadingSpinner size={42} />
    </div>
    </div>;
  }

  // Sort and limit the hashtags
  const hashtagCounts = countHashtags(posts);
  const sortedHashtagCounts = Object.entries(hashtagCounts).sort((a, b) => b[1] - a[1]);
  
  const topHashtags = sortedHashtagCounts.slice(0, limit); // limit is now a prop

  return (
    <div className="flex flex-col">
      {isLoading && 
      <div className="mx-auto">
      <LoadingSpinner size={42} />
      </div>}
      {topHashtags.map(([hashtag, count]) => (
        <div className="flex flex-col 
        px-4 pt-4 hover:bg-gray-900 cursor-pointer" key={hashtag}>
        <p className="font-bold">{hashtag}</p>
        <p className="text-twitter-200">{count} {`${count === 1 ? "post" : "posts"}`}</p>
        </div>
      ))}
      {sideBar && (
        <Link href="/i/trends" className="text-Intone-300 hover:bg-gray-900 rounded-b-2xl
      text-start px-4 py-2">Show More</Link>
      )}
      
    </div>
  );
};
