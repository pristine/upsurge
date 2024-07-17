
# Upsurge Monorepo

### Upsurge is a web app built to enhance client retention through user analytics.

Upsurge incentivizes user engagement and loyalty. By tracking user activities and interactions on supported third-party platforms, Upsurge provides valuable insights that help businesses understand their clients better and tailor their services accordingly. The key features of Upsurge include:

-  **User Analytics Dashboard**: A comprehensive dashboard that provides real-time analytics on user behavior, engagement metrics, and retention rates.

-  **Point and Reward System**: Users earn points through various interactions on the platform, which can be redeemed for rewards, fostering a sense of achievement and loyalty.

-  **Customizable Rewards**: Businesses can set up their own rewards tailored to their user base, ensuring the incentives align with their brand and goals.

-  **Gamification**: Implementing gamification elements such as leaderboards and minigames to make the user experience more engaging and fun.

### Monorepo Structure

The Upsurge project is organized as a monorepo, containing multiple related projects. The key repositories included in this monorepo are:

-   **upsurge-app**: This repository contains the main web application built with Next.js. It provides the user interface for the analytics, points and rewards, and user dashboard.
-   **upsurge-discord-bot**: This repository contains the Discord bot, which supports integration with Discord to track user activities and interactions within Discord communities. The bot enhances user engagement by bringing Upsurge's point and reward system into Discord servers.
- **upsurge-db**: This repository contains the database for Upsurge. It is a PostgreSQL database that is used to store user data, points, and rewards.