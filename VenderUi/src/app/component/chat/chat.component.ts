import { Component, OnInit, OnDestroy, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription, forkJoin } from 'rxjs';
import { ChatService } from '../../services/chat.service';
import { LoginService } from '../../services/login.service';
import { ToastrService } from 'ngx-toastr';

interface Contact {
  userId: number;
  venderCode?: string;
  email?: string;
  status?: string;
  lastSeen?: string | null;
  unreadCount?: number;

  isBlocked: boolean;
  isBlockedYou: boolean;

  isOnline?: boolean;
}

interface Message {
  messageId?: number;
  senderId: number;
  receiverId: number;
  messageText: string;
  createdAt?: string;
    isSent?: number;       
  isDelivered?: number; 
  isSeen?: number;      
  status?: string;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})



export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {

  contacts: Contact[] = [];
  messages: Message[] = [];
  selectedContact?: Contact;
typingUsers: { [userId: number]: boolean } = {};
typingTimeouts: { [userId: number]: any } = {};
  chatForm!: FormGroup;
  userId!: number;
  showMenu = false;
showEmojiPicker = false;
  blockedUserIds: number[] = [];

  private subscriptions: Subscription[] = [];
  private notificationShown = false;

  @ViewChild('messageContainer') messageContainer!: ElementRef;

  constructor(
    
    private chatService: ChatService,
    private loginService: LoginService,
    private fb: FormBuilder,
    
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {

    this.userId = this.loginService.getUserId();

    this.chatForm = this.fb.group({
      messageText: ['', Validators.required]
    });

    this.loadContacts();
  }
addEmoji(event: any) {

  const emoji = event.emoji.native;

  const currentText = this.chatForm.value.messageText || '';

  this.chatForm.patchValue({
    messageText: currentText + emoji
  });

}



  // ================= LOAD CONTACTS =================

 loadContacts() {

  forkJoin({
    contacts: this.chatService.getContacts(this.userId),
    blocked: this.chatService.getBlockedUsers(this.userId)
  }).subscribe(({ contacts, blocked }) => {

    this.contacts = contacts
      .filter((c: Contact) => c.userId !== this.userId)
      .map((c: Contact) => {

        const isBlocked = blocked.some((b: any) =>
          b.userId === this.userId && b.blockedUserId === c.userId
        );

        const isBlockedYou = blocked.some((b: any) =>
          b.userId === c.userId && b.blockedUserId === this.userId
        );

        return {
          ...c,
          unreadCount: c.unreadCount || 0,
          status: isBlocked ? 'Blocked' : (c.status || 'Offline'),
          isBlocked,
          isBlockedYou,
          isOnline: false
        };
      });


  this.loadOfflineNotifications();

    this.listenEvents();
  });

}
  
listenEvents() {


  const msgSub = this.chatService.onMessageReceived().subscribe(msg => {

    if (!msg || msg.senderId === this.userId) return;

    const contact = this.contacts.find(c => c.userId === msg.senderId);
    if (!contact || contact.isBlocked || contact.isBlockedYou) return;

    
    if (this.selectedContact?.userId === msg.senderId) {

      this.messages.push(msg);

      setTimeout(() => this.scrollBottom(), 50);

  
      if (msg.messageId) {
        this.chatService
          .markSeen(msg.messageId, this.userId, msg.senderId)
          .subscribe();
      }

    } 
    else {

      contact.unreadCount = (contact.unreadCount || 0) + 1;

      this.toastr.info(
        `New message from ${contact.venderCode || contact.email || 'User'}`
      );

    }

  });

  this.subscriptions.push(msgSub);




  const statusSub = this.chatService.onMessageStatusUpdated().subscribe(update => {

   
    if (update.messageId) {

      const msg = this.messages.find(m => m.messageId === update.messageId);

      if (msg) {
        msg.status = update.status;
      }

    }

    if (update.receiverId) {

      this.messages.forEach(m => {

        if (
          m.senderId === this.userId &&
          m.receiverId === update.receiverId &&
          m.status === 'Sent'
        ) {
          m.status = 'Delivered';
        }

      });

    }

  });

  this.subscriptions.push(statusSub);

const typingSub = this.chatService.onUserTyping().subscribe(data => {
  const { senderId } = data;
  if (senderId !== this.userId) {
    this.typingUsers[senderId] = true;

   
    if (this.typingTimeouts[senderId]) {
      clearTimeout(this.typingTimeouts[senderId]);
    }

    this.typingTimeouts[senderId] = setTimeout(() => {
      this.typingUsers[senderId] = false;
    }, 1000);
  }
});

this.subscriptions.push(typingSub);

  // ================= MESSAGE SEEN =================
  const seenSub = this.chatService.onMessageSeen().subscribe(update => {

    const msg = this.messages.find(m => m.messageId === update.messageId);

    if (msg) {
      msg.status = 'Seen';
    }

  });

  this.subscriptions.push(seenSub);



  // ================= USER STATUS =================
  const userStatusSub = this.chatService.onUserStatusChanged().subscribe(update => {

    const contact = this.contacts.find(c => c.userId === update.userId);

    if (!contact) return;

    if (contact.isBlocked || contact.isBlockedYou) {

      contact.status = 'Blocked';
      contact.lastSeen = undefined;
      contact.isOnline = false;

      return;

    }

    contact.status = update.status;
    contact.lastSeen = update.status === "Offline" ? update.lastSeen : undefined;
    contact.isOnline = update.status === 'Online';

   
    if (update.status === 'Online') {

      this.messages.forEach(m => {

        if (
          m.senderId === this.userId &&
          m.receiverId === update.userId &&
          m.status === 'Sent'
        ) {
          m.status = 'Delivered';
        }

      });

    }

  });

  this.subscriptions.push(userStatusSub);



  // ================= ONLINE USERS =================
  const onlineUsersSub = this.chatService.onOnlineUsers().subscribe((users: number[]) => {

    this.contacts.forEach(contact => {

      if (contact.isBlocked || contact.isBlockedYou) {

        contact.status = 'Blocked';
        contact.lastSeen = undefined;
        contact.isOnline = false;
        return;

      }

      if (users.includes(contact.userId)) {

        contact.status = 'Online';
        contact.lastSeen = undefined;
        contact.isOnline = true;

      } 
      else {

        contact.isOnline = false;

        if (contact.lastSeen) {
          contact.status = 'last seen ' + this.formatLastSeen(contact.lastSeen);
        } 
        else {
          contact.status = 'Offline';
        }

      }

    });

  });

  this.subscriptions.push(onlineUsersSub);



  // ================= BLOCK EVENT =================
  const blockSub = this.chatService.onBlockEvent().subscribe((data: any) => {

    const { userId, blockedUserId, isBlocked } = data;

    // maine block kiya
    if (userId === this.userId) {

      const contact = this.contacts.find(c => c.userId === blockedUserId);

      if (contact) {

        contact.isBlocked = isBlocked;

        if (isBlocked) {

          contact.status = 'Blocked';
          this.messages = [];

        } 
        else {

          contact.status = 'Offline';

        }

      }

    }


    if (blockedUserId === this.userId) {

      const contact = this.contacts.find(c => c.userId === userId);

      if (contact) {

        contact.isBlockedYou = isBlocked;

        if (isBlocked) {

          contact.status = 'Blocked';
          contact.lastSeen = undefined;

          if (this.selectedContact?.userId === userId) {
            this.messages = [];
          }

        }

      }

    }

  });

  this.subscriptions.push(blockSub);



  // ================= NOTIFICATIONS =================
  const notificationSub = this.chatService.onNotifications().subscribe((notifications: any[]) => {

    if (!notifications) return;

   notifications.forEach(n => {

  const contact = this.contacts.find(c => c.userId === n.senderId);

  if (contact) {
    contact.unreadCount = (contact.unreadCount || 0) + 1;

    this.toastr.info(
      `New message from ${contact.venderCode || contact.email || 'User'}`
    );
  }

});
  });

  this.subscriptions.push(notificationSub);

}
onInputChange() {
  if (!this.selectedContact) return;
  this.chatService.sendTyping(this.selectedContact.userId);
}
loadOfflineNotifications() {
  this.chatService.getNotifications(this.userId)
    .subscribe((notifications: any[]) => {
      if (!notifications || notifications.length === 0) return;

    
      this.contacts.forEach(c => c.unreadCount = 0);

 
      const unreadContacts: string[] = [];

      notifications.forEach(n => {
        const contact = this.contacts.find(c => c.userId === n.senderId);
        if (contact) {
          contact.unreadCount = (contact.unreadCount || 0) + 1;
    
          const name = contact.venderCode || contact.email || 'User';
          if (!unreadContacts.includes(name)) {
            unreadContacts.push(name);
          }
        }
      });

      {
        const contactList = unreadContacts.join(', ');
        this.toastr.info(
          `You have ${notifications.length} message${notifications.length > 1 ? 's' : ''} from: ${contactList}`
        );
      }
    });
}

selectContact(contact: Contact) {

  this.selectedContact = contact;
  contact.unreadCount = 0;

  if (contact.isBlocked || contact.isBlockedYou) {
    this.messages = [];
    return;
  }

  this.chatService.getMessages(this.userId, contact.userId)
    .subscribe(res => {

      this.messages = (res || []).map((m: any) => {

       
        if (m.receiverId === this.userId && !m.isSeen) {

          this.chatService
            .markSeen(m.messageId, this.userId, m.senderId)
            .subscribe();

          m.isSeen = 1;
        }

        return this.getMessageObject(m);
      });

      setTimeout(() => this.scrollBottom(), 100);

    });

}

getMessageObject(
  m: any,
  senderId?: number,
  receiverId?: number,
  text?: string
): Message {
  debugger;


  const mySenderId = senderId ?? m.senderId;
  const myReceiverId = receiverId ?? m.receiverId;


  const isSent = m?.isSent ?? 0;
  const isDelivered = m?.isDelivered ?? 0;
  const isSeen = m?.isSeen ?? 0;


  let status: 'Sent' | 'Delivered' | 'Seen' = 'Sent';

  if (isSeen === 1) {
    status = 'Seen';
  } else if (isDelivered === 1) {
    status = 'Delivered';
  } else if (isSent === 1) {
    status = 'Sent';
  }

  const messageObj: Message = {
    messageId: m?.messageId,
    senderId: mySenderId,
    receiverId: myReceiverId,
    messageText: text ?? m.messageText,
    createdAt: m?.createdAt ?? new Date().toISOString(),
    isSent,
    isDelivered,
    isSeen,
    status 
  };

  return messageObj;
}

sendMessage() {
  if (!this.selectedContact || this.selectedContact.isBlocked || this.selectedContact.isBlockedYou) {
    this.toastr.error("Cannot send message. User is blocked.");
    return;
  }

  const text = this.chatForm.value.messageText?.trim();
  if (!text) return;

  this.chatService.sendMessage(this.userId, this.selectedContact.userId, text)
    .subscribe((res: any) => {
      const msgObj = this.getMessageObject(res, this.userId, this.selectedContact!.userId, text);
      this.messages.push(msgObj);
      this.chatForm.reset();
      this.scrollBottom();
    });
}
  toggleBlockUser() {

    if (!this.selectedContact) return;

    this.chatService.blockUser(this.userId, this.selectedContact.userId)
      .subscribe((res: any) => {

        this.selectedContact!.isBlocked = res.isBlocked ?? !this.selectedContact!.isBlocked;

        if (res.isBlocked) {

          this.toastr.error('User Blocked');

          this.selectedContact!.status = 'Blocked';

          this.messages = [];

        } else {

          this.toastr.success('User Unblocked');

        }

        this.showMenu = false;

      });

  }




  formatLastSeen(lastSeen?: string): string {

  if (!lastSeen) return 'Offline';

  const date = new Date(lastSeen);
  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (msgDate.getTime() === today.getTime()) {
    return `last seen today at ${time}`;
  }

  if (msgDate.getTime() === yesterday.getTime()) {
    return `last seen yesterday at ${time}`;
  }

  return `last seen ${date.toLocaleDateString()} at ${time}`;
}

  ngAfterViewChecked(): void {

    this.scrollBottom();

  }


  scrollBottom() {

    try {

      if (this.messageContainer) {

        const container = this.messageContainer.nativeElement;

        container.scrollTop = container.scrollHeight;

      }

    } catch { }

  }


  toggleMenu() {

    this.showMenu = !this.showMenu;

  }


  ngOnDestroy() {

    this.subscriptions.forEach(s => s.unsubscribe());

  }

}
