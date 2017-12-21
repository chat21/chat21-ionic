export class UserModel {
  constructor( 
    public uid: string,
    public email: string,
    public firstname: string,
    public lastname: string,
    public fullname: string,
    public imageurl: string
  ) { }
}
