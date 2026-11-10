import React from "react";
import { signOut } from "next-auth/react";


function LogoutButton() {
  return (
    <div>
      <button onClick={() => signOut({ callbackUrl: "/" })}>Sign Out</button>
    </div>
  );
}

export default LogoutButton;
