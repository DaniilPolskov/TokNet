---

# TokNet

TokNet is a web application built with a modern tech stack, featuring Django and Django REST Framework for the backend and React for the frontend. The project uses PostgreSQL, Docker, and provides functionality such as QR code generation, authentication, and API integration.

## Technologies

### Backend

* Python
* Django 5.2
* Django REST Framework
* SimpleJWT
* PostgreSQL
* Docker

### Frontend

* React 19
* React Router DOM
* Styled Components
* Axios
* Cloudinary (for image uploads)
* EmailJS
* QRCode generation

### DevOps

* Docker and Docker Compose
* Nginx (optional)
* Kubernetes (optional)

---

## Installation and Running

Make sure you have Docker and Docker Compose installed.

### 1. Clone the repository

```bash
git clone https://github.com/DaniilPolskov/TokNet.git
cd TokNet
```

### 2. Run the project

```bash
docker-compose up --build
```

* Frontend: [http://localhost:3000](http://localhost:3000)
* Backend API: [http://localhost:8000](http://localhost:8000)
* PostgreSQL DB: accessible on port 5432, username: `admin`, password: `6540`

---

## Frontend Development Scripts

```bash
npm start       # Runs the frontend in development mode
npm run build   # Builds the app for production
npm test        # Runs tests
```

---

## Authentication

The project uses JWT authentication via `djangorestframework-simplejwt` and two-factor authentication (2FA) via `pyotp`.

---

## Features

* User registration and login with JWT
* QR code generation
* Image uploading through Cloudinary
* Email sending via EmailJS
* Public and private routes
* Responsive design with Styled Components

---

## Deployment Recommendations

For production deployment, it is recommended to:

* Use nginx as a reverse proxy
* Configure environment variables using `.env` files
* Set up HTTPS using services like Let's Encrypt

---
