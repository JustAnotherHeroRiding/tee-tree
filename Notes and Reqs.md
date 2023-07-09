## T3 Basics - let's learn how to use cutting edge tech

### Basic Components
- Typescript - I'm still not sure what type safe means but I guess it has to do with making sure that the javascript code does not error out while the web app is online by catching possible null values and exceptions
- Tailwind - I've been using it for months now and It makes CSS quick and easy
- TRPC - This seems to be the router which actually makes the fetch requests that I made with the fetch api before, I can also write all of the backend routes and the data they will return using it
- Next.js - Compared to Vite this seems to be a much more fully realized framework including the routing which is already implemented, in comparison vite seems to be just the front end. A lot to learn here.
- Clerk for auth - The auth solution 
- Prisma for ORM - Creating the database schema and interacting with the data provided by planetscale
- Planetscale for the postgres database 
- Vercel for hosting - Free hosting for hobby users, automatic deployments
- Axiom for logging - Still not quite sure what this helps us with


# Improvements

Let's implement some features I have already implemented before in order to learn the stack.

## Profile and Posts
- Allow users to upload a background image for the profile background which will let the users select the part they want displayed just like twitter - Ended up using Clerk's auth component. 
- This could be a fun challenge separate from the Clerk Auth Changes
- Like and unlike #DONE 
- Following users, this might be tricky as the users are stored in clerk #DONE 
- See who the user is following and is being followed by. This will be 2 separate pages with their own urls just like twitter. #DONE 
- Allow users to follow users from the following/followers pages #DONE 
- Fix following or not following for the 2 pages for all the users #DONE 
- Clicking outside the modal or clicking escape should close the edit profile modal #DONE 
- Pinned posts for each profile
- Sticky div at the top with the arrow to go back #DONE 
- Page for Liked posts #DONE 
- Username and posts counts on the stick div #DONE 

## Posts
- Editing posts #DONE 
- Deleting Posts #DONE 
- Clicking on the delete button should open a modal asking you to confirm before deleting the post. #DONE 
- Auto sizing text area and character counter #DONE 
- Tooltips for edited posts and icons #DONE 
- Posting pictures and not just text #DONE 
- Lazy loading and responsiveness for pictures [Cloudinary Docs](https://cloudinary.com/documentation/react_image_transformations) #DONE 
- Show the image that is about to be uploaded after it is set to imageFile #DONE 
- Add a cross to remove it #DONE 
- Compressing images before uploading #DONE 
- Images and gifs opening in full screen when clicked on #DONE
- Uploading Gifs #DONE 
- Phone breakpoint #DONE 
- Clicking outside the full screen photo or esc closes the full screen view #DONE 
- Deleting an image from a post in edit view #DONE 
- Deleting an image should also delete it from the cloudinary storage too #DONE 
- Improved delete post modal #DONE 
- Uploading media from edit view
- Sharing posts, meaning share a link on social media platforms #DONE 
- Improving Share post Modal Css #DONE 
- Copy link button #DONE 
- Image preview loads on the same file being uploaded #DONE 
- Views per post
- Emoji selector
- Sharing audio files that can be played 


## Retweets
- Create the retweet model #DONE 
- Retweet trpc mutation #DONE 
- Setting retweet amount and checking if users can retweet #DONE 
- Users can click to retweet a post, which will work similar to likes and be stored with the postId and the userId of the person who retweeted it #DONE 
- In the profile  feed, there should be posts that the user has retweeted #DONE 
- Add it for the following feed too
- Profile liked posts feed also
- If the post is a retweet, there should be a banner on top showing this #DONE 


## Comments
 - Comments for tweets, further comments for them too. Implement twitter threads

## Post View
- Add a sticky div #DONE 


## Main Page
- ## Lazy load #DONE 
- Infinite scrolling #DONE 
- Page for posts from followed users #DONE 
- Infinite scrolling for profile feed #DONE 
- Infinite scrolling for Following feed #DONE 
- Improve following page performance, it is really slow probably because of the two requests , it seems to have been a temporary issue, it is faster now after i added the followers api call in the home page #DONE 
- Try to use the global homePage state context to decide which data to invalidate upon liking #DONE 
- Home/following selector should always be on top and the posts underneath to be blurred #DONE 

## Search bar for profiles / posts
- Return posts that contain the query in the post body
- Return profiles if user selects people
- If the query starts with @ then show profiles first but still show posts afterwards
- For the profiles show 3 profiles and a show more tab, for posts implement useInfiniteQuery
- Search by hashtags

## Messaging
- Separate page where users can message each other


## Mentioning users
- Mentioning users in posts which will then link to their profile


## Trends and follow recommendations
- See how much each hashtag has appeared in the last week and show the top trends
- Separate trend page for expanded page