import { middyfy } from '../../../libs/lambda';

type Statement = {
  Action: string;
  Effect: string;
  Resource: string;
}
type PolicyDocument = {
  Version: string;
  Statement: Statement[]
}
type AuthResponse = {
  principalId: string,
  policyDocument: PolicyDocument;
  context?: Record<string, string>;
}

// Helper function to generate an IAM policy
var generatePolicy = function (principalId: string, effect?: string, resource?: string): AuthResponse {
  let policyDocument: PolicyDocument;

  if (effect && resource) {
    policyDocument = {
      Version: '2012-10-17',
      Statement: [{
        Action: 'execute-api:Invoke',
        Effect: effect,
        Resource: resource
      }]
    }
  }

  return {
    principalId,
    policyDocument
  };
}

const basicAuthorizer = async (event) => {
  try {
    console.log(event);
    let token = Buffer.from(event.authorizationToken.split(" ")[1], 'base64').toString();
    console.log(token);
    if (token === process.env.CREDENTIALS) {
      return generatePolicy('user', 'Allow', event.methodArn);
    } else {
      return generatePolicy('user', 'Deny', event.methodArn);
    }
  } catch(e) {
    console.log('Error happened during auth check', e);
    throw e;
  }
};

export const main = middyfy(basicAuthorizer);
