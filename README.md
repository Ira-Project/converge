## What is the Ira Project?

The IRA project is an exploration to use AI and LLMs to build the next generation of assignments. Rather than students solving problems they teach an AI concepts.

## What is this repository? What is the tech stack?

This repository contains the web application MVP of this project. It's built using the [T3 Stack](https://create.t3.gg/). Given below is some of the reasoning and limitations behind the technologies used.

- [Next.js](https://nextjs.org) - Next enables us to start quickly and get set up while also scaling quite well. I've tried to use a SSR wherever possible though this is an area that can be improved. One limitation with NextJS is that we're going to limited to a certain degree on API timeouts. The hard 60 second vercel limit can be a challenge for some time consuming AI endpoints and might require us to set up streaming for those end points.
- [Lucia.js](https://lucia-auth.com) - Lucia manages sessions for us and abstracts away a lot of the auth logic!
- [Drizzle](https://orm.drizzle.team) - Drizzle is our ORM of choice. Drizzle seems to be giving the best performance and with a lot of joins in tables involving concepts the single query emphasis is extremely beneficial.
- [Tailwind CSS](https://tailwindcss.com) - Not much to say here other than the fact that Tailwind is really comfortable and easy to use.
- [tRPC](https://trpc.io) - TRPC allows to keep the TypeSafety across the front end and backend. Type safety across the project has been something I've really enjoyed and I've continued the practice.
- [ShadCN UI](https://ui.shadcn.com) - The best component library on the web in my opinion. The components have been really easy to work with and give a fairly decent aesthetic out of the box!

## Can I fork this repository or use this code?

Feel free to use this codebase any which way you like. However, this codebase may not be as helpful without an understanding of how we're using OpenAI API. Do reach out if you'd like to learn more or want to get involved.

## Where's the rest of the project?

This repository only caontains our consumer facing web application. Currently we're using the OpenAPI and are working towards fine tuning models and assistants to help build the AI buddy. You can find a detailed description of the experiments and approaches we're taking along with the current roadmap [here](https://github.com/Ira-Project/).

## Tech Upgrades To Do

- Update tanstack react query to latest version once TRPC 11 is up

## Contact

To learn more please contact vignesh@iraproject.com.
