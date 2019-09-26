### Installation
`npm install`
`npm run start`

## Environment Variables
`DATABASE_URL` - (Required) PG database url
`DB_RESET` - (Optional) flags the databse to reload on rebuilds
`TEST_PASSWORD` - (Optional) test password for scaffolded user
`JWT_SECRET` - (Required) Secret used to sign jwt tokens
`COOKIE_SECRET` - (Required)  Secret used to sign cookies

### Routes

## Users
[GET] /v1/users/:id - Get single user
[GET] /v1/users/:id/contacts - Get users contacts

[PUT] /v1/users/:id - Update user
[POST] /v1/users/:id/contacts - Create user contacts
[POST] /v1/register - Create new users

## Auth
[POST] /v1/auth - Authenticate username/password

## Contacts
[PUT] /v1/contacts/:id - Update contact
[DELETE] /v1/contacts/:id - Delete contact