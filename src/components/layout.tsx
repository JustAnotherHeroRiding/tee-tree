import type { PropsWithChildren } from "react";

export const PageLayout = (props: PropsWithChildren) => {

    return (
        <main className="flex justify-center h-screen scroll-" >
            <div className="w-full h-full border-x  md:max-w-2xl border-slate-400 overflow-y-scroll scrollbar-thin 
             scrollbar-thumb-slate-400 scrollbar-thumb-rounded-full">
                    {props.children}
            </div>
        </main>
    );
};