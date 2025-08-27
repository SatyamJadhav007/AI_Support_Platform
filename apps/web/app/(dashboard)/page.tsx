"use client";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { Button } from "@workspace/ui/components/button";
import { add } from "@workspace/math/add";
import { Input } from "@workspace/ui/components/input";
import { useMutation, useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api"; //its funny how i missed the "/api" import here...
//How did i imported packages from the backend to the front-end here??
//first=>Update the package.json dependencies, second=>Update the tsconfig.json paths with the desired URL,three=>Update the export for the package.json of the exporting workspace and also set the paths of the tsconfig.json file's paths
export default function Page() {
  const users = useQuery(api.users.getMany);
  const addUser = useMutation(api.users.add);
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-svh">
        <p>apps/web</p>
        <UserButton />
        <OrganizationSwitcher hidePersonal />
        <Button onClick={() => addUser()}>Add</Button>
        {/* <div className="max-w-sm w-full mx-auto">{JSON.stringify(users)}</div> */}
      </div>
    </>
  );
}
