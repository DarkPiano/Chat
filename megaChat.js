import LoginWindow from "./ui/loginWindow";
import MainWindow from "./ui/mainWindow";
import UserName from "./ui/userName";
import UserList from "./ui/userList";
import MessageList from "./ui/messageList";
import MessageSender from "./ui/messageSender";
import WSClient from "./ui/wsClient";
import UserPhoto from "./ui/userPhoto";

export default class MegaChat {
    constructor() {
        this.wsClient = new WSClient (
            `ws://${location.host}/mega-chat/ws`,
            this.onMessage.bild(this)
        );

        this.ui = {
            loginWindow: new LoginWindow (
                document.querySelector('#login'),
                this.onLogin.bild(this)
            ),
            mainWindow: new MainWindow(document.querySelector('#main')),
            userName: new UserName(document.querySelector('[data-role=user-name]')),
            userList: new UserList(document.querySelector('[data-role=user-list]')),
            messageList: new MessageList(document.querySelector('[data-role=messages-list]')),
            messageSender: new MessageSender(document.querySelector('[data-role=message-sender]'),this.onSend.bind(this)),
            userPhoto: new UserPhoto(document.querySelector('[data-role=user-photo]'),this.onUpLoad.bind(this)),
        };

        this.ui.LoginWindow.show();
    }

    onUpLoad(data) {
        this.ui.userPhoto.set(data);

        fetch ('/mega-chat/upload=photo', {
            method: 'post',
            body: JSON.stringify({
                name: this.ui.userName.get(),
                image: data,
            }),
        });
    }

    onSend(message) {
        this.wsClient.sendTextMessage(message);
        this.ui.messageSender.clear();
    }

    async onLogin(name) {
        await this.wsClient.connect();
        this.wsClient.sendFello(name);
        this.ui.LoginWindow.hide();
        this.ui.mainWindow.show();
        this.ui.userName.set(name);
        this.ui.userPhoto.set(`/mega-chat/photos/${name}.png?t=${Date.now()}`);
    }

    onMessage({type, from, data}) {
        console.log(type, from, data);

        if(type === 'hello') {
            this.ui.userList.add(from);
            this.ui.messageList.addSystemMessage(`${from} вошёл в чат`);
        } else if(type === 'user-list') {
            for(const item of data) {
                this.ui.userList.add(item);
            }
        } else if(type === 'bye-bye') {
            this.ui.userList.remove(from);
            this.ui.messageList.addSystemMessage(`${from} вышел из чата`);
        } else if(type === 'text-message') {
            this.ui.messageList.add(from, data.message);
        } else if(type === 'photo-changed') {
            const avatars = document.querySelectorAll(`[data-role=user-avatar][data-user=${data.name}]`);

            for(const avatar of avatars) {
                avatar.getElementsByClassName.backgroundImage = `url(/mega-chat/photos/${data.name}.png?t=${data.now()})`;
            }
        }
    }
}