import { useRouter } from "next/router"; // add this line at the top
import type { NextPage } from "next";
import Head from "next/head";
import { useUser } from "@clerk/nextjs";
import { LoadingPage } from "~/components/ReusableElements/loading";
import { PageLayout } from "~/components/layout";
import BackButton from "~/components/ReusableElements/BackButton";
import { InfiniteScrollSearchResults } from "~/components/PostFeeds/infiniteScrollSearchResults";
import { UserSearchResults } from "~/components/ReusableElements/userSearchResults";

const SearchResults: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn, user } = useUser();

  const router = useRouter(); // add this line

  const username = user?.username;

  // We can use router.query to fetch the 'q' parameter from the URL
  const searchQuery = router.query.q;
  const selector = router.query.selector;

  // Return empty div if BOTH are not loaded, since user tends to load faster
  if (!userLoaded) return <LoadingPage />;

  if (isSignedIn && !username) return <div></div>;

  return (
    <>
      <Head>
        <title>{`Search - Placeholder`}</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageLayout>
        <div className="sticky top-0 z-50 mb-2 flex flex-col backdrop-blur-sm">
          <BackButton />
          <ul className="mt-[72px] flex cursor-pointer flex-row justify-between border-b border-slate-400 text-center">
            <div
              className="flex w-1/2 flex-col items-center justify-center hover:bg-slate-700"
              onClick={() => {
                const newQuery = { ...router.query, selector: "top" };
                void router.push({
                  pathname: router.pathname,
                  query: newQuery,
                });
              }}
            >
              <li className="w-full px-4 py-2">Top</li>
              {selector === "top" && (
                <hr className="selector-on-symbol absolute bottom-0"></hr>
              )}
            </div>
            <div
              className="flex w-1/2 flex-col items-center justify-center hover:bg-slate-700"
              onClick={() => {
                const newQuery = { ...router.query, selector: "latest" };
                void router.push({
                  pathname: router.pathname,
                  query: newQuery,
                });
              }}
            >
              <li className="w-full px-4 py-2">Latest</li>
              {selector === "latest" && (
                <hr className="selector-on-symbol absolute bottom-0"></hr>
              )}
            </div>
            <div
              className="flex w-1/2 flex-col items-center justify-center hover:bg-slate-700"
              onClick={() => {
                const newQuery = { ...router.query, selector: "people" };
                void router.push({
                  pathname: router.pathname,
                  query: newQuery,
                });
              }}
            >
              <li className="w-full px-4 py-2 ">People</li>
              {selector === "people" && (
                <hr className="selector-on-symbol absolute bottom-0"></hr>
              )}
            </div>
            <div
              className="flex w-1/2 flex-col items-center justify-center hover:bg-slate-700"
              onClick={() => {
                const newQuery = { ...router.query, selector: "photos" };
                void router.push({
                  pathname: router.pathname,
                  query: newQuery,
                });
              }}
            >
              <li className="w-full px-4 py-2">Photos</li>
              {selector === "photos" && (
                <hr className="selector-on-symbol absolute bottom-0"></hr>
              )}
            </div>
            <div
              className="flex w-1/2 flex-col items-center justify-center hover:bg-slate-700"
              onClick={() => {
                const newQuery = { ...router.query, selector: "gifs" };
                void router.push({
                  pathname: router.pathname,
                  query: newQuery,
                });
              }}
            >
              <li className="w-full px-4 py-2">Gifs</li>
              {selector === "gifs" && (
                <hr className="selector-on-symbol absolute bottom-0"></hr>
              )}
            </div>{" "}
          </ul>
        </div>
        {selector === "top" && (
          <div className="border-b border-slate-400">
            <h2 className="px-4 text-2xl font-bold">People</h2>
            <UserSearchResults  query={searchQuery as string}/> 
            {/* This should set the selector to people */}
            <p className="mb-4 w-full pl-4 text-Intone-300 hover:bg-slate-800"  onClick={() => {
                const newQuery = { ...router.query, selector: "people" };
                void router.push({
                  pathname: router.pathname,
                  query: newQuery,
                });
              }}>
              View all
            </p>
          </div>
        )}

        {selector == "top" && (
          <InfiniteScrollSearchResults
            query={searchQuery as string}
            selector={"top"}
          />
        )}
        {selector == "latest" && (
          <InfiniteScrollSearchResults
            query={searchQuery as string}
            selector={"latest"}
          />
        )}
      </PageLayout>
    </>
  );
};

export default SearchResults;
