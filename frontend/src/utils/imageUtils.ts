/**
 * Utility function to handle image URLs
 * 
 * Since we're now using S3 with signed URLs, we don't need to transform the URLs
 * as they're already complete URLs from the backend. This function now just returns
 * the URL as is, or a placeholder if no URL is provided.
 */
export const getImageUrl = (imageUrl?: string): string => {
  if (!imageUrl) {
    return '';
  }
  
  // The URL is already a complete S3 signed URL, so just return it
  return imageUrl;
};