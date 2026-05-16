import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    compress: true,
    poweredByHeader: false,
    images: {
        formats: ["image/avif", "image/webp"],
        remotePatterns: [
            // DB contains images from ~24 external hostnames (supplier sites, CDNs, etc.)
            // Allow all HTTPS; HTTP is intentionally blocked (was allowed in original config).
            // TODO: migrate external images to /uploads/ and restrict this further.
            {
                protocol: "https",
                hostname: "**",
            },
        ],
    },
};

export default nextConfig;
