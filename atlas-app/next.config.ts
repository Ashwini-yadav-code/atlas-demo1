import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // avatar images (advisors, community post authors, the signed-in user's
    // placeholder) all come from this seed/demo source
    remotePatterns: [{ protocol: "https", hostname: "i.pravatar.cc" }],
  },
};

export default nextConfig;
