FROM denoland/deno:1.45.5

WORKDIR /app

COPY . .

RUN deno install

ENV PORT=8080

EXPOSE $PORT

CMD ["deno", "run", "--allow-net", "--allow-env", "cmd/main/main.ts"]
