# Use official Python image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app source code
COPY . .

# Expose port for Render
EXPOSE 10000

# Run the FastAPI app
CMD ["uvicorn", "app.web4app.main:app", "--host", "0.0.0.0", "--port", "10000"]
