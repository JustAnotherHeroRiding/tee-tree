import type { NextPage } from "next";
import { PageLayout } from "~/components/layout";
import BackButton from "~/components/ReusableElements/BackButton";
import { SuggestedUsers } from "~/components/ReusableElements/Users/SuggestedUsers";



const SuggestedUsersPage: NextPage = () => {

  return (
    <PageLayout>
        <div className="sticky top-0 z-50 h-16 
        items-center justify-between backdrop-blur-sm bg-transparent">
      <BackButton />
      <h1 className="font-bold text-2xl ml-16 w-fit">Connect</h1>
    </div>
    <SuggestedUsers limit={25} sideBar={false} />
    </PageLayout>
  );
};

export default SuggestedUsersPage;
