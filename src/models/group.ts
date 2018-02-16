export class GroupModel{
    constructor(
        public uid: string,
        public createdOn: any,
        public iconURL: string,
        public members: any[],
        public name: string, 
        public owner: string
    ){ }
}