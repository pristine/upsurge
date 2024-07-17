
## Upsurge App

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

The web-app for Upsurge. The web-app provides a visual dashboard to view user analytics, the points and rewards system, and user management.

Built for the Whop Apps platform, and later expanded out.

### Running Upsurge
Since this platform was initially made for monetization, running it is a little difficult.

**Step 1**: Host a PostgreSQL database and load the necessary tables, Prisma should do everything for you. 

**Step 2**: Fill in the .env file
- Encryption fields can be filled in by generating an AES-256 key
- Whop fields are only necessarily if running the platform on Whop, if using Web, you don't have to fill it out
- Discord fields can be filled out by creating an App through the Discord Developer Portal

**Step 3**: Add a new company based on the `Company` schema into the database, from there, you should be able to access the website through `https://localhost:3000/web/company/[id_of_company_you_added]`