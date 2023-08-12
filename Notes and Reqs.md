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
- Sticky div at the top with the arrow to go back #DONE 
- Page for Liked posts #DONE 
- Username and posts counts on the stick div #DONE 
- If a user has no followers or following then display a message #DONE 
- Display First and Last Name for Users #DONE 
- Collage of images that the user has posted on the profile view on the right side
- Pinned posts for each profile

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
- Sharing audio files that can be played 
- Make post content be selectable #DONE

### Emoji selector
- Make the emoji selector work for the create post wizard

### User and trend suggestion in the edit post view
- Add user and trend suggestions in the edit post text area
- Make the text blue when you are editing it

### Bug alert
- Button cant appear inside of a button for the share modal #DONE 
- The buttons are too cramped, I should add another column on phone screen sizes and make it wider #DONE 

#### Quick Fix
- Trends in posts should link to the search results for that trend #DONE 

## Retweets
- Create the retweet model #DONE 
- Retweet trpc mutation #DONE 
- Setting retweet amount and checking if users can retweet #DONE 
- Users can click to retweet a post, which will work similar to likes and be stored with the postId and the userId of the person who retweeted it #DONE 
- In the profile  feed, there should be posts that the user has retweeted #DONE 
- Add it for the following feed too #DONE Whew that was a rough  one
- If the post is a retweet, there should be a banner on top showing this #DONE 


## Comments
- Clicking on the comment icon should open a modal where users can post a reply to the tweet with the original tweet above
- Comments for tweets, further comments for them too. Implement twitter threads
- Profile page should have a replies page

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
- Create a separate search results page #DONE 
- Add a src parameter to see where the user initiated the search from #DONE 
- Return posts that contain the query in the post body with infinite scroll #DONE 
- The feed should change #DONE 
- It is not scrolling #DONE 
- Create endpoint to fetch 3 users #DONE 
- The endpoint is returning 3 users even if I search for gibberish #DONE 
- Create endpoint to fetch infinite users - This is proving to be difficult as we are fetching the users from clerk. For some reason useInfiniteQuery is not available for the endpoint that I created. Let us see later what is the issue #DONE 
###### The issue was that I did not add a cursor parameter which is mandatory for infinite queries
- For the profiles show 3 profiles and a show more tab, for posts, this should be only for the top selector #DONE 
- Loading spinner should only show for the user being followed #DONE 
- Add those blue lines to the selected category of search results #DONE 
- Return profiles if user selects people #DONE 
- If the query starts with @ then show profiles first but still show posts afterwards #DONE 
- Search by hashtags #DONE 
- First user photo is squished #DONE Added css w and h just like on the profile page
- Suggested search queries #DONE Css is done, let us handle the logic
- Create a new User card only for the search inputs #DONE 
- Write the inputChange listener function to see if the user is typing a query #DONE 
- When typing a query, it should show possible trends or users #DONE 
- Let us concatenate both ref arrays into one for the possible results #DONE 
- The suggested results div is too small on phones #DONE 
- Add the feeds for photos and gif feeds #DONE 

## Image upload icon
- The icon is not in line with the other icons #DONE 

## Messaging
- Separate page where users can message each other

## Recommended Users to follow
- Endpoint to fetch users that the current user is not following #DONE 
- Display users that the current user is not following on the right below the trends #DONE 
- It should be limited to 3 #DONE 
- Let's make the profile picture consistent across the user types #DONE 
- Follow buttons #DONE 
- Do not show a profile if it is the current user !!! #DONE 
- Make the profiles link #DONE 
- Hover profile card, let's turn the other implementation into a component #DONE 
- Clicking on Show more should open a page with all users that the current user is not following #DONE 
- The user id will be passed in the url - This is how twitter does it but I do not need it as I can fetch the user id from the backend directly #DONE 
- The current user is also showing up, this is weird #DONE 
- It will show a sign in button when the user is not logged in #DONE 

## Mentioning users
- If the word starts with an @ and is part of the list of users then then it should be blue #DONE 
- Clicking on the user will link to their profile #DONE 
- Hovering over if will open a card with the profile info #DONE 
- It should also show the follow button #DONE 
- The follow button should correctly show as unfollow/follow and work as in the profile page #DONE 
- Display the following numbers and link to the /user/following page #DONE 
- Fetch the numbers for each mentioned user #DONE 
- Make the tooltip always be inside the posts div in the middle and not overflowing #DONE 
- The tooltip is clipping to the left on phones(I set it to be relative to the post div and not the text span) #DONE 
- When making a post and staring a word with an @, a list of users should appear that we can tag #DONE 
- Style the list of suggested users #DONE 
- Improve function that filters usernames to also include lowercase #DONE 
- Add autofocus to the recommended users card #DONE 
- This takes the focus away from the typing, I need to find another way to focus #DONE 
- Fix this mess! #DONE 
- Arrow keys and tab to select #DONE 
- Let's make it scroll if we are selecting an out of bounds user #DONE 
- Unfinished user mentions were not showing where I could possibly tag someone, added the else block to handle this to the colored words function #DONE 

## Bug fixing followers
- Follower numbers on profile are not correct #DONE 
- Errors when trying add the author data to the follow record #DONE 
- Cannot fetch following of current user #DONE 
##### This was all caused by the same issue, when testing the follow button on the profile tooltip I created a Follow record with the username instead of the userId of the kristijan_k account. This made the function adding author data to follow records fail every time as it could not find an id Match

## Delete Post bug
- Deleting a post is failing because of the required relation between the Like and Post objects #DONE 

## Reworking the post content and removing the link
- Remove the link wrapping the entire post component and turn it into a span #DONE 

## Trends and mentions blue text
- When typing a word that starts with an @ or # when making a new post it should be blue #DONE 
- It should remain blue when typing the following words #DONE 


## Trends and follow recommendations
- Since the trends will be shown in all pages, let's add them to the layout.tsx #DONE 
- See how much each hashtag has appeared in all posts and show the top trends #DONE 
- Make it only query the last week #DONE 
- If the user clicks on show more it should open a separate page with just the trends #DONE 
- The div on the side should not be shown if the url is /trends #DONE 
- Posts starting with # in post.content should be blue #DONE
- Make the trends be a global context like the user list so that I can access them from the create post and trends components - Turned into into a trpc call to fetch trends so we only call it once #DONE 
- When typing, if a word starts with # we should get recommendations like for users with @  #DONE 
- Fix the CSS with the highlighting, the select is not always displaying well and for some reason the possible trends array is one character too slow #DONE 
- Keyboard Navigation for trends #DONE 
- The tab is selecting the wrong hashtag - I never used highlightedTrend to index the array #DONE 
- Add Refs and scroll into view #DONE 
- Clicking on them should open the search query for that trend #DONE 
- Separate trend page for expanded view of a trend and the posts containing those hashtags, this should just be a search query for posts containing that word if the user clicks the trend #DONE 
