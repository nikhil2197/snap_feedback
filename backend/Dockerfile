# Stage 1: Build stage - where we install dependencies
FROM python:3.9-slim AS builder

WORKDIR /usr/src/app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN pip install --upgrade pip

COPY requirements.txt .
RUN pip wheel --no-cache-dir --wheel-dir /usr/src/app/wheels -r requirements.txt


# Stage 2: Final stage - the actual runtime environment
FROM python:3.9-slim

WORKDIR /usr/src/app

# Create a non-root user
RUN addgroup --system app && adduser --system --group app

# Copy installed packages from builder stage
COPY --from=builder /usr/src/app/wheels /wheels
RUN pip install --no-cache /wheels/*

# Copy the application code
COPY ./app ./app

# Chown all the files to the app user
RUN chown -R app:app /usr/src/app
USER app

EXPOSE 8000

# Command to run the app using Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"] 