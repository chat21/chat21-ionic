export class ConversationModel {
  constructor(
    public uid: string,
    public convers_with: string,
    public convers_with_fullname: string,
    public image: string,
    public is_new: boolean,
    public last_message_text: string,
    public sender: string,
    public sender_fullname: string,
    public status: string,
    public timestamp: string,
    public selected: boolean
  ) { }
}