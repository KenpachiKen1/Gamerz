# Game Haven


## Description
Game Haven is a cloud-based web application designed to bring gaming communities together in one place. It combines the core features of platforms like Discord, Reddit, and YouTube, allowing users to connect, share content, and discuss games without switching between multiple apps.

Game Haven provides a centralized platform where users can:

- Create profiles
- Log and review games
- Join game-specific communities
- Share gameplay clips
- Participate in discussions and forums


## Team 
- Kenneth: Backend Developer, Database Management
- Virgil: Frontend Developer, Testing
- Bryson: Backend Testing, Cloud Operations
- Jalen: Frontend Testing, Cloud Operations


## Design

### Tech stack
- Frontend: React.js + TypeScript
- Backend: Python (Django)
- Cloud Platform: Microsoft Azure
- Database: Azure SQL / PostgreSQL
- Authentication: Firebase

### Architecture
Game Haven follows a cloud-based architecture:

- Frontend Layer: Hosted on Azure Static Web Apps
- Backend Layer: Django API on Azure App Service
- Database: 
    - Azure PostgreSQL (User profile information, video game information)
    - Azure Cosmos DB (Messages, Posts)
- Storage: Azure Blob Storage (Media storage)
- Endpoint testing: Postman
