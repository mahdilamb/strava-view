.PHONY: help strava-api serve pretty fitbit-api apis
default: help

strava-api: #  Download the strava api to be used as a service.
	@rm -rf ${output}; docker run -v ${PWD}:${PWD} -w ${PWD} --user $(shell id -u):$(shell id -g) openapitools/openapi-generator-cli generate --skip-validate-spec --input-spec https://developers.strava.com/swagger/swagger.json -g typescript-fetch -o ${output} && [ "$(shell stat -c '%U %G' ${output}/index.ts)" = "${USER} ${USER}" ] || sudo chown -R ${USER}:${USER} ${output}; npx prettier ${output} --write


strava-api: output=./app/strava

fitbit-api: #  Download the strava api to be used as a service.
	@rm -rf ${output}; docker run -v ${PWD}:${PWD} -w ${PWD} --user $(shell id -u):$(shell id -g) openapitools/openapi-generator-cli generate --skip-validate-spec --input-spec https://dev.fitbit.com/build/reference/web-api/explore/fitbit-web-api-swagger.json -g typescript-fetch -o ${output} && [ "$(shell stat -c '%U %G' ${output}/index.ts)" = "${USER} ${USER}" ] || sudo chown -R ${USER}:${USER} ${output}; npx prettier ${output} --write


fitbit-api: output=./app/fitbit

apis: fitbit-api strava-api

age-key:
	mkdir -p ~/.config/sops/age/; age-keygen -o ~/.config/sops/age/keys.txt
pretty:
	npx prettier ./app --write
serve:
	npm run dev

docker-build:
	docker build -t strava-replay .
docker-run:
	docker run -p 80:3000 -e SOPS_AGE_KEY=$(shell cat ~/.config/sops/age/keys.txt | grep -o "^AGE.*") strava-replay

docker: docker-build docker-run
help: # Show help for each of the Makefile recipes.
	@grep -E '^[a-zA-Z0-9 -]+:.*#'  Makefile | sort | while read -r l; do printf "\033[1;32m$$(echo $$l | cut -f 1 -d':')\033[00m\n\t$$(echo $$l | cut -f 2- -d'#')\n"; done
