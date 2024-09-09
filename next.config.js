await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'source.boringavatars.com',
      },
      {
        protocol: 'https',
        hostname: 'converge-ira-project.s3.ap-south-1.amazonaws.com'
      },
      {
        protocol: 'https',
        hostname: 'converge-question-images.s3.us-west-1.amazonaws.com'
      }
    ],
  },
};

export default config;
