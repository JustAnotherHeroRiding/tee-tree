import type { NextPage } from "next";
import { PageLayout } from "~/components/layout";
import BackButton from "~/components/ReusableElements/BackButton";

import { Trends } from "~/components/ReusableElements/Trends";


const TrendsPage: NextPage = () => {

  return (
    <PageLayout>
        <div className="sticky top-0 z-50 h-16 
        items-center justify-between backdrop-blur-sm bg-transparent">
      <BackButton />
    </div>
        <Trends limit={25} sideBar={false}/>
    </PageLayout>
  );
};

export default TrendsPage;
