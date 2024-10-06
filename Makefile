.PHONY: help init strava-api serve pretty encode-secrets install-ngrok
default: help
SOPS_AGE_KEY_FILE=~/.config/sops/age/keys.txt

strava-api: #  Download the strava api to be used as a service.
	@rm -rf ${output}; docker run -v ${PWD}:${PWD} -w ${PWD} --user $(shell id -u):$(shell id -g) openapitools/openapi-generator-cli generate --skip-validate-spec --input-spec https://developers.strava.com/swagger/swagger.json -g typescript-fetch -o ${output} && [ "$(shell stat -c '%U %G' ${output}/index.ts)" = "${USER} ${USER}" ] || sudo chown -R ${USER}:${USER} ${output}; npx prettier ${output} --write

strava-api: output=./strava

age-key:
	mkdir -p $(shell dirname ${SOPS_AGE_KEY_FILE}); age-keygen -o ${SOPS_AGE_KEY_FILE}

pretty:
	npx prettier ./app --write

serve:
	npm run dev

docker-build:
	docker build -t strava-replay .

docker-run:
	docker run -p 80:3000 -e SOPS_AGE_KEY=$(shell cat ${SOPS_AGE_KEY_FILE} | grep -o "^AGE.*") strava-replay

docker: docker-build docker-run
help: # Show help for each of the Makefile recipes.
	@grep -E '^[a-zA-Z0-9 -]+:.*#'  Makefile | sort | while read -r l; do printf "\033[1;32m$$(echo $$l | cut -f 1 -d':')\033[00m\n\t$$(echo $$l | cut -f 2- -d'#')\n"; done

encode-secrets:
	[ ! -z "${file}" ] && ( sops --encrypt --age $$(cat ${SOPS_AGE_KEY_FILE} |grep -oP "public key: \K(.*)") $${file} > $${file%.*}.enc.$${file##*.}) || (echo "please specify a file. e.g. 'make encode-secrets file=file.yaml'" && exit 1)

install-ngrok:
	curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok.asc \
	| sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null \
	&& echo "deb https://ngrok-agent.s3.amazonaws.com buster main" \
	| sudo tee /etc/apt/sources.list.d/ngrok.list \
	&& sudo apt update \
	&& sudo apt install ngrok

ngrok:
	@rm -rf .ngrok-log; ngrok http --log .ngrok-log http://localhost:3000

init:
	npm run init
