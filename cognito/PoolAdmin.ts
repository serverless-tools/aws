
import { 
	CognitoIdentityProviderClient, 

	GetUserCommand, 
	ListUsersCommand, ListUsersCommandInput,
	ListUsersInGroupCommand, 

	AdminGetUserCommand, 
	AdminListGroupsForUserCommand, 
	
	AdminCreateUserCommand, 
	AdminAddUserToGroupCommand,
} from "@aws-sdk/client-cognito-identity-provider";

import _intersection from "lodash/intersection";
import _isArray from "lodash/isArray";

import {CognitoUser} from "./CognitoUser";

// TODO: revisar perante o CognitoAPI.php e usar os mesmos nomes
export class PoolAdmin
{
	private poolId: string;
	private cognito : CognitoIdentityProviderClient;
	private lstGrupos: string[]|null = null;

	constructor(region: string, poolId: string)
	{
		this.cognito = new CognitoIdentityProviderClient({region: region});
		this.poolId  = poolId;
	}

	//
	//#region [Usuario(s) read]
	//
	async usersStartsWith(email?: string)
	{
		const params = {UserPoolId: this.poolId} as ListUsersCommandInput;

		if(email) params.Filter = `email ^= "${email}"`;
		
		const cmd = new ListUsersCommand(params);
		return await this.cognito.send(cmd);
	}

	async usersFromGroup(name: string)
	{
		const cmd = new ListUsersInGroupCommand({UserPoolId: this.poolId, GroupName: name})
		return await this.cognito.send(cmd);
	}

	async userGet(username: string)
	{
		const cmd = new AdminGetUserCommand({UserPoolId: this.poolId, Username: username})
		const user = await this.cognito.send(cmd);
		
		if(user) return new CognitoUser(user.UserAttributes, user);
	}

	async userGetByAccessToken(accessToken: string)
	{
		// Precisa de aws.cognito.signin.user.admin scope (https://stackoverflow.com/questions/53149091/what-does-the-aws-cognito-signin-user-admin-scope-mean-in-amazon-cognito)
		const cmd = new GetUserCommand({AccessToken: accessToken})
		return await this.cognito.send(cmd);
	}

	async userGroups(username: string) 
	{
		// if( _isArray(this.lstGrupos) ) return this.lstGrupos;

		const cmd = new AdminListGroupsForUserCommand({UserPoolId: this.poolId, Username: username});
		const groups = await this.cognito.send(cmd);

		if(!groups.Groups?.length) return [];
		this.lstGrupos = groups.Groups.map(g => g.GroupName) as string[];

		return this.lstGrupos;
	}

	async userHasGroups(username: string, groups: string[])
	{
		const lstUserGrupos = await this.userGroups(username);

		if(!lstUserGrupos?.length) return false;

		return _intersection(lstUserGrupos, groups).length;
	}

	//#endregion

	//
	//#region [Usuario Add/Edit]
	//

	async userCreate(email: string)
	{
		const cmd = new AdminCreateUserCommand({
			UserPoolId: this.poolId,
			Username: email,
			UserAttributes: [
				{
					Name: "email", 
					Value: email
				}, 
				{
					Name: 'email_verified',
					Value: 'true'
				}
			]
		});

		return await this.cognito.send(cmd);
	}

	async userGroupAdd(username: string, group: string)
	{
		const cmd = new AdminAddUserToGroupCommand({
			UserPoolId: this.poolId,
			Username: username,
			GroupName: group
		});

		return await this.cognito.send(cmd);
	}

	//#endregion
}