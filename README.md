# Create T3 App


## Tee-Tree
### What is this?

<img src="https://i.imgur.com/NUb9B8f.png" alt="Alt text" title="Optional title">

This is my attempt at building a fully realized twitter clone with all of the features being cloned in order to learn the technologies used in the T3 Stack.

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

### Why have I chosen this stack?

After finishing Harvard's [CS50W](https://cs50.harvard.edu/web/2020/) which used Javascript and Django for the backend, I was not happy with how separated the back and front end were. I came across a video about the t3 stack and since the the first day of June my focus has been on learning to be productive with the stack and all the modern technologies used in web development today.

### What have I learned?

- Typescript - I now understand the benefits of type safety and how important it is to be aware of the shape of the data that we are working with
- Writing a fully functional api with TRPC with all of the functionality that Django provided me without having to separate it completely from my front end and having to run 2 servers in development
- Tailwind - I was already pretty comfortable with it but the speed at which I can implement a desired style has improved and I feel comfortable in being to replicate most elements I see on the web
- Next.js as a full stack framework
- Routing with the pages folder as my previous React apps were fully SPA and did not have any routing
- Auth with [Clerk](https://clerk.com/) which has taken less than a 100 lines of code for the entire auth logic
- Using services like [Planetscale](https://planetscale.com/) for the database and [Axiom](https://axiom.co/) for logging

### Next Steps

While the main functionality has been implemented there are still various features I have yet to implement.

The main features I would like to add are:
- Messaging - The last big feature that is missing from my WebApp compared to twitter
- Wider Test Coverage - I have only just started writing Tests with Jest and there is still more work to be done here
- Optimizing database calls and the data being fetched - Some of the data being fetched is being repeated fetched twice, mostly with the posts and the relations
- Analytics - I have always been curious about how this looks from the developer side
