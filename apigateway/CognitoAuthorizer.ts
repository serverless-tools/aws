import { APIGatewayEventDefaultAuthorizerContext } from 'aws-lambda'
import {PoolAdmin} from '../cognito/PoolAdmin';
import { CognitoUser } from '../cognito/CognitoUser';

export default class CognitoAuthorizer 
{
    // public api: CognitoAdminAPI;
    public authorizerAPIG: APIGatewayEventDefaultAuthorizerContext;
    public cognitoAdmin: PoolAdmin|null = null;

    constructor(authorizer: APIGatewayEventDefaultAuthorizerContext)
    {
        this.authorizerAPIG = authorizer;

        if(
            authorizer 
            && this.poolId() 
            && this.poolRegion()
        ) this.cognitoAdmin = new PoolAdmin(this.poolRegion() as string, this.poolId() as string);
    }

    public poolId() : string|undefined
    {
        return this.authorizerAPIG?.claims?.iss?.split("/").pop();
    }

    public poolRegion() : string|undefined
    {
        return this.authorizerAPIG?.claims?.iss?.split("/").pop().split("_")[0];
    }

    public sub() : string|undefined
    {
        return this.authorizerAPIG?.claims.sub;
    }

    public async email() : Promise<string|undefined>
    {
        let email = this.authorizerAPIG?.claims?.email; // Só existe quando o authorizador é token id (quando é access token não existe email em event.requestContext.authorizer)

        if(!email)
        {
            const user = await this.user();
            return user ? user.email() : undefined;
        }

        return email;
    }

    public groups() : string[]|undefined
    {
        return this.authorizerAPIG?.claims["cognito:groups"];
    }

    public userName() : string|undefined
    {
        return this.authorizerAPIG?.claims["cognito:username"];
    }

    public async user() : Promise<CognitoUser|undefined>
    {
        if(this.sub())
        {
            return await this.cognitoAdmin?.userGet(this.sub() as string);
        }

        return undefined;
    }
}

/**
 * @var idToken: APIGatewayEventDefaultAuthorizerContext
 * 
 * Exemplo real de APIGatewayEventDefaultAuthorizerContext, esse objeto é 
 * populado a partir do ID Token enviado no Header HTTP para o API Gateway.
 * 
 * @see https://aws.amazon.com/premiumsupport/knowledge-center/cognito-user-pool-group/
 * @see https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-integrate-with-cognito.html
 */
const idToken = 
{
    "claims": {
        "at_hash": "Rib4pBdyrPq-8zbUOKvsBg",
        "sub": "e8564abc-fe60-401f-ade7-121bed3cc69f",
        "cognito:groups": "us-east-2_QbOWouBAQ_Google",
        "email_verified": "false",
        "iss": "https://cognito-idp.us-east-2.amazonaws.com/us-east-2_QbOWouBAQ",
        "cognito:username": "google_114395517289418350426",
        "nonce": "EnEPhcLv2ABY27Uqlncv5OT5Zp1Z30687SWAeVy4-qBJMy_FiCkYxGMs3SdZrZcbFlzusEvJENZzHEYQ6Tc2l3LiFnlQ8jhWa2i9LgtpxDiDVdjmmst4o1o5IezSwZrjnuX_a8W00A_L6WRgnw7h1Wd6gtDypwVRQLa84LwBo6o",
        "picture": "{\"data\":{\"height\":50,\"is_silhouette\":false,\"url\":\"https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=2978815455544486&height=50&width=50&ext=1614570542&hash=AeTcvQykwViQEAOOsA0\",\"width\":50}}",
        "aud": "3ifpvs76g06vh7mjj8jcgfgg3u",
        "identities": "{\"dateCreated\":\"1611978518907\",\"userId\":\"114395517289418350426\",\"providerName\":\"Google\",\"providerType\":\"Google\",\"issuer\":null,\"primary\":\"true\"},{\"dateCreated\":\"1611978531010\",\"userId\":\"2978815455544486\",\"providerName\":\"Facebook\",\"providerType\":\"Facebook\",\"issuer\":null,\"primary\":\"false\"}",
        "token_use": "id",
        "auth_time": "1611978545",
        "name": "Alexandre Santos",
        "exp": "Sat Jan 30 04:49:05 UTC 2021",
        "iat": "Sat Jan 30 03:49:05 UTC 2021",
        "email": "alsantos123@gmail.com"
    }
}

/**
 * @var accessToken: APIGatewayEventDefaultAuthorizerContext
 * 
 * Exemplo real de APIGatewayEventDefaultAuthorizerContext, esse objeto é 
 * populado a partir do AccessToken enviado no Header HTTP para o API Gateway.
 */ 
const accessToken = 
{
    "claims": {
      "sub": "263ff5e6-5293-459e-8435-9765bce2b913",
      "cognito:groups": "ADMIN",
      "iss": "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_qNT47SSMi",
      "version": "2",
      "client_id": "2t6b45u2apqrjjcv6cg9lk7gsg",
      "origin_jti": "24779de6-8e22-4547-bcca-bb89e510c5ce",
      "token_use": "access",
      "scope": "openid email",
      "auth_time": "1627142412",
      "exp": "Sun Jul 25 12:55:12 UTC 2021",
      "iat": "Sun Jul 25 11:55:12 UTC 2021",
      "jti": "28a4fc9e-0c45-427c-8cfe-0fd75fdc9801",
      "username": "263ff5e6-5293-459e-8435-9765bce2b913"
    }
}