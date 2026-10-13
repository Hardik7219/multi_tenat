import React from "react";

function Loader() {
  return (
    <div>
      <main className="min-h-screen bg-[#050505] p-6 text-white flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-8 w-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
          <p className="text-white/50 text-sm">Loading dashboard...</p>
        </div>
      </main>
    </div>
  );
}

export default Loader;
