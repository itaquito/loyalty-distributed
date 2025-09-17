FROM denoland/deno:1.45.5

WORKDIR /app

COPY . .

RUN deno install

ENV PORT=8001
ENV CONSUL_URL=http://192.168.56.104:8500

EXPOSE $PORT

CMD ["deno", "run", "--allow-net", "--allow-env", "cmd/main/main.ts"]
