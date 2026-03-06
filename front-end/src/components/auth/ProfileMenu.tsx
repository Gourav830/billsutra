"use client";

import React, { Suspense, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserAvtar from "../common/UserAvtar";
import LogoutModal from "./LogoutModal";
import dynamic from "next/dynamic";
const LogoutModalDynamic = dynamic(() => import("../auth/LogoutModal"));
const ProfileMenu = ({ name, image }: { name: string; image?: string }) => {
  const [logoutopen,setLogoutOpen]=useState(false);
    return (
    <div>
        {logoutopen &&<Suspense fallback={<div>Loading...</div>}>
            <LogoutModalDynamic open={logoutopen} setOpen={setLogoutOpen} />
       
        </Suspense>}

      <DropdownMenu>
        <DropdownMenuTrigger>
          <UserAvtar name={name} image={image} />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem onClick={()=>{setLogoutOpen(true)}}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ProfileMenu;
