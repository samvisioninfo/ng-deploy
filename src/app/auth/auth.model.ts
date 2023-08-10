export class APIResponse<T> {
  constructor(
      public message: string = null,
      public statusCode: number = null,
      public response: T = null,
  ){}
}

export class loginResponse {
  constructor(
    public memberId: any | null = null,
    public firstName: string | null = null,
    public lastName: string | null = null,
    public email: string | null = null,
    public password: any | null = null,
    public zipCode: number | null = null,
    public addressName: string | null = null,
    public description: string | null = null,
    public images: Array<string> = [],
    public googleToken: string | null = null,
    public dateCreated: string | null = null,
    public memberAvatar: string | null = null,
    public refreshToken: string | null = null,
    public accessToken: string | null = null,
  ) {}
}

export class AuthenticateRequest {
  constructor(
    public IdToken: string | null = null
  ){}
}

export class registerObj {
  constructor(
    public firstName : string | null = null,
    public lastName : string | null = null,
    public zipCode : number | null = null,
    public googleToken : string | null = null,
    public email : string | null = null,
    public photoUrl : string | null = null
  ){}
}
