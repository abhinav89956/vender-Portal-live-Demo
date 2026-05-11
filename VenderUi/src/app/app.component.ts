import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { LoginService } from './services/login.service';
import { ChatService } from './services/chat.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  title = 'VenderUi';
  showSidebar = false;
  showTopNavbar = false;
  venderCode = '';

  private subscriptions: Subscription[] = [];
  private signalRStarted = false;
  private hideLayoutRoutes: string[] = ['', '/', '/login', '/signup', '/forget'];

  constructor(
    private router: Router,
    private loginService: LoginService,
    private chatService: ChatService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
   
    
    this.subscriptions.push(
      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe((event: any) => {
          const currentUrl = event.urlAfterRedirects.toLowerCase();
          const hide = this.hideLayoutRoutes.includes(currentUrl);

          this.showSidebar = !hide;
          this.showTopNavbar = !hide;
          this.venderCode = this.loginService.getVenderCode() || 'Admin';

          
          if (this.loginService.isLoggedIn() && !this.signalRStarted) {
          
            this.signalRStarted = true;

            this.chatService.startConnection().then(() => {
              console.log('SignalR Connected');
            }).catch(err => console.error('SignalR Connection Error:', err));
          }
        })
    );
  }

  // Logout
  logout() {
    if (this.loginService.isLoggedIn()) {
      this.toastr.success('Logged out successfully');
      this.chatService.stopConnection(); // mark offline
      this.loginService.logout();
      this.router.navigate(['/login']);
    }
  }

  // Before browser refresh/close
  @HostListener('window:beforeunload', ['$event'])
  beforeUnload(event: Event) {
    this.chatService.stopConnection();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}