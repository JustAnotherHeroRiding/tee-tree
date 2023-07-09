import type { PropsWithChildren } from "react";

export const PageLayout = (props: PropsWithChildren) => {

    return (
        <main className="flex justify-center h-screen relative" >
            <div className="w-full h-full phone:border-none border-x  md:max-w-2xl border-slate-400 
            overflow-y-scroll gray-thin-scrollbar">
                    {props.children}
            </div>
        </main>
    );
};