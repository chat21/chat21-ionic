export class UserModel {
  constructor( 
    public uid: string,
    public email?: string,
    public firstname?: string,
    public lastname?: string,
    public fullname?: string,
    public imageurl?: string,
    public avatar?: string,
    public color?: string,
    public checked?: boolean,
    public online?: boolean,
    public decoded?: any
  ) { }
}
