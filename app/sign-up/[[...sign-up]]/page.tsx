import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="h-screen flex justify-center m-30">
      <SignUp />;
    </div>
  );
}
