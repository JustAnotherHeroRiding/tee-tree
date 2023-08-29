import { useAuth } from "@clerk/nextjs";
import LogoHomePageLink from "./LogoHomePageLink";
import MessagesLink from "./MessagesLink";

const Sidebar = (props: { src: string }) => {
  const { isSignedIn } = useAuth();

  return (
    <div
      className={` ${
        props.src === "index"
          ? "hidden trendsbreakpoint:flex flex-row"
          : "left-0 showSidebar:hidden sm:left-[1%] md:left-[2%] lg:left-[3%] fixed flex-col trendsbreakpoint:hidden"
      }  flex items-start 
    gap-2 `}
    >
      <LogoHomePageLink src={props.src} />
      {isSignedIn && <MessagesLink />}
    </div>
  );
};

export default Sidebar;
