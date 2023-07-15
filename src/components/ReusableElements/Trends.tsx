import { countHashtags } from "~/server/helpers/countHashtags";
import { api } from "~/utils/api";

export const Trends = () => {
  const { data: posts } = api.posts.getAll.useQuery();


  if (!posts) {
    return <div>Loading...</div>;
  }

  const hashtagCounts = countHashtags(posts);

  return (
    <div>
      {Object.entries(hashtagCounts).map(([hashtag, count]) => (
        <div className="flex flex-col mt-4" key={hashtag}>
        <p className="font-bold">{hashtag}</p>
        <p className="text-twitter-200">{count} {`${count === 1 ? "post" : "posts"}`}</p>
        </div>
      ))}
    </div>
  );
};
