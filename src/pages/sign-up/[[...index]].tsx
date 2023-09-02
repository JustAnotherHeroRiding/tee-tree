import { SignUp, useUser } from "@clerk/nextjs";

export default function Page() {

  const { user} = useUser();
  return (
    <div className="flex h-screen items-center justify-center">
      {!user && (
        <SignUp/>
      )}
      
    </div>
  );
}
