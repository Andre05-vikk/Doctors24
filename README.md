
# Doctors24

Doctors24 is a web application that allows users to view a list of doctors and initiate video calls for consultation, managing their sessions seamlessly.
## Features

- User authentication (sign in and sign out)
- View list of doctors
- Protected routes for authenticated users

## Technologies Used

- JavaScript
- SQL (SQLite)
- Prisma ORM
- Bootstrap 5
- Handlebars

## Project Setup



1. Install dependencies:
    ```sh
    npm install
    ```

2. Set up the database:
    ```sh
    npx prisma migrate dev --name init
    ```

3. Seed the database:
    ```sh
    node prisma/seed.js
    ```

4. Start the development server:
    ```sh
    npm start
    ```

## Usage

- Open your browser and navigate to `http://localhost:3000`.
- Use the sign-in form to log in with the following credentials:
    - Email: test
    - Password: test
- View the list of doctors and access protected routes.

## Project Structure

- `prisma/schema.prisma`: Database schema definition.
- `prisma/seed.js`: Script to seed the database with initial data.
- `views/layouts/main.handlebars`: Main layout for the application.
- `public/`: Static assets (CSS, JS, images).
- `routes/`: Express routes for handling requests.