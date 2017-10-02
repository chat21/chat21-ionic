export class MessageModel{
    constructor(
        public conversationId: string, 
        public recipient: string,
        public sender: string, 
        public sender_fullname: string,
        public status: string, 
        public text: string,
        public timestamp: string,
        public headerDate: string,
        public type: string
    ){ }
}