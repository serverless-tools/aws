import { 
    AttributeType, 
    AdminGetUserCommandOutput, 
} from "@aws-sdk/client-cognito-identity-provider";

import _find from "lodash/find";

export enum ECognitoUserStatus 
{
    UNCONFIRMED = "UNCONFIRMED", 
    CONFIRMED = "CONFIRMED", 
    ARCHIVED = "ARCHIVED", 
    COMPROMISED = "COMPROMISED", 
    UNKNOWN = "UNKNOWN", 
    RESET_REQUIRED = "RESET_REQUIRED",
    FORCE_CHANGE_PASSWORD = "FORCE_CHANGE_PASSWORD"
}

export class CognitoUser
{
    private adminGetUserCommandOutput?: AdminGetUserCommandOutput
    
    /** @var "2021-07-20T21:39:25.060Z" */
    userCreateDate?: Date 
    
    /** @var "2021-07-22T01:28:27.293Z" */
    userLastModifiedDate?: Date
    
    /** @var userStatus: UNCONFIRMED | CONFIRMED | ARCHIVED | COMPROMISED | UNKNOWN | RESET_REQUIRED | FORCE_CHANGE_PASSWORD */
    userStatus?: ECognitoUserStatus 
    
    /** @var sub "263ff5e6-5293-459e-8435-9765bce2b913" */
    userName?: string 

    userEnable?: boolean
    
    userAttributes?: AttributeType[]
    
    constructor(
        userAttributes?: AttributeType[], 
        adminGetUserCommandOutput?: AdminGetUserCommandOutput
    )
    {
        this.userAttributes = userAttributes || [];
        this.adminGetUserCommandOutput = adminGetUserCommandOutput;
        
        if(adminGetUserCommandOutput)
        {
            this.userAttributes = adminGetUserCommandOutput.UserAttributes;
            
            this.userName   = adminGetUserCommandOutput.Username;
            this.userStatus = adminGetUserCommandOutput.UserStatus as ECognitoUserStatus;
            this.userEnable = adminGetUserCommandOutput.Enabled;
            
            this.userCreateDate = adminGetUserCommandOutput.UserCreateDate;
            this.userLastModifiedDate = adminGetUserCommandOutput.UserLastModifiedDate;
        }
    }

    private _getAttr(key: string)
    {
        return _find(this.userAttributes, {Name: key} as any) || null;
    }

    sub() : string|undefined
    {
        const attr = this._getAttr("sub");
        
        if(attr) return attr.Value;
        return undefined;
    }

    email() : string|undefined
    {
        const attr = this._getAttr("email");
        
        if(attr) return attr.Value;
        return undefined;
    }

    name() : string|undefined
    {
        const attr = this._getAttr("name");
        
        if(attr) return attr.Value;
        return undefined;
    }
}