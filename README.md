# Strava playground

This repo is a way for individuals to explore there data.

## Set-up

1. Ensure you have an [age key](https://github.com/FiloSottile/age) set-up. This is used by [SOPS](https://github.com/getsops/sops) to keep the keys encrypted. (Once you have age-keygen installed you can use `make age-key` to create an age-key in the correct location for the other make commands)
2. Store the [strava api](https://www.strava.com/settings/api) details. `make init`, will prompt you for the required details and encrypt them using the above age key.
3. Run the server `make serve`.

Note that to subscribe to the [strava webhook events](https://developers.strava.com/docs/webhooks/), you will need to use a reverse proxy. I use [ngrok](https://ngrok.com/):

```shell
# Install ngrok
make install-ngrok

# Run the reverse proxy
make ngrok
```

The log file that is produced is scraped for the reverse-proxy address, so ngrok should be loaded first (even though it pings to a server that isn't running yet!).

## Running locally

For usual running:

`make ngrok` in one terminal
`make serve` in a separate terminal

You should be able to access the site at [http://localhost:3000]
