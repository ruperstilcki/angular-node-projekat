# Post

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.13.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Start Express server

npm run start:server

##

## How to run the project locally

To run this project on your local machine, follow the steps below:

1. **Install dependencies and set up environment configuration**
   - After cloning the repository, navigate to the project root folder in your terminal.
   - Run the following command to install all required dependencies:

     ```bash
     npm install
     ```

   - Then, create a file named `.env` in the root directory of the project (where your `app.js` is located).

   - Inside the `.env` file, add your MongoDB connection string like this:

     ```env
     MONGO_URL=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<database-name>?retryWrites=true&w=majority&appName=Cluster0
     ```

     > Replace `<username>`, `<password>`, and `<database-name>` with your actual MongoDB Atlas credentials.

   - Make sure `.env` is added to `.gitignore` to avoid accidentally exposing sensitive information.

   - Once environment variables are set, you can start the backend server by running:

     ```bash
     npm run start:server
     ```

   - If your project also contains an Angular frontend, you can start it by running:

     ```bash
     ng serve
     ```

     > This will start the frontend on `http://localhost:4200`, while the backend server will run on the port defined in your `.env` or fallback to `3000` by default.

---

##
