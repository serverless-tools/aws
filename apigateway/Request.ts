import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import CognitoAuthorizer from "./CognitoAuthorizer";

const CORS_OBJ = { 
    "Access-Control-Allow-Origin": "*", 
    "Access-Control-Allow-Headers": "*", 
    "Access-Control-Allow-Methods": "*" 
}

export class Request
{
    readonly event: APIGatewayProxyEvent;
    private apigAuthorizer: CognitoAuthorizer|null;

    constructor(apigProxyEvent: APIGatewayProxyEvent)
    {
        this.event = apigProxyEvent;

        if(this.event?.requestContext?.authorizer)
        {
            this.apigAuthorizer = new CognitoAuthorizer(this.event.requestContext.authorizer);
        }
        else
        {
            this.apigAuthorizer = null;
        }
    }

    //#region [HTTP]

    resource()
    {
        return this.event.resource;
    }

    path()
    {
        return this.event.path;
    }

    pathParams()
    {
        return this.event.pathParameters;
    }

    method()
    {
        return this.event.httpMethod;
    }

    headers()
    {
        return this.event.headers;
    }

    queryString()
    {
        return this.event.multiValueQueryStringParameters;
    }

    body(robj = true)
    {
        let res = this.event.body?.toString(); 
        
        if (robj && this.event.body)
        {
            try
            {
                JSON.parse(this.event.body) 
            }
            catch(e)
            {
                throw "Body, request, parse error!"
            }
        }
        
        return res;
    }

    //#endregion

    //#region [Authorizer]

    cognitoAuthorizer() : CognitoAuthorizer|null
    {
        return this.apigAuthorizer;
    }

    //#endregion

    //#region [Response]

    responseCreate(data: any, statusCode = 200, headers = CORS_OBJ)
    {
        return {
            statusCode: statusCode,
            body: JSON.stringify(data) || "",
            headers: headers
        } as APIGatewayProxyResult;
    }

    //#endregion

    //#region [Util]

    logErro(err: any, apig: Request) 
    {
        console.error(">>> ERRO");

        console.error(__filename);
        console.error(apig.method());
        console.error(apig.path());
        console.error(err);
        // console.error("APIG Proxy Event => ", apig.event);

        console.error(">>> ERRO END");
    }

    //#endregion
}