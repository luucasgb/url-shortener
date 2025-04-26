# Use the official MongoDB image
FROM mongo:latest

# Set environment variables for MongoDB root user
ENV MONGO_INITDB_ROOT_USERNAME=admin
ENV MONGO_INITDB_ROOT_PASSWORD=password

# Set the default database directory
VOLUME /data/db

# Expose the default MongoDB port
EXPOSE 27017

# Start MongoDB
CMD ["mongod"]