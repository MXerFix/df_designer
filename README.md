#### **Locally**
Run locally by cloning the repository and installing the dependencies. We recommend using a virtual environment to isolate the dependencies from your system.

Before you start, make sure you have the following installed:
  - Poetry (>=1.4)
  - Node.js

For the backend, you will need to install the dependencies and start the development server.
```bash
make install_backend
make backend
```
For the frontend, you will need to install the dependencies and start the development server.
```bash
make frontend
```


#### **Docker compose**
This will run the backend and frontend in separate containers. The frontend will be available at `localhost:3000` and the backend at `localhost:7860`.
```bash
docker compose up --build
# or
make dev build=1
```
