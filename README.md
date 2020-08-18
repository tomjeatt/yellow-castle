# Yellow Castle

## Configuration

Before you can run the server, you need to create a Kafka user with the API gateway and authorise it for the topic you want to consume.

Note: Yellow Castle currently only supports consuming a single topic at a time.

### Creating a user

1. Get an Aiven API token from the Aiven console.

2. Create a file called `request.json` with the following values (this can be done in any directory). The username must be unique.

```
{
    "project": "ovo-uat",
    "service": "kafka-uat",
    "username": "unique-uat-user-name"
}
```

3. Use CURL to make the request to the API gateway, replacing `API_TOKEN` with the token created in step 1:

```
curl --header "Authorization: aivenv1 API_TOKEN" \
     --header "Content-Type: application/json" \
     --request POST \
     --data @request.json \
     -o response.json \
     https://kafka-users.eng-svc.ovotech.org.uk/create
```

4. The user details will be returned in `response.json`

5. If you need a prod user, Repeat steps 2 - 3 but with the following values in `request.json`. The user name should be unique, but should also match the user name created for UAT (i.e. if your UAT user is `yellow-castle-uat-user-name` your prod user should be `yellow-castle-prod-user-name`):

```
{
    "project": "ovo-prd",
    "service": "kafka-prd",
    "username": "unique-prd-user-name"
}
```

### Adding a user to a topic

Once you have created a user you need to grant it access to the topic that you want to consume. This is done by creating an ACL user in the the `aiven-as-code` repository.

1. Check out `https://github.com/ovotech/aiven-as-code` and create a branch.

2. Locate the terraform file in the `ovo-uat` directory (and `ovo-prd` if required) that is owned by the team whose topic you want to consume, e.g. to consume a topic from Helios you will need to make changes to `ovo-uat/helios.tf`

3. Add a block of code in the file with the following fields, where the user name matches the user you created earlier and the topic is the one you would like to consume. The second value in the first line of the code block (`"he_loss_updated_v2_read_he_yellow_castle"` in the example below) is the ACL user name and it should be both unique and descriptive. `permissions` and `lifecycle` should be set to the appropriate values.

```
resource "aiven_kafka_acl" "he_loss_updated_v2_read_he_yellow_castle" {
  project      = local.project
  service_name = local.service_name
  username     = "he-yellow-castle"
  topic        = "he-loss_updated_v2"
  permission   = "read"

  lifecycle {
    prevent_destroy = "true"
  }
}
```

4. Create a PR. You should assign a PR to an engineer in the team which owns the topic you are consuming. A list of engineers can be found in the [codeowners file](https://github.com/ovotech/aiven-as-code/blob/master/.github/CODEOWNERS).

Once your PR has been approved and merged your user will be able to consume the topic.

Note: if you run into issues with using `local.project` and `local.service_name` as the values for `project` and `service_name` you can use `ovo-uat` and `kafka-uat` instead.

### Configuring the server

1. Create a directory called `ssl` in the project root and then create three files in it: `ca`, `crt` and `key` (no file extensions).

2. From the `response.json` file which was returned when you created the user, find the `access_cert` and copy the contents into the `crt` file created in step 1. You may need to do a find and replace on the escaped new line charaters (`\n`).

3. From the `response.json` file which was returned when you created the user, find the `access_key` and copy the contents into the `key` file created in step 1. You may need to do a find and replace on the escaped new line charaters (`\n`).

4. Log in to the Aiven console, select the `ovo-uat` project and find the `kafka-uat` project. Find the CA certificate on the overview page, copy the value, and paser the contents into the `ca` file created in step 1.

5. In the project root, create a file called `.env.local` and add in the following fields. You will find the password in `response.json` and you will need to make sure the topic is one your user has access to,

```
SCHEMA_REGISTRY_USERNAME=unique-user-name
SCHEMA_REGISTRY_PASSWORD=
SCHEMA_REGISTRY_URL=https://kafka-uat.ovo-uat.aivencloud.com:13584
KAFKA_BROKER=kafka-uat.ovo-uat.aivencloud.com:13581
KAFKA_SECRETS_LOCATION=./ssl
KAFKA_TOPIC=he-loss_updated_v2
KAFKA_GROUP_ID=your-group-id
```

## Running the server and application

Note: you will need to be connected to the VPN.

1. Run `yarn` from the project root.
2. Run `yarn serve` to start the Kafka consumer and the server.
3. Run `yarn start` to start the application.

The server will start at http://localhost:4001.

The application will start at http://localhost:4000.
