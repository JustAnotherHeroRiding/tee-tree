import { type GetStaticProps, type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { PageLayout } from "~/components/layout";
import { PostView } from "~/components/postview";
import { generateSsgHelper } from "~/server/helpers/ssgHelper";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeftLong, faXmark } from '@fortawesome/free-solid-svg-icons'
import Link from "next/link";
import toast from "react-hot-toast";
import { UserProfile, useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import type { Follow } from "@prisma/client";


const ProfileFollowingPage: NextPage<{ username: string }> = ({ username }) => {
  return (
    <>
      <Head>
        <title>{`${username}'s followed users`}</title>
        <meta name="description" content={`Users that @${username} follows`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageLayout>
        <div className=" bg-slate-600 h-12 relative">
        <div className="flex items-center justify-between">
            <Link href={`/@${username}`} ><FontAwesomeIcon className="w-8 h-8 rounded-3xl
        px-2 py-1 absolute top-4 left-4 hover:bg-slate-900 hover:text-white
        transform transition-all duration-300 hover:scale-125" icon={faArrowLeftLong} /></Link>

          </div>
        </div>
      </PageLayout>

    </>
  )
};


export const getStaticProps: GetStaticProps = async (context) => {
  const helpers = generateSsgHelper();

  const slug = context.params?.slug;

  if (typeof slug !== 'string') throw new Error('slug must be a string');

  const username = slug.replace("@", "");

  await helpers.profile.getUserByUsername.prefetch({ username })

  return {
    props: {
      trpcState: helpers.dehydrate(),
      username
    }
  }
};


export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: 'blocking'
  };
}

export default ProfileFollowingPage;

