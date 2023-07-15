import { type GetStaticProps, type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { PostView } from "~/components/ReusableElements/postview";
import { generateSsgHelper } from "~/server/helpers/ssgHelper";
import { PageLayout } from "~/components/layout";
import { faArrowLeftLong } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";





const SinglePostPage: NextPage<{ id: string }> = ({ id }) => {

  const { data } = api.posts.getById.useQuery({ id });

  if (!data) return <div>404</div>

  return (
    <>
      <Head>
        <title>{`${data.post.content} - @${data.author.username}`}</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageLayout>
      <div className="flex sticky top-0 z-50 h-16 items-center justify-between backdrop-blur-sm pb-2">
      <Link href={"/"} ><FontAwesomeIcon className="w-8 h-8 rounded-3xl
        px-2 py-1 absolute top-4 left-4 hover:bg-slate-900 hover:text-white
        transform transition-all duration-300 hover:scale-125" icon={faArrowLeftLong} /></Link>
    </div>

        <PostView {...data} />
      </PageLayout>
    </>
  );
};


export const getStaticProps: GetStaticProps = async (context) => {
  const helpers = generateSsgHelper();

  const id = context.params?.id;

  if (typeof id !== 'string') throw new Error('id must be a string');


  await helpers.posts.getById.prefetch({ id });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      id,
    }
  }
};

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: 'blocking'
  };
}
export default SinglePostPage;
