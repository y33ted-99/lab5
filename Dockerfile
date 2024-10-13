# Use the official Node.js image
FROM node:14

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY server2/package*.json ./

# Install dependencies
RUN npm install

# Copy the server code
COPY server2/ .

# Expose the port
EXPOSE 3001

# Command to run the application
CMD ["node", "server.js"]
