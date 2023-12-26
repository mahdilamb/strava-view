.PHONY: help strava-api serve
default: help

strava-api: #  Download the strava api to be used as a service.
	@rm -rf ${output}; docker run -v ${PWD}:${PWD} -w ${PWD} --user $(shell id -u):$(shell id -g) openapitools/openapi-generator-cli generate --skip-validate-spec --input-spec https://developers.strava.com/swagger/swagger.json -g typescript-fetch -o ${output} && [ "$(shell stat -c '%U %G' ${output}/api.ts)" = "${USER} ${USER}" ] || sudo chown -R ${USER}:${USER} ${output}; npx prettier ${output} --write


strava-api: output=./app/strava

age-key:
	mkdir -p ~/.config/sops/age/; age-keygen -o ~/.config/sops/age/keys.txt

serve:
	npm run dev
help: # Show help for each of the Makefile recipes.
	@grep -E '^[a-zA-Z0-9 -]+:.*#'  Makefile | sort | while read -r l; do printf "\033[1;32m$$(echo $$l | cut -f 1 -d':')\033[00m\n\t$$(echo $$l | cut -f 2- -d'#')\n"; done
