export default interface IJwtEntity {
  primarysid: string;
  unique_name: string;
  email: string;
  country: string;
  avatar: string;
  groupsid: string;
  iss: string;
  type: string;
  aud: string;
  scope: string;
  iat: number;
  exp: number;
}
