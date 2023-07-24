import { api } from "~/utils/api";
import { LoadingSpinner } from "./loading";
import Link from "next/link";
import { useRouter } from "next/router";

export const Trends = ({ limit = 10, sideBar = true }) => {
  const router = useRouter();

  const { data: unslicedHashtags, isLoading } = api.posts.getTrends.useQuery(
    {}
  );

  const handleClick = async (hashtag : string) => {
    await router.push({
      pathname: '/i/search',
      query: { q: hashtag, src: 'trend_click', selector: 'top' }
    });
  };


  if (!unslicedHashtags || isLoading) {
    return (
      <div className="flex">
        <div className="mx-auto">
          <LoadingSpinner size={42} />
        </div>
      </div>
    );
  }

  const topHashtags = unslicedHashtags.slice(0, limit);

  return (
    <div className="flex flex-col">
      {isLoading && (
        <div className="mx-auto">
          <LoadingSpinner size={42} />
        </div>
      )}
      {topHashtags.map(([hashtag, count]) => (
        <div
          key={hashtag}
          className="flex cursor-pointer flex-col px-4 pt-4 hover:bg-gray-900"
          onClick={() => void handleClick(hashtag)}
        >
          
            <p className="font-bold">{hashtag}</p>
            <p className="text-twitter-200">
              {count} {`${count === 1 ? "post" : "posts"}`}
            </p>
        </div>
      ))}
      {sideBar && (
        <Link
          href="/i/trends"
          className="rounded-b-2xl px-4 py-2
      text-start text-Intone-300 hover:bg-gray-900"
        >
          Show More
        </Link>
      )}
    </div>
  );
};
