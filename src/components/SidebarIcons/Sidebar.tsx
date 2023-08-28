import LogoHomePageLink from "./LogoHomePageLink";
import MessagesLink from "./MessagesLink";

const Sidebar = () => {
  return (
    <div className="fixed left-0 flex flex-col items-start gap-2 sm:left-[1%] md:left-[2%] lg:left-[3%] showSidebar:hidden">
      <LogoHomePageLink />
      <MessagesLink />
    </div>
  );
};

export default Sidebar;
