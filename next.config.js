/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['catbot-image-bucket.s3.ap-northeast-2.amazonaws.com', 'oaidalleapiprodscus.blob.core.windows.net']
  }
}

module.exports = nextConfig 