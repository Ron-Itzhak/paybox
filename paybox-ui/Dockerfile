FROM node:16 as builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm i -g @angular/cli
RUN npm install
COPY . .
RUN npm run build-prd

FROM nginx:alpine
COPY --from=builder /app/dist/paybox-ui /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
