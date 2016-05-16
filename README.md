cookbook-node
=============

## Install
`npm install`

## Config
  - `ADMIN_TOKEN`: An admin auth token
  - `LOG_LEVEL`: Sets the log level
  - `POSTGRES_URI`: A url to a Postgres database

## Run
Development: `POSTGRES_URI=pg_url npm run dev`
Production: `POSTGRES_URI=pg_url npm start`

### Testing
`npm test`

### Linting
`npm run lint`
