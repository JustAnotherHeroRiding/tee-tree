import type { PostWithAuthor } from "../api/routers/posts";

const extractHashtags = (postContent: string): string[] => {
    const hashtags = postContent.match(/#[a-z0-9_]+/gi);
    return hashtags ? hashtags : [];
  };
  
  
type HashtagCounts = { [hashtag: string]: number };

export const countHashtags = (posts: PostWithAuthor[]): HashtagCounts => {
    const hashtagCounts: HashtagCounts = {};
    posts.forEach(post => {
      const hashtags = extractHashtags(post.post.content);
      if (hashtags) { // to ensure hashtags is not null
        hashtags.forEach(hashtag => {
          if (hashtagCounts[hashtag]) {
            hashtagCounts[hashtag]++;
          } else {
            hashtagCounts[hashtag] = 1;
          }
        });
      }
    });
    return hashtagCounts;
  };
  