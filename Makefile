run-consul-dev-server:
	docker run -d -p 8500:8500 -p 8600:8600/udp --name=dev-consul consul:1.15.4 agent -server -ui -node=server-1 -bootstrap-expect=1 -client=0.0.0.0

customer-build:
	docker build -t customer-service ./customer

customer-run:
	docker run -p 8000:8000 -e PORT=8000 -e CONSUL_URL=http://192.168.56.104:8500 customer-service

transaction-build:
	docker build -t transaction-service ./transaction

transaction-run:
	docker run -p 8001:8001 -e PORT=8001 -e CONSUL_URL=http://192.168.56.104:8500 transaction-service

docker-compose-up:
	docker-compose up

docker-compose-down:
	docker-compose down
