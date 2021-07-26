# AWS Serverless Tools

[`npm i @serverless-tools/aws`](https://www.npmjs.com/package/@serverless-tools/aws)

```typescript
import {Request as ApigRequest} from "@serverless-tools/aws/apigateway/Request";

export const handler = async ( event: APIGatewayProxyEvent ): Promise<APIGatewayProxyResult> =>
{
	const req = new ApigRequest(event);
	const json = {} as IJsonRetorno;

	try
	{
		switch (req.method())
		{
			case "POST":
				json.data = await _POST(req);
				break;
				
			case "GET":
				json.data = await _GET(req);
				break;

			default:
				json.erro = "Bad request (method)";
				return req.responseCreate(json, 400)
		}
	}
	catch(e:any)
	{
		req.logErro(e, req);
		json.erro = e;
		return req.responseCreate(json, 500);
	}

	return req.responseCreate(json); // CORS * enable by default
};

async function _POST(req: ApigRequest) 
{
	const payload = req.body(); // parsed object from body string
	const user = req.cognitoAuthorizer()?.user(); // returns CognitoUser object

	return await req.cognitoAuthorizer()?.email(); // Email (id token cames with request, access token has to go through cognito api to get user)
}

async function _GET(req: ApigRequest) 
{
	return req.queryString();
}
```

## Gateway

- Request(event: APIGatewayProxyEvent)
  - `resource()` : /order/{proxy+}
  - `path()` : /order/param1/param2
  - `method()` : GET | POST | PUT | etc.
  - `pathParams()` : {"proxy":"param1/param2"}
  - `headers()` : {Host: string, Authorization: string, etc}
  - `queryString()` : ?param1=val1&param2=val2 => {"param1":["val1"],"param2":["val2"]}
  - `body()`
  - `cognitoAuthorizer()`
  - `responseCreate(body, statusCode, headers)` 
- CognitoAuthorizer(event.requestContext.authorizer: APIGatewayEventDefaultAuthorizerContext)
  - `poolId()`
  - `poolRegion()`
  - `sub()`
  - `userName()`
  - `groups()` : string[]
  - `async email()`
  - `async user()` : CognitoUser

## Cognito

- CognitoUser
  - adminGetUserCommandOutput 
    - `userCreateDate` : Date
    - `userLastModifiedDate`: Date
    - `userStatus`: UNCONFIRMED | CONFIRMED | ARCHIVED | COMPROMISED | UNKNOWN | RESET_REQUIRED | FORCE_CHANGE_PASSWORD 
    - `userName`
    - `userEnable`
  - userAttributes?: AttributeType[]
    - `sub()`
    - `email()`
    - `name()`
- PoolAdmin
  - `constructor(region, poolId)`
  - List
    - `usersStartsWith(email)`
    - `usersFromGroup(name)`
  - Get
    - `userGet(username)`
    - `userGetByAccessToken(accessToken)` // needs 'aws.cognito.signin.user.admin' scope
    - `userGroups(username)`
    - `userHasGroups(username, groups: string[])`
  - Create
    - `userCreate(email)`
    - `userGroupAdd(username, group)`


> Check [lambda example](https://github.com/serverless-tools/lambda-apig)