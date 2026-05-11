import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import * as signalR from '@microsoft/signalr';
import { ChatApi } from '../Constants/api-constants';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  public hubConnection!: signalR.HubConnection;
  private typingSubject = new Subject<{ senderId: number; isTyping: boolean }>();
  private messageReceivedSubject = new Subject<any>();
  private userStatusChangedSubject = new Subject<{ userId: number; status: string; lastSeen?: string }>();
  private onlineUsersSubject = new BehaviorSubject<number[]>([]);
  private messageStatusSubject = new Subject<any>();
  private messageSeenSubject = new Subject<any>();
  private blockEventSubject = new Subject<any>();
  private notificationsSubject = new Subject<any[]>();

  constructor(
    private http: HttpClient,
    private loginService: LoginService
  ) { }


  startConnection(): Promise<void> {
    const token = this.loginService.getToken();
    const userId = this.loginService.getUserId();

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${ChatApi.hubUrl}?userId=${userId}`, {
        accessTokenFactory: () => token || ''
      })
      .withAutomaticReconnect()
      .build();


    this.hubConnection.on('ReceiveMessage', (msg) => {
      this.messageReceivedSubject.next(msg);
      this.hubConnection.invoke("Delivered", msg.messageId, msg.senderId, msg.receiverId);
    });

    this.hubConnection.on('UserStatusChanged', (status) => {
      this.userStatusChangedSubject.next(status);
    });
    this.hubConnection.on('OnlineUsers', (users) => {
      this.onlineUsersSubject.next(users);
    });

    this.hubConnection.on('MessageStatusUpdated', (data) => {
      this.messageStatusSubject.next(data);
    });
this.hubConnection.on('UserTyping', (senderId: number) => {
  this.typingSubject.next({ senderId, isTyping: true });
});
    this.hubConnection.on('MessageSeen', (data) => {
      this.messageSeenSubject.next(data);
    });

    this.hubConnection.on('BlockEvent', (data) => {
      this.blockEventSubject.next(data);
    });
    this.hubConnection.on('ReceiveNotifications', (notifications) => {
      this.notificationsSubject.next(notifications);
    });
    return this.hubConnection.start()
      .then(() => console.log('SignalR Connected'))
      .catch(err => console.error('SignalR Connection Error:', err));
  }

  stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop()
        .then(() => console.log('SignalR Disconnected'))
        .catch(err => console.error('SignalR Stop Error:', err));

    }
  }
onUserTyping(): Observable<{ senderId: number; isTyping: boolean }> {
  return this.typingSubject.asObservable();
}
sendTyping(receiverId: number) {
  if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
    this.hubConnection.invoke('Typing', this.loginService.getUserId(), receiverId)
      .catch(err => console.error('Typing error:', err));
  }
}

  blockUser(userId: number, blockedUserId: number): Observable<any> {
    return this.http.post<any>(ChatApi.blockUser, { userId, blockedUserId });
  }

  getBlockedUsers(userId: number): Observable<any> {
    console.log("Current UserId:", userId);
    return this.http.get<any>(`${ChatApi.GetblockUser}?userId=${userId}`);
  }

  onBlockEvent(): Observable<any> {
    return this.blockEventSubject.asObservable();
  }


  sendMessage(senderId: number, receiverId: number, messageText: string): Observable<any> {
    return this.http.post(ChatApi.sendMessage, { senderId, receiverId, messageText });
  }

  getMessages(user1: number, user2: number): Observable<any> {
    return this.http.get<any>(ChatApi.getMessages(user1, user2));
  }

  getContacts(userId: number): Observable<any> {
    return this.http.get<any>(ChatApi.getContacts(userId));
  }

  markSeen(messageId: number, receiverId: number, senderId: number): Observable<any> {
    return this.http.post(
      `${ChatApi.markSeen}?messageId=${messageId}&receiverId=${receiverId}&senderId=${senderId}`,
      {}
    );
  }

  getNotifications(userId: number): Observable<any> {
    return this.http.get(ChatApi.getNotifications(userId));
  }
  onNotifications(): Observable<any[]> {
    return this.notificationsSubject.asObservable();
  }
  onMessageReceived(): Observable<any> {
    return this.messageReceivedSubject.asObservable();
  }

  onUserStatusChanged(): Observable<any> {
    return this.userStatusChangedSubject.asObservable();
  }

  onOnlineUsers(): Observable<number[]> {
    return this.onlineUsersSubject.asObservable();
  }

  onMessageStatusUpdated(): Observable<any> {
    return this.messageStatusSubject.asObservable();
  }

  onMessageSeen(): Observable<any> {
    return this.messageSeenSubject.asObservable();
  }
}