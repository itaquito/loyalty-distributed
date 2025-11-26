FROM denoland/deno:2.5.6

WORKDIR /app

COPY . .

RUN deno install

ENV PORT=8080

EXPOSE $PORT

CMD ["deno", "run", "--allow-net", "--allow-env", "business/cmd/main/main.ts"]
