build_docker_image_and_push:
	docker build -t smlsoft/dedeaccount .
	docker push smlsoft/dedeaccount

build_docker_image:
	yarn build
	docker buildx build --platform linux/amd64 --push -t smlsoft/dedeaccount .

push_web_docker:
	docker push smlsoft/dedeaccount

run_web_docker:
	docker run --rm -p 8001:80 smlsoft/dedeaccount
build_m1_docker_releases:
	yarn build	
	docker buildx build --platform linux/amd64 --push -t smlsoft/dedeaccount .
build_m1_docker_dev:
	yarn build	
	docker buildx build --platform linux/amd64 --push -t smlsoft/dedeaccount:dev .	
run:
	yarn dev

build_loser_app:
	yarn build:loser
	docker buildx build --platform linux/amd64 --push -t smlsoft/dedeaccount:loserapp .